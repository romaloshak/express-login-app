export const shorthands = undefined;

export async function up(pgm) {
	pgm.sql(`
    CREATE TABLE files (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users ON DELETE CASCADE,
      original_name VARCHAR(255) NOT NULL,
      stored_name VARCHAR(255) UNIQUE NOT NULL,
      mime_type VARCHAR(100) NOT NULL,
      size BIGINT NOT NULL,
      path VARCHAR(500) NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);

	pgm.createIndex('files', 'user_id');
	pgm.createIndex('files', 'created_at');
}

export async function down(pgm) {
	pgm.dropTable('files');
}
