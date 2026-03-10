import type {Request, Response} from "express";
import type {QueryResult} from "pg";
import bcrypt from 'bcrypt';
import {CreateUserSchema, type User} from "../../types/User.type.js";
import pool from "../../db.js";
import * as UserService from '../services/user.service.js';

export const getUsers = async (req: Request, res: Response) => {
  try {
    const result: QueryResult<User> = await pool.query('SELECT * FROM users');
    res.json(result.rows);
  } catch (err) {
    res.status(500).send('Ошибка сервера');
  }
}

export const createUser = async (req: Request, res: Response) => {
  try{
    const validatedData = CreateUserSchema.parse(req.body);

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(validatedData.password, salt);

    const newUser = await UserService.createUserInDb({
      ...validatedData,
      password: hashedPassword
    });
    res.status(201).json(newUser);
  }catch(error: any){
    if (error.name === "ZodError") {
      return res.status(400).json({ errors: error.errors });
    }

    if (error.code === '23505') {
      return res.status(400).json({ message: "Этот email уже занят" });
    }

    console.error(error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
}