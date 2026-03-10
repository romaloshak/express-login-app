import * as UserService from '../services/user.service.js';
import type { Request, Response } from 'express';

export const login = async (req: Request, res: Response) => {
  try {
    const {email, password, } = req.body;
    const user = await UserService.findUserByEmail(email);

    if (!user) {
      return res.status(401).json({ message: 'Неверный email или пароль' });
    }
  } catch{

  }
}