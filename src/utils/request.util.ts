import axios, { AxiosResponse } from 'axios';
import { Request } from 'express';
import { logger } from './logger.util';

const getCorrelationId = (req: Request): Record<string, string> => ({ 'X-Correlation-Id': <string> req.app.locals.correlationId });

const getHeaders = (req: Request) : Record<string, Record<string, string>> => ({ headers: getCorrelationId(req) });

const get = async (req: Request, url: string): Promise<AxiosResponse> => {
  logger.debug(req, `Making GET request to "${url}"`);
  return axios.get(url, getHeaders(req));
};

const put = async (req: Request, url: string, data: Record<string, unknown>): Promise<AxiosResponse> => {
  logger.debug(req, `Making PUT request to "${url}" with data: ${JSON.stringify(data)}`);
  return axios.put(url, data, getHeaders(req));
};

const post = async (req: Request, url: string, data?: Record<string, unknown>): Promise<AxiosResponse> => {
  logger.debug(req, `Making POST request to "${url}" with data: ${JSON.stringify(data)}`);
  return axios.post(url, data, getHeaders(req));
};

export const request = {
  get,
  put,
  post,
};
