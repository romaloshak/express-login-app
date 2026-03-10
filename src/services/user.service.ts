import pool from "../../db.js";
import type {CreateUserInput} from "../../types/User.type.js";

export const findUserByEmail = async (email: string) => {
  const query = 'SELECT * FROM users WHERE email = $1';
  const result = await pool.query(query, [email]);
  return result.rows[0];
};


export const createUserInDb = async (userData: CreateUserInput) => {
  const { username, email, password } = userData;

  const query = `
    INSERT INTO users (username, email, password) 
    VALUES ($1, $2, $3) 
    RETURNING id, username, email, created_at;
  `;

  const values = [username, email, password];
  const result = await pool.query(query, values);

  return result.rows[0];
};