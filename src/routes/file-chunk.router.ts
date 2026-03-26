import { Router } from 'express';
import { initFileChunk, updateMergeStatus, uploadFileChunk } from '../controllers/file-chunk.controller.js';
import { authMiddleware } from '../middelwares/auth.middleware.js';
import { handleChunkUpload } from '../middelwares/upload.middleware.js';

const router = Router();

router.post('/upload-chunk', authMiddleware, handleChunkUpload, uploadFileChunk);
router.patch('/status', authMiddleware, updateMergeStatus);
router.post('/init-chunk', authMiddleware, handleChunkUpload, initFileChunk);

export default router;
