import type { Response } from 'express';
import type { AuthRequest } from '../middelwares/auth.middleware.js';
import * as FileChunkService from '../services/file-chunk.service.js';
import { getUploadStatusFromDb, type initRecordType } from '../services/file-chunk.service.js';
import type { UploadChunkStatus } from '../types/File.type.js';
import { mergeFiles } from '../utils/mergeFiles.js';

const ALLOWED_UPLOAD_STATUSES: UploadChunkStatus[] = ['uploading', 'processing', 'completed', 'error'];

const setUploadStatus = async (uploadId: string, status: UploadChunkStatus) => {
	return FileChunkService.updateMergeStatusInDb(status, uploadId);
};

export const initFileChunk = async (req: AuthRequest, res: Response) => {
	try {
		const file = JSON.parse(req.body.file) as unknown as initRecordType;

		if (!file) {
			return res.status(400).json({ message: 'Файл не загружен' });
		}
		const result = await FileChunkService.initFileUploadingInDb(file);
		res.status(201).json(result);
	} catch (_error) {
		res.status(500).json({ error: 'Upload failed' });
	}
};

export const updateMergeStatus = async (req: AuthRequest, res: Response) => {
	try {
		const uploadId = req.body?.uploadId as string | undefined;
		const status = req.body?.status as UploadChunkStatus | undefined;

		if (!uploadId) {
			return res.status(400).json({ error: 'uploadId не найден' });
		}
		if (!status || !ALLOWED_UPLOAD_STATUSES.includes(status)) {
			return res.status(400).json({ error: 'Некорректный статус' });
		}

		const result = await setUploadStatus(uploadId, status);
		if (!result) {
			return res.status(404).json({ error: 'Загрузка не найдена' });
		}

		return res.status(200).json(result);
	} catch (_error) {
		res.status(500).json({ error: 'updateMergeStatusInDb failed' });
	}
};

export const uploadFileChunk = async (req: AuthRequest, res: Response) => {
	try {
		const {
			file,
			body: { uploadId, chunk_index, stored_name },
		} = req;

		if (!file) {
			return res.status(400).json({ message: 'Файл не загружен' });
		}

		const { total_chunks, progress, isComplete } = await FileChunkService.uploadChunkInDb(uploadId, {
			chunk_index,
			stored_name,
		});

		if (isComplete) {
			await setUploadStatus(uploadId, 'processing');
			res.status(200).json({ status: 'processing', message: 'Файл получен, идет сборка' });

			mergeFiles(uploadId, stored_name, total_chunks)
				.then(async () => {
					await setUploadStatus(uploadId, 'completed');
				})
				.catch(async (_err) => {
					await setUploadStatus(uploadId, 'error');
				});
		} else {
			res.status(200).json({ status: 'uploading', progress });
		}
	} catch (_error) {
		res.status(500).json({ error: _error });
	}
};

export const getUploadStatus = async (req: AuthRequest, res: Response) => {
	try {
		const uploadId = req.params.id as string;

		if (!uploadId) {
			return res.status(400).json({ error: 'uploadId не найден' });
		}

		const statusData = await getUploadStatusFromDb(uploadId);

		if (!statusData) {
			return res.status(404).json({ error: 'Загрузка не найдена' });
		}

		const response = {
			status: statusData.status,
			fileName: statusData.file_name,
			progress: statusData.progress,
			isReady: statusData.status === 'completed',
		};

		res.json(response);
	} catch (_error) {
		res.status(500).json({ error: 'Ошибка при получении статуса' });
	}
};
