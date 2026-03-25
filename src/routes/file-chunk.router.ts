import { Router } from 'express';
import { initFileChunk, uploadFileChunk } from '../controllers/file-chunk.controller.js';
import { authMiddleware } from '../middelwares/auth.middleware.js';
import { uploadChunkAny } from '../middelwares/upload.middleware.js';

const router = Router();

router.post('/upload-chunk', authMiddleware, uploadChunkAny, uploadFileChunk);
router.post('/init-chunk', authMiddleware, uploadChunkAny, initFileChunk);

export default router;
