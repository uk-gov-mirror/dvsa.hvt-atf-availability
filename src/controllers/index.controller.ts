import { Request, Response } from 'express';
import { AxiosResponse } from 'axios';
import { request } from '../utils/request';
import { Index } from '../models/index.model';
import { logger } from '../utils/logger';

export const index = async (req: Request, res: Response): Promise<void> => {
  logger.info(req, 'Retrieving data from api..');

  const data: Index = await request.get(req, 'http://host.docker.internal:3000/?message=api%20integration%20successful')
    .then((response: AxiosResponse<Index>) => response.data)
    .catch((err) => {
      logger.error(req, err);
      throw err;
    });

  return res.render('index', {
    message: `Hello world! - here's some user from the API: ${JSON.stringify(data)}`,
  });
};
