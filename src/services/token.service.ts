import jwt, { TokenExpiredError } from 'jsonwebtoken';
import AWS from 'aws-sdk';
import { Request } from 'express';
import { AxiosResponse } from 'axios';
import { TokenPayload } from '../models/token.model';
import { logger } from '../utils/logger.util';
import { ExpiredTokenException } from '../exceptions/expiredToken.exception';
import { InvalidTokenException } from '../exceptions/invalidToken.exception';
import { request } from '../utils/request.util';

const decryptJwtSecret = async (req: Request): Promise<string> => {
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
    logger.warn(req, 'Failed to decrypt JWT_SECRET');
    throw error;
  }
};

const decodeToken = (
  req: Request, secret: string, ignoreExpiration: boolean,
): Record<string, unknown> => {
  const token: string = retrieveTokenFromQueryParams(req);

  // eslint-disable-next-line security/detect-possible-timing-attacks
  if (token === undefined) {
    logger.warn(req, 'Token is missing from query params');
    throw new InvalidTokenException();
  }

  logger.info(req, `Verifying token [${token}]`);
  let decodedToken: Record<string, unknown>;

  try {
    decodedToken = <Record<string, unknown>> jwt.verify(token, secret, { ignoreExpiration });
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      logger.warn(req, 'Token has expired');
      throw new ExpiredTokenException();
    }

    const errorString: string = JSON.stringify(error, Object.getOwnPropertyNames(error));
    logger.warn(req, `Failed to verify token, error: ${errorString}`);
    throw new InvalidTokenException();
  }

  ['sub', 'startDate', 'endDate', 'iss'].forEach((attribute) => {
    if (decodedToken[`${attribute}`] === undefined) {
      logger.warn(req, `Failed to verify token, error: "${attribute}" is missing`);
      throw new InvalidTokenException();
    }
  });

  return decodedToken;
};

const retrieveTokenFromQueryParams = (req: Request): string => <string> req.query?.token;

const extractTokenPayload = async (req: Request, ignoreExpiration = false): Promise<TokenPayload> => {
  const secret: string = await decryptJwtSecret(req);
  logger.info(req, 'Extracting token payload');
  const decodedToken: Record<string, unknown> = decodeToken(req, secret, ignoreExpiration);
  return {
    atfId: <string> decodedToken.sub,
    startDate: new Date(<number> decodedToken.startDate * 1000).toISOString(),
    endDate: new Date(<number> decodedToken.endDate * 1000).toISOString(),
  };
};

const reissueToken = async (req: Request, atfId: string): Promise<AxiosResponse> => {
  logger.info(req, `Requesting new ATF [${atfId}] token`);
  const postData = { atfId };
  return request.post(
    req, `${process.env.GENERATE_TOKEN_URL}`, postData,
  ).catch((error) => {
    logger.warn(req, `Failed to generate new ATF [${atfId}] token`);
    throw error;
  });
};

export const tokenService = {
  retrieveTokenFromQueryParams,
  extractTokenPayload,
  reissueToken,
};
