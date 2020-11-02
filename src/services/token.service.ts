import AWS from 'aws-sdk';
import jwt, { TokenExpiredError } from 'jsonwebtoken';
import { Request } from 'express';
import { AxiosResponse } from 'axios';
import { TokenPayload } from '../models/token.model';
import { logger } from '../utils/logger.util';
import { ExpiredTokenException } from '../exceptions/expiredToken.exception';
import { InvalidTokenException } from '../exceptions/invalidToken.exception';
import { request } from '../utils/request.util';

export const decryptJwtSecret = async (req: Request): Promise<string> => {
  const region = process.env.AWS_REGION;
  const endpoint = process.env.AWS_ENDPOINT;
  const keyId = process.env.KMS_KEY_ID;
  const secret = process.env.JWT_SECRET;
  logger.info(req, 'Decrypting JWT_SECRET');

  try {
    const kms = new AWS.KMS({
      apiVersion: '2014-11-01',
      region,
      endpoint,
    });
    const decryptParams = {
      KeyId: keyId,
      CiphertextBlob: Buffer.from(secret, 'base64'),
    };
    const { Plaintext } = await kms.decrypt(decryptParams).promise();
    return Plaintext.toString('utf-8');
  } catch (error) {
    const errorString: string = JSON.stringify(error, Object.getOwnPropertyNames(error));
    logger.error(req, `Failed to decrypt JWT_SECRET, error: ${errorString}`);
    throw error;
  }
};

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
    const errorString: string = JSON.stringify(error, Object.getOwnPropertyNames(error));

    if (error instanceof TokenExpiredError) {
      logger.warn(req, `Expired token provided, error: ${errorString}`);
      throw new ExpiredTokenException(`Token [${token}] is expired`);
    }

    logger.warn(req, `Invalid token provided, error: ${errorString}`);
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
const decodeToken = (req: Request, token: string, ignoreExpiration: boolean): Record<string, unknown> => <Record<string, unknown>> jwt.verify(token, req.app.locals.jwtSecret, { ignoreExpiration });

export const tokenService = {
  extractTokenPayload,
  retrieveTokenFromQueryParams,
  reissueToken,
};
