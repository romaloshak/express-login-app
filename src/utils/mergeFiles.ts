import fs from 'node:fs';
import path from 'node:path';
import { pipeline } from 'node:stream/promises';
import { fileURLToPath } from 'node:url'; // Специальная утилита для безопасной склейки

export async function mergeFiles(uploadId: string, originalName: string, totalChunks: number) {
	console.log(uploadId, originalName, totalChunks);
	// 1. Путь, куда сохраним финальный результат
	// Используем uploadId в названии, чтобы избежать конфликтов имен
	const __filename = fileURLToPath(import.meta.url);
	const __dirname = path.dirname(__filename);
	const finalFilePath = path.join(__dirname, '../../uploads', `${uploadId}.${originalName}`);

	// 2. Создаем "приемник" — поток для записи в финальный файл
	const writeStream = fs.createWriteStream(finalFilePath);

	try {
		// 3. Перебираем чанки строго по порядку от 0 до totalChunks
		for (let i = 0; i < totalChunks; i++) {
			const chunkPath = path.join(__dirname, '../../chunks', `${i}.${uploadId}.${originalName}`);

			// Проверяем, существует ли файл чанка (на всякий случай)
			if (!fs.existsSync(chunkPath)) {
				throw new Error(`Чанк №${i} не найден по пути: ${chunkPath}`);
			}

			// 4. Создаем "источник" — поток для чтения текущего чанка
			const readStream = fs.createReadStream(chunkPath);

			// 5. ГЛАВНАЯ МАГИЯ: pipeline переливает данные из read в write.
			// { end: false } говорит: "Не закрывай writeStream, когда прочитаешь этот чанк,
			// потому что в цикле придет следующий!"
			await pipeline(readStream, writeStream, { end: false });

			// После того как pipeline закончил работу с одним чанком,
			// readStream закроется автоматически, и цикл пойдет на следующую итерацию.
		}

		// 6. Когда цикл завершен, вручную закрываем финальный файл
		writeStream.end();

		// 7. Наводим порядок: удаляем временные чанки
		for (let i = 0; i < totalChunks; i++) {
			const chunkPath = path.join(__dirname, '../../chunks', `${i}.${uploadId}.${originalName}`);
			await fs.promises.unlink(chunkPath);
		}

		console.log(`Файл ${originalName} успешно собран!`);
		return finalFilePath;
	} catch (error) {
		// Если что-то пошло не так, закрываем поток записи и пробрасываем ошибку дальше
		writeStream.destroy();
		console.error('Ошибка при склейке файла:', error);
		throw error;
	}
}
