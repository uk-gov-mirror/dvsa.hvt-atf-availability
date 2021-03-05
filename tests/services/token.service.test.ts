import { Request } from 'express';
import { AxiosResponse } from 'axios';
import AWS from 'aws-sdk';
import { TokenPayload } from '../../src/models/token.model';
import { tokenService } from '../../src/services/token.service';
import { logger } from '../../src/utils/logger.util';
import { ExpiredTokenException } from '../../src/exceptions/expiredToken.exception';
import { InvalidTokenException } from '../../src/exceptions/invalidToken.exception';
import { request } from '../../src/utils/request.util';
import {
  getExpiredToken,
  getInvalidToken,
  getSubMissingToken,
  getStartDateMissingToken,
  getEndDateMissingToken,
  getJwtSecret,
  getValidToken,
} from '../data-providers/token.dataProvider';

let jwtSecret: string;
let decryptMock: jest.Mock;
let awsMock: jest.Mocked<typeof AWS>;

jest.mock('aws-sdk', () => ({
  KMS: jest.fn().mockImplementation(() => ({
    decrypt: decryptMock,
  })),
}));
logger.warn = jest.fn();
logger.info = jest.fn();

describe('Test token.service', () => {
  describe('extractTokenPayload method', () => {
    beforeEach(() => {
      jwtSecret = getJwtSecret();

      process.env = {
        KMS_KEY_ID: 'some-key-id',
        AWS_REGION: 'some-aws-region',
        AWS_ENDPOINT: 'some-aws-endpoint',
        JWT_SECRET: jwtSecret,
      };

      decryptMock = jest.fn(() => ({
        promise: jest.fn().mockImplementation(() => ({ Plaintext: jwtSecret })),
      }));
      awsMock = <jest.Mocked<typeof AWS>> AWS;
    });

    afterEach(() => {
      process.env = {};
      jest.clearAllMocks();
      awsMock.KMS.mockClear();
      decryptMock.mockClear();
    });

    it('should return properly decoded token payload data when valid token provided', async () => {
      const validToken: string = getValidToken();
      const req: Request = <Request> <unknown> { query: { token: validToken } };

      const result: TokenPayload = await tokenService.extractTokenPayload(req, true);

      expect(awsMock.KMS).toHaveBeenCalledWith({
        apiVersion: '2014-11-01',
        region: process.env.AWS_REGION,
        endpoint: process.env.AWS_ENDPOINT,
      });
      expect(decryptMock).toHaveBeenCalledWith({
        KeyId: process.env.KMS_KEY_ID,
        CiphertextBlob: Buffer.from(jwtSecret, 'base64'),
      });
      expect(result).toStrictEqual({
        atfId: '856090d1-f2dc-4bbc-ad36-8d14382339e0',
        endDate: '2020-12-20T23:59:59.000Z',
        startDate: '2020-11-23T00:00:00.000Z',
      });
    });

    it('should return properly decoded token payload data when expired tokens are ignored', async () => {
      // this is for the purpose of extracting ATF ID from an expired token (so that a new one can be requested)
      const expiredToken: string = getExpiredToken();
      const req: Request = <Request> <unknown> { query: { token: expiredToken } };

      const result: TokenPayload = await tokenService.extractTokenPayload(req, true);

      expect(result).toStrictEqual({
        atfId: '856090d1-f2dc-4bbc-ad36-8d14382339e0',
        endDate: '2020-12-20T23:59:59.000Z',
        startDate: '2020-11-23T00:00:00.000Z',
      });
    });

    it('should throw InvalidTokenException when token wasn\'t passed', async () => {
      const req: Request = <Request> <unknown> { query: null };

      await expect(
        async () => tokenService.extractTokenPayload(req, true),
      ).rejects.toThrow(
        new InvalidTokenException(),
      );
      expect(logger.warn).toBeCalledWith(req, 'Token is missing from query params');
    });

    it('should throw ExpiredTokenException when expired token provided', async () => {
      const expiredToken: string = getExpiredToken();
      const req: Request = <Request> <unknown> { query: { token: expiredToken } };

      await expect(
        async () => tokenService.extractTokenPayload(req),
      ).rejects.toThrow(
        new ExpiredTokenException(),
      );
      expect(logger.warn).toBeCalledWith(req, expect.stringContaining('Token has expired'));
    });

    it('should throw InvalidTokenException when invalid token provided', async () => {
      const invalidToken: string = getInvalidToken();
      const req: Request = <Request> <unknown> { query: { token: invalidToken } };

      await expect(
        async () => tokenService.extractTokenPayload(req, true),
      ).rejects.toThrow(
        new InvalidTokenException(),
      );
      expect(logger.warn).toBeCalledWith(req, expect.stringContaining('Failed to verify token, error:'));
    });

    it('should throw InvalidTokenException when "sub" is missing', async () => {
      const invalidToken: string = getSubMissingToken();
      const req: Request = <Request> <unknown> { query: { token: invalidToken } };

      await expect(
        async () => tokenService.extractTokenPayload(req, true),
      ).rejects.toThrow(
        new InvalidTokenException(),
      );
      expect(logger.warn).toBeCalledWith(
        req, expect.stringContaining('Failed to verify token, error: "sub" is missing'),
      );
    });

    it('should throw InvalidTokenException when "startDate" is missing', async () => {
      const invalidToken: string = getStartDateMissingToken();
      const req: Request = <Request> <unknown> { query: { token: invalidToken } };

      await expect(
        async () => tokenService.extractTokenPayload(req, true),
      ).rejects.toThrow(
        new InvalidTokenException(),
      );
      expect(logger.warn).toBeCalledWith(
        req, expect.stringContaining('Failed to verify token, error: "startDate" is missing'),
      );
    });

    it('should throw InvalidTokenException when "endDate" is missing', async () => {
      const invalidToken: string = getEndDateMissingToken();
      const req: Request = <Request> <unknown> { query: { token: invalidToken } };

      await expect(
        async () => tokenService.extractTokenPayload(req, true),
      ).rejects.toThrow(
        new InvalidTokenException(),
      );
      expect(logger.warn).toBeCalledWith(
        req, expect.stringContaining('Failed to verify token, error: "endDate" is missing'),
      );
    });

    test('should rethrow error when failed to decrypt JWT_SECRET', async () => {
      const validToken: string = getValidToken();
      const req: Request = <Request> <unknown> { query: { token: validToken } };
      const error = new Error('oops!');
      decryptMock = jest.fn(() => ({
        promise: jest.fn().mockImplementation(() => { throw error; }),
      }));

      await expect(
        async () => tokenService.extractTokenPayload(req, true),
      ).rejects.toThrow(error);
      expect(logger.warn).toBeCalledWith(
        req, expect.stringContaining('Failed to decrypt JWT_SECRET'),
      );
    });
  });

  describe('retrieveTokenFromQueryParams method', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

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
    beforeEach(() => {
      process.env = { GENERATE_TOKEN_URL: 'http://generate-token-url.gov' };
    });

    afterEach(() => {
      process.env = { };
      jest.clearAllMocks();
    });

    it('should call request util with correct params', async () => {
      const requestMock = jest.spyOn(request, 'post');
      const token = 'foo';
      const req: Request = <Request> <unknown> { query: { token } };
      requestMock.mockReturnValue(Promise.resolve(<AxiosResponse>{}));

      await tokenService.reissueToken(req, 'atf-id');

      expect(requestMock).toHaveBeenCalledWith(req, `${process.env.GENERATE_TOKEN_URL}`, { atfId: 'atf-id' });
    });

    it('should log and rethrow errors', async () => {
      const token = 'foo';
      const req: Request = <Request> <unknown> { query: { token } };
      const error: Error = new Error('oops!');
      const requestMock = jest.spyOn(request, 'post');
      requestMock.mockReturnValue(Promise.reject(error));

      await expect(async () => tokenService.reissueToken(req, 'atf-id')).rejects.toThrow(error);

      expect(logger.warn).toHaveBeenCalledWith(req, 'Failed to generate new ATF [atf-id] token');
    });
  });
});
