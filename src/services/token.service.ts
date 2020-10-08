import jwt, { TokenExpiredError } from 'jsonwebtoken';
import { Request } from 'express';
import { TokenPayload } from '../models/token.model';
import { logger } from '../utils/logger.util';
import { ExpiredTokenException } from '../exceptions/expiredToken.exception';
import { InvalidTokenException } from '../exceptions/invalidToken.exception';

const extractTokenPayload = (req: Request): TokenPayload => {
  const token: string = retrieveTokenFromQueryParams(req);
  logger.info(req, `Extracting token payload, token: ${token}`);

  if (token === undefined) {
    logger.warn(req, 'Token missing from query params');
    throw new InvalidTokenException('Token is undefined');
  }

  try {
    const decodedToken: Record<string, unknown> = decodeToken(token);
    logger.info(req, 'Successfully decoded token');

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

const retrieveTokenFromQueryParams = (req: Request): string => <string> req.query?.token;

// eslint-disable-next-line max-len
const decodeToken = (token: string): Record<string, unknown> => <Record<string, unknown>> jwt.verify(token, process.env.JWT_SECRET);

export const tokenService = {
  extractTokenPayload,
  retrieveTokenFromQueryParams,
};
