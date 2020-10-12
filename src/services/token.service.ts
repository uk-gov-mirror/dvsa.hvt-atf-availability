import jwt, { TokenExpiredError } from 'jsonwebtoken';
import { Request } from 'express';
import { AxiosResponse } from 'axios';
import { TokenPayload } from '../models/token.model';
import { logger } from '../utils/logger.util';
import { ExpiredTokenException } from '../exceptions/expiredToken.exception';
import { InvalidTokenException } from '../exceptions/invalidToken.exception';
import { request } from '../utils/request.util';

const extractTokenPayload = (req: Request, ignoreExpiration = false): TokenPayload => {
  const token: string = retrieveTokenFromQueryParams(req);
  logger.info(req, `Extracting token payload, token: ${token}`);

  // eslint-disable-next-line security/detect-possible-timing-attacks
  if (token === undefined) {
    logger.warn(req, 'Token missing from query params');
    throw new InvalidTokenException('Token is undefined');
  }

  try {
    const decodedToken: Record<string, unknown> = decodeToken(req, token, ignoreExpiration);

    return {
      atfId: <string> decodedToken.sub,
      isAvailable: <boolean> decodedToken.isAvailable,
      startDate: new Date(<number> decodedToken.startDate * 1000).toISOString(),
      endDate: new Date(<number> decodedToken.endDate * 1000).toISOString(),
    };
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      logger.warn(req, `Expired token provided, error: ${JSON.stringify(error)}`);
      throw new ExpiredTokenException(`Token [${token}] is expired`);
    }

    logger.warn(req, `Invalid token provided, error: ${JSON.stringify(error)}`);
    throw new InvalidTokenException(`Token [${token}] is invalid`);
  }
};

const reissueToken = async (req: Request, atfId: string): Promise<AxiosResponse> => {
  logger.info(req, `Requesting new ATF [${atfId}] token...`);

  return request.post(req, `${process.env.GENERATE_TOKEN_URL}?atfId=${atfId}`, {}).catch((error) => {
    const errorString: string = JSON.stringify(error, Object.getOwnPropertyNames(error));
    logger.warn(req, `Failed to generate new ATF [${atfId}] token, error ${errorString}`);
    return <AxiosResponse> {};
  });
};

const retrieveTokenFromQueryParams = (req: Request): string => <string> req.query?.token;

// eslint-disable-next-line max-len
const decodeToken = (req: Request, token: string, ignoreExpiration: boolean): Record<string, unknown> => {
  logger.info(req, 'Successfully decoded token');
  return <Record<string, unknown>> jwt.verify(token, process.env.JWT_SECRET, { ignoreExpiration });
};

export const tokenService = {
  extractTokenPayload,
  retrieveTokenFromQueryParams,
  reissueToken,
};
