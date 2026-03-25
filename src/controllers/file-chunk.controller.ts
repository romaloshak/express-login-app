import type { Response } from 'express';
import type { AuthRequest } from '../middelwares/auth.middleware.js';
import * as FileChunkService from '../services/file-chunk.service.js';
import { getUploadStatusFromDb } from '../services/file-chunk.service.js';
import { mergeFiles } from '../utils/mergeFiles.js';

export const initFileChunk = async (req: AuthRequest, res: Response) => {
	try {
		const {
			body: { file },
		} = req;

		if (!file) {
			return res.status(400).json({ message: 'Файл не загружен' });
		}

		const result = await FileChunkService.initFileUploadingInDb(file);
		res.status(201).json(result);
	} catch (_error) {
		res.status(500).json({ error: 'Upload failed' });
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
			// 1. Сначала отвечаем клиенту, чтобы он не "висел"
			await FileChunkService.updateMergeStatusInDb('processing', uploadId);
			res.status(200).json({ status: 'processing', message: 'Файл получен, идет сборка' });

			// 2. Запускаем склейку в "фоне"
			// Мы не используем await перед самой функцией в роуте,
			// чтобы не блокировать ответ, но обрабатываем ошибки внутри самой функции
			mergeFiles(uploadId, stored_name, total_chunks)
				.then(async () => {
					await FileChunkService.updateMergeStatusInDb('completed', uploadId);
				})
				.catch(async (_err) => {
					await FileChunkService.updateMergeStatusInDb('error', uploadId);
				});
		} else {
			res.status(200).json({ status: 'uploading', progress });
		}
	} catch (_error) {
		res.status(500).json({ error: 'Upload failed' });
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

		// Если статус 'completed', можем сразу отдать ссылку на скачивание
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
