import pool from '../../db.js';
import type { UploadChunkStatus } from '../types/File.type.js';
import type { FileRecord } from './file.service.js';

export type initRecordType = Pick<FileRecord, 'original_name' | 'size'> & {
	chunk_size: number;
	total_chunks: number;
};

type UploadChunkType = {
	stored_name: string;
	chunk_index: number;
};

export const initFileUploadingInDb = async (initData: initRecordType) => {
	const { original_name, total_chunks, chunk_size, size } = initData;

	const query = `
    INSERT INTO uploads_metadata (file_name, file_size, chunk_size, total_chunks)
    VALUES ($1, $2, $3, $4)
    RETURNING id;
  `;

	const values = [original_name, size, chunk_size, total_chunks];
	const result = await pool.query(query, values);

	return result.rows[0];
};

export const updateMergeStatusInDb = async (status: UploadChunkStatus, uploadId: string) => {
	const query = `
		UPDATE uploads_metadata 
		SET status = $1, 
        updated_at = NOW() 
    WHERE id = $2
		RETURNING status;
	`;

	const values = [status, uploadId];

	const result = await pool.query(query, values);
	return result.rows[0];
};

export const uploadChunkInDb = async (upload_id: string, chunkRecord: UploadChunkType) => {
	const { chunk_index, stored_name } = chunkRecord;

	const query = `
      WITH insert_chunk AS (
        INSERT INTO uploaded_chunks (upload_id, chunk_index, stored_name)
        VALUES ($1, $2, $3)
        RETURNING upload_id
      )
      UPDATE uploads_metadata
      SET uploaded_chunks_count = uploaded_chunks_count + 1,
          updated_at = NOW()
      WHERE id = (SELECT upload_id FROM insert_chunk)
          RETURNING uploaded_chunks_count, total_chunks;
  `;

	const values = [upload_id, chunk_index, stored_name];
	const result = await pool.query(query, values);

	const { uploaded_chunks_count, total_chunks } = result.rows[0];

	return {
		isComplete: uploaded_chunks_count === total_chunks,
		progress: Math.round((uploaded_chunks_count / total_chunks) * 100),
		total_chunks,
	};
};

export const getUploadStatusFromDb = async (uploadId: string) => {
	const query = `
    SELECT status, file_name, total_chunks, uploaded_chunks_count,
           ROUND((uploaded_chunks_count::float / total_chunks::float) * 100) as progress
    FROM uploads_metadata 
    WHERE id = $1;
  `;

	const result = await pool.query(query, [uploadId]);

	if (result.rows.length === 0) return null;
	return result.rows[0];
};
