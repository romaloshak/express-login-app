import type { Response } from 'express';
import type { AuthRequest } from '../middelwares/auth.middleware.js';
import * as FileService from '../services/file.service.js';

const SIMPLE_UPLOAD_MAX_BYTES = 10 * 1024 * 1024;

export const uploadFile = async (req: AuthRequest, res: Response) => {
	try {
		const userId = req.user?.userId;

		if (!userId) {
			return res.status(404).json({ message: 'userId error' });
		}

		const file = req.file;

		if (!file) {
			return res.status(400).json({ message: 'Файл не загружен' });
		}

		if (file.size >= SIMPLE_UPLOAD_MAX_BYTES) {
			return res.status(413).json({
				message: 'Файлы от 10 МБ загружайте по чанкам: /chunk/init-chunk и /chunk/upload-chunk.',
			});
		}

		const newFile = await FileService.uploadFileInDb({
			user_id: userId,
			mime_type: file.mimetype,
			size: file.size,
			stored_name: file.filename,
			original_name: file.originalname,
			path: file.path,
		});

		return res.status(200).json(newFile);
	} catch (_error) {
		res.status(500).json({ error: 'Upload failed' });
	}
};

export const getFile = async (req: AuthRequest, res: Response) => {
	try {
		const id = req.params.id as string;
		if (!id) {
			return res.status(400).json({ message: 'fileId error' });
		}

		const file = await FileService.findFileById(id);

		return res.status(200).json(file);
	} catch (_error) {
		res.status(500).json({ error: 'get file failed' });
	}
};

export const getUserFiles = async (req: AuthRequest, res: Response) => {
	try {
		const userId = req.user?.userId;
		if (!userId) {
			return res.status(400).json({ message: 'userId error' });
		}

		const files = await FileService.findUserFiles(userId);

		return res.status(200).json(files);
	} catch (_error) {
		res.status(500).json({ error: 'getUserFiles error' });
	}
};

export const removeFile = async (req: AuthRequest, res: Response) => {
	try {
		const id = req.params.id as string;

		if (!id) {
			return res.status(400).json({ message: 'id error' });
		}

		const file = await FileService.removeFileFromDb(id);

		return res.status(200).json(file);
	} catch (_error) {
		res.status(500).json({ error: 'removeFile error' });
	}
};
