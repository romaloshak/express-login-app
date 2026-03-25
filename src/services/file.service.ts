import fs from 'node:fs/promises';
import pool from '../../db.js';

export type FileRecord = {
	id: number;
	user_id: string;
	original_name: string;
	stored_name: string;
	mime_type: string;
	size: number;
	path: string;
	created_at: Date;
};

export type CreateFileParams = Pick<
	FileRecord,
	'user_id' | 'original_name' | 'stored_name' | 'mime_type' | 'size' | 'path'
>;

export const uploadFileInDb = async (fileRecord: CreateFileParams) => {
	const { mime_type, user_id, original_name, stored_name, size, path: filePath } = fileRecord;

	const query = `
		INSERT INTO files (mime_type, user_id, original_name, stored_name, size, path)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING *;
	`;
	const values = [mime_type, user_id, original_name, stored_name, size, filePath];
	const result = await pool.query(query, values);

	return result.rows[0];
};

export const findFileById = async (fileId: string) => {
	const query = 'SELECT * FROM files WHERE id = $1';
	const result = await pool.query(query, [fileId]);
	return result.rows[0];
};

export const findUserFiles = async (userId: string) => {
	const query = 'SELECT * FROM files WHERE user_id = $1';
	const result = await pool.query(query, [userId]);
	return result.rows;
};

export const removeFileFromDb = async (fileId: string) => {
	const query = 'DELETE FROM files WHERE id = $1 RETURNING *';
	const result = await pool.query(query, [fileId]);

	if (result.rows[0]) {
		try {
			await fs.unlink(result.rows[0].path);
		} catch {
			throw Error(`Could not delete file with id ${fileId}`);
		}
	}

	return result.rows[0];
};
