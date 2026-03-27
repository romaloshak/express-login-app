import fs from 'node:fs';
import path from 'node:path';
import { finished } from 'node:stream/promises';
// import { pipeline } from 'node:stream/promises';
import { fileURLToPath } from 'node:url';

export async function mergeFiles(uploadId: string, originalName: string, totalChunks: number) {
	const __filename = fileURLToPath(import.meta.url);
	const __dirname = path.dirname(__filename);
	const finalFilePath = path.join(__dirname, '../../uploads', `${uploadId}.${originalName}`);

	const writeStream = fs.createWriteStream(finalFilePath);

	try {
		// --- Новая реализация: читать чанк целиком → писать в один WriteStream (без повторного pipeline на destination) ---
		for (let i = 0; i < totalChunks; i++) {
			const chunkPath = path.join(__dirname, '../../chunks', `${i}.${uploadId}.${originalName}`);

			if (!fs.existsSync(chunkPath)) {
				throw new Error(`Чанк №${i} не найден по пути: ${chunkPath}`);
			}

			const data = await fs.promises.readFile(chunkPath);
			const ok = writeStream.write(data);
			if (!ok) {
				await new Promise<void>((resolve, reject) => {
					writeStream.once('drain', resolve);
					writeStream.once('error', reject);
				});
			}
		}

		writeStream.end();
		await finished(writeStream);

		// --- Старая реализация (pipeline в цикле на один writeStream → MaxListeners при большом числе чанков) ---
		// for (let i = 0; i < totalChunks; i++) {
		// 	const chunkPath = path.join(__dirname, '../../chunks', `${i}.${uploadId}.${originalName}`);
		//
		// 	if (!fs.existsSync(chunkPath)) {
		// 		throw new Error(`Чанк №${i} не найден по пути: ${chunkPath}`);
		// 	}
		//
		// 	const readStream = fs.createReadStream(chunkPath);
		//
		// 	await pipeline(readStream, writeStream, { end: false });
		// }
		//
		// writeStream.end();

		for (let i = 0; i < totalChunks; i++) {
			const chunkPath = path.join(__dirname, '../../chunks', `${i}.${uploadId}.${originalName}`);
			await fs.promises.unlink(chunkPath);
		}

		console.log(`Файл ${originalName} успешно собран!`);
		return finalFilePath;
	} catch (error) {
		writeStream.destroy();
		console.error('Ошибка при склейке файла:', error);
		throw error;
	}
}
