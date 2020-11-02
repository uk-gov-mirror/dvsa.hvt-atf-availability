import AWS from 'aws-sdk';
import { Request } from 'express';
import jwt from 'jsonwebtoken';
import { AxiosResponse } from 'axios';
import { TokenPayload } from '../../src/models/token.model';
import { decryptJwtSecret, tokenService } from '../../src/services/token.service';
import { logger } from '../../src/utils/logger.util';
import { ExpiredTokenException } from '../../src/exceptions/expiredToken.exception';
import { InvalidTokenException } from '../../src/exceptions/invalidToken.exception';
import { request } from '../../src/utils/request.util';
import {
  getExpiredYesToken,
  getInvalidToken,
  getJwtSecret,
} from '../data-providers/token.dataProvider';

process.env.GENERATE_TOKEN_URL = 'http://generate-token-url.gov';
process.env.KMS_KEY_ID = 'some-key-id';
process.env.JWT_SECRET = 'dmVyeSB2ZXJ5IHNlY3JldA==';
process.env.AWS_REGION = 'some-aws-region';
process.env.AWS_ENDPOINT = 'some-aws-endpoint';

logger.warn = jest.fn();
logger.info = jest.fn();

const jwtSecret = getJwtSecret();
const reqMock = <Request> <unknown> {
  apiGateway: { event: { requestContext: { requestId: 'apiRequestId' } } },
  app: { locals: { correlationId: 'correlationId' } },
  query: { token: 'token' },
};
const decryptMock = jest.fn(() => ({
  promise: jest.fn().mockResolvedValue({ Plaintext: 'some-plaintext' }),
}));
jest.mock('aws-sdk', () => ({
  KMS: jest.fn().mockImplementation(() => ({
    decrypt: decryptMock,
  })),
}));

describe('Test token.service', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('decryptJwtSecret()', () => {
    test('decrypts the secret', async () => {
      const utf8EncodedDecryptedSecret = 'very very secret';

      await decryptJwtSecret(reqMock);

      expect(decryptMock).toHaveBeenCalledTimes(1);
      expect(decryptMock).toHaveBeenCalledWith({
        KeyId: process.env.KMS_KEY_ID,
        CiphertextBlob: Buffer.from(utf8EncodedDecryptedSecret),
      });
    });
  });

  describe('extractTokenPayload method', () => {
    it('should throw InvalidTokenException when token wasn\'t passed', () => {
      const req: Request = <Request> <unknown> { query: null };

      expect(() => tokenService.extractTokenPayload(req))
        .toThrow(new InvalidTokenException('Token is undefined'));
      expect(logger.warn).toBeCalledWith(req, 'Token missing from query params');
    });

    it('should throw ExpiredTokenException when expired token provided', () => {
      const expiredToken: string = getExpiredYesToken();
      const req: Request = <Request> <unknown> {
        query: { token: expiredToken },
        app: { locals: { jwtSecret: 'secret' } },
      };

      expect(() => tokenService.extractTokenPayload(req))
        .toThrow(new ExpiredTokenException(`Token [${expiredToken}] is expired`));
      expect(logger.warn).toBeCalledWith(req, expect.stringContaining('Expired token provided, error'));
    });

    it('should throw InvalidTokenException when invalid token provided', () => {
      const invalidToken: string = getInvalidToken();
      const req: Request = <Request> <unknown> { query: { token: invalidToken } };

      expect(() => tokenService.extractTokenPayload(req))
        .toThrow(new InvalidTokenException(`Token [${invalidToken}] is invalid`));
      expect(logger.warn).toBeCalledWith(req, expect.stringContaining('Invalid token provided, error'));
    });

    it('should return properly decoded token payload data when valid token provided', () => {
      const req: Request = <Request> <unknown> {
        query: { token: 'foo' },
        app: { locals: { jwtSecret } },
      };
      jwt.verify = jest.fn();
      (jwt.verify as jest.Mock).mockImplementation(() => ({
        sub: 'atf-id-sample',
        isAvailable: true,
        startDate: 1601903212,
        endDate: 1601903220,
      }));

      const result: TokenPayload = tokenService.extractTokenPayload(req);

      expect(result).toStrictEqual({
        atfId: 'atf-id-sample',
        isAvailable: true,
        startDate: '2020-10-05T13:06:52.000Z',
        endDate: '2020-10-05T13:07:00.000Z',
      });
    });

    it('should return properly decoded token payload data when expired tokens are ignored', () => {
      // this is for the purpose of extracting ATF ID from an expired token (so that a new one can be requested)
      const expiredToken: string = getExpiredYesToken();
      const req: Request = <Request> <unknown> {
        query: { token: expiredToken },
        app: { locals: { jwtSecret } },
      };

      const result: TokenPayload = tokenService.extractTokenPayload(req, true);

      expect(result).toStrictEqual({
        atfId: 'atf-id-sample',
        isAvailable: true,
        startDate: '2020-10-05T13:06:52.000Z',
        endDate: '2020-10-05T13:07:00.000Z',
      });
    });
  });

  describe('retrieveTokenFromQueryParams method', () => {
    it('should return token value from query params if token was passed', () => {
      const token = 'foo';
      const req: Request = <Request> <unknown> { query: { token } };

      const result: string = tokenService.retrieveTokenFromQueryParams(req);

      expect(result).toBe(token);
    });

    it('should return \'undefined\' if token wasn\'t passed', () => {
      const req: Request = <Request> <unknown> { query: null };

      const result: string = tokenService.retrieveTokenFromQueryParams(req);

      expect(result).toBe(undefined);
    });
  });

  describe('reissueToken method', () => {
    it('should call request util with correct params', async () => {
      const requestMock = jest.spyOn(request, 'post');
      const token = 'foo';
      const req: Request = <Request> <unknown> { query: { token } };
      requestMock.mockReturnValue(Promise.resolve(<AxiosResponse>{}));

      await tokenService.reissueToken(req, 'atf-id');

      expect(requestMock).toHaveBeenCalledWith(req, `${process.env.GENERATE_TOKEN_URL}?atfId=atf-id`, {});
    });

    it('should log errors', async () => {
      const token = 'foo';
      const req: Request = <Request> <unknown> { query: { token } };
      const error: Error = new Error('oops!');
      const errorString: string = JSON.stringify(error, Object.getOwnPropertyNames(error));
      const requestMock = jest.spyOn(request, 'post');
      requestMock.mockReturnValue(Promise.reject(error));

      const result = await tokenService.reissueToken(req, 'atf-id');

      expect(result).toStrictEqual({});
      expect(logger.warn).toHaveBeenCalledWith(
        req,
        `Failed to generate new ATF [atf-id] token, error ${errorString}`,
      );
    });
  });
});
