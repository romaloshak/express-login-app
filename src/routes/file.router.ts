import { Router } from 'express';
import { getFile, getUserFiles, removeFile, uploadFile } from '../controllers/file.controller.js';
import { authMiddleware } from '../middelwares/auth.middleware.js';
import { handleUpload } from '../middelwares/upload.middleware.js';

const router = Router();

router.post('/upload', authMiddleware, handleUpload, uploadFile);
router.get('/user', authMiddleware, getUserFiles);
router.get('/:id', authMiddleware, getFile);
router.delete('/:id', authMiddleware, removeFile);

export default router;
