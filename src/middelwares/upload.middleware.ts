import { randomBytes } from 'node:crypto';
import path from 'node:path';
import type { NextFunction, Request, Response } from 'express';
import multer from 'multer';
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

const chunkStorage = multer.diskStorage({
	destination: (_req, _file, cb) => {
		cb(null, env.CHUNKS_DIR);
	},
	filename: (req, file, cb) => {
		const {
			body: { uploadId, chunk_index },
		} = req;

		const filename = `${chunk_index}.${uploadId}.${file.originalname}`;
		cb(null, `${filename}`);
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
const uploadChunkConfig = {
	storage: chunkStorage,
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
export const uploadChunkAny = multer(uploadChunkConfig).any();

/** После `.any()` файлы только в `req.files`; контроллеры чанков ожидают `req.file`. */
export const handleChunkUpload = (req: Request, res: Response, next: NextFunction) => {
	uploadChunkAny(req, res, (err) => {
		if (err instanceof multer.MulterError) {
			if (err.code === 'LIMIT_FILE_SIZE') {
				return res.status(413).json({ message: 'Файл слишком большой' });
			}
			return res.status(400).json({ message: err.message });
		}
		if (err) {
			return res.status(400).json({ message: (err as Error).message });
		}

		const files = req.files;
		if (!files || !Array.isArray(files) || files.length === 0) {
			return next();
		}

		req.file = files[0];
		next();
	});
};

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
