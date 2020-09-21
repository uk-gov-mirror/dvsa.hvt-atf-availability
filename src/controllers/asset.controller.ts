import { Request, Response } from 'express';
import path from 'path';

export const file = (req: Request, res: Response): void => {
  const filePath = path.join(__dirname, 'public', req.params.asset);

  try {
    return res.sendFile(filePath);
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const imageFile = (req: Request, res: Response): void => {
  const filePath = path.join(__dirname, 'public', 'assets', 'images', req.params.asset);

  try {
    return res.sendFile(filePath);
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const fontFile = (req: Request, res: Response): void => {
  const filePath = path.join(__dirname, 'public', 'assets', 'fonts', req.params.asset);

  try {
    return res.sendFile(filePath);
  } catch (error) {
    console.error(error);
    throw error;
  }
};
