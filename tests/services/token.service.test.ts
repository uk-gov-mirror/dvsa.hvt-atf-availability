import { Request } from 'express';
import jwt from 'jsonwebtoken';
import { TokenPayload } from '../../src/models/token.model';
import { tokenService } from '../../src/services/token.service';
import { logger } from '../../src/utils/logger.util';
import { ExpiredTokenException } from '../../src/exceptions/expiredToken.exception';
import { InvalidTokenException } from '../../src/exceptions/invalidToken.exception';
import {
  getExpiredYesToken,
  getInvalidToken,
  getJwtSecret,
} from '../data-providers/token.dataProvider';

logger.warn = jest.fn();
logger.info = jest.fn();
process.env.JWT_SECRET = getJwtSecret();

describe('Test tokenService', () => {
  afterEach(() => {
    jest.clearAllMocks();
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
      const req: Request = <Request> <unknown> { query: { token: expiredToken } };

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
      const req: Request = <Request> <unknown> { query: { token: 'foo' } };
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
      expect(logger.info).toBeCalledWith(req, 'Successfully decoded token');
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
});
