import { randomBytes } from 'crypto';
import type { NextFunction, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import { env } from '../utils/env.types.js';

const ALLOWED_TYPES = [
	'image/jpeg',
	'image/png',
	'image/gif',
	'image/webp',
	'video/mp4',
	'video/webm',
	'application/pdf',
];

const storage = multer.diskStorage({
	destination: (_req, _file, cb) => {
		cb(null, env.UPLOAD_DIR);
	},
	filename: (_req, file, cb) => {
		const uniqueSuffix = `${Date.now()}-${randomBytes(8).toString('hex')}`;
		const ext = path.extname(file.originalname);
		cb(null, `${uniqueSuffix}${ext}`);
	},
});

const fileFilter = (_req: unknown, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
	if (ALLOWED_TYPES.includes(file.mimetype)) {
		cb(null, true);
	} else {
		cb(new Error(`Недопустимый тип файла: ${file.mimetype}`));
	}
};

const uploadConfig = {
	storage,
	fileFilter,
	limits: {
		fileSize: env.MAX_FILE_SIZE,
	},
};

export const uploadSingle = multer(uploadConfig).single('file');
export const uploadArray = multer(uploadConfig).array('files', 10);
export const uploadFields = multer(uploadConfig).fields([
	{ name: 'images', maxCount: 5 },
	{ name: 'documents', maxCount: 3 },
]);

export const uploadAny = multer(uploadConfig).any();

export const handleUpload = (req: Request, res: Response, next: NextFunction) => {
	uploadAny(req, res, (err) => {
		if (err instanceof multer.MulterError) {
			if (err.code === 'LIMIT_FILE_SIZE') {
				return res.status(413).json({ message: 'Файл слишком большой' });
			}
			return res.status(400).json({ message: err.message });
		}
		if (err) {
			return res.status(400).json({ message: err.message });
		}

		if (!req.file && !req.files?.length) {
			return res.status(400).json({ message: 'Файл не загружен' });
		}

		if (req.files && Array.isArray(req.files) && req.files.length > 0) {
			req.file = req.files[0];
		}

		next();
	});
};
