import axios, { AxiosResponse } from 'axios';
import { Request } from 'express';

// eslint-disable-next-line max-len
const getCorrelationId = (req: Request): Record<string, string> => ({ 'X-Correlation-Id': <string> req.app.locals.correlationId });

const getHeaders = (req: Request) : Record<string, Record<string, string>> => ({ headers: getCorrelationId(req) });

const get = async (req: Request, url: string): Promise<AxiosResponse> => axios.get(url, getHeaders(req));

// eslint-disable-next-line max-len
const put = async (req: Request, url: string, data: unknown): Promise<AxiosResponse> => axios.put(url, data, getHeaders(req));

export const request = {
  get,
  put,
};
