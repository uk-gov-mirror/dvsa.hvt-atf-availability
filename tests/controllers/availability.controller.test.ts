import { v4 } from 'uuid';
import { Request, NextFunction, Response } from 'express';
import { AxiosResponse } from 'axios';
import {
  reissueToken, expiredToken, updateAvailability, confirmAvailability,
} from '../../src/controllers/availability.controller';
import { tokenService } from '../../src/services/token.service';
import { TokenPayload } from '../../src/models/token.model';
import { availabilityService } from '../../src/services/availability.service';
import { AuthorisedTestingFacility } from '../../src/models/authorisedTestingFacility.model';
import { InvalidTokenException } from '../../src/exceptions/invalidToken.exception';
import { ExpiredTokenException } from '../../src/exceptions/expiredToken.exception';

let apiRequestId: string;
let awsRequestId: string;
let correlationId: string;
let token: string;
let atfId: string;
let reqMock: Request;
let resMock: Response;
let nextMock: NextFunction;

describe('Test availability.controller', () => {
  beforeEach(() => {
    apiRequestId = v4();
    awsRequestId = v4();
    correlationId = awsRequestId;
    token = '1234';
    atfId = '4321';
    reqMock = <Request> <unknown> {
      apiGateway: { event: { requestContext: { requestId: apiRequestId } } },
      app: { locals: { correlationId } },
      query: { retry: 'false', token },
    };
    resMock = <Response> <unknown> { redirect: jest.fn(), render: jest.fn(), status: jest.fn().mockReturnThis() };
    nextMock = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('updateAvailability method', () => {
    it('should call res.redirect() to confirm with proper params', async () => {
      const extractTokenPayloadServiceMock = jest.spyOn(tokenService, 'extractTokenPayload');
      extractTokenPayloadServiceMock.mockReturnValue(<TokenPayload> <unknown> { atfId });
      const updateAtfServiceMock = jest.spyOn(availabilityService, 'updateAtfAvailability');
      updateAtfServiceMock.mockReturnValue(Promise.resolve(<AuthorisedTestingFacility> <unknown> { id: atfId }));
      const redirectMock = jest.spyOn(resMock, 'redirect');

      await updateAvailability(reqMock, resMock, nextMock);

      expect(extractTokenPayloadServiceMock).toHaveBeenCalledWith(reqMock);
      expect(updateAtfServiceMock).toHaveBeenCalledWith(reqMock, { atfId });
      expect(redirectMock).toHaveBeenCalledWith(
        302,
        `/availability/confirm?token=${token}&correlationId=${correlationId}`,
      );
    });

    it('should call res.redirect() to expired token uri when the token is expired', async () => {
      const error: ExpiredTokenException = new ExpiredTokenException('oops!');
      const extractTokenPayloadServiceMock = jest.spyOn(tokenService, 'extractTokenPayload');
      extractTokenPayloadServiceMock.mockImplementation(() => { throw error; });
      const redirectMock = jest.spyOn(resMock, 'redirect');

      await updateAvailability(reqMock, resMock, nextMock);

      expect(extractTokenPayloadServiceMock).toHaveBeenCalledWith(reqMock);
      expect(redirectMock).toHaveBeenCalledWith(
        302,
        `/availability/reissue-token?token=${token}&correlationId=${correlationId}`,
      );
    });

    it('should call res.render() with 404 status when invalid token', async () => {
      const error: InvalidTokenException = new InvalidTokenException('oops!');
      const extractTokenPayloadServiceMock = jest.spyOn(tokenService, 'extractTokenPayload');
      extractTokenPayloadServiceMock.mockImplementation(() => { throw error; });
      const statusMock = jest.spyOn(resMock, 'status');
      const renderMock = jest.spyOn(resMock, 'render');

      await updateAvailability(reqMock, resMock, nextMock);

      expect(extractTokenPayloadServiceMock).toHaveBeenCalledWith(reqMock);
      expect(statusMock).toHaveBeenCalledWith(404);
      expect(renderMock).toHaveBeenCalledWith('error/not-found', { error: 'Invalid token' });
    });
  });

  describe('confirmAvailability method', () => {
    it('should call res.render() with proper params when specifying `yes` for isAvailable', async () => {
      const extractTokenPayloadServiceMock = jest.spyOn(tokenService, 'extractTokenPayload');
      extractTokenPayloadServiceMock.mockReturnValue(<TokenPayload> <unknown> { atfId });
      const getAtfServiceMock = jest.spyOn(availabilityService, 'getAtf');
      getAtfServiceMock.mockReturnValue(
        Promise.resolve(
          <AuthorisedTestingFacility> <unknown> { id: atfId, availability: { isAvailable: true } },
        ),
      );
      const renderMock = jest.spyOn(resMock, 'render');

      await confirmAvailability(reqMock, resMock, nextMock);

      expect(extractTokenPayloadServiceMock).toHaveBeenCalledWith(reqMock);
      expect(getAtfServiceMock).toHaveBeenCalledWith(reqMock, atfId);
      expect(renderMock).toHaveBeenCalledWith('availability-confirmation/yes', {
        atf: { id: atfId, availability: { isAvailable: true } },
        undefined,
      });
    });

    it('should call res.render() with proper params when specifying `no` for isAvailable', async () => {
      const extractTokenPayloadServiceMock = jest.spyOn(tokenService, 'extractTokenPayload');
      extractTokenPayloadServiceMock.mockReturnValue(<TokenPayload> <unknown> { atfId });
      const getAtfServiceMock = jest.spyOn(availabilityService, 'getAtf');
      getAtfServiceMock.mockReturnValue(
        Promise.resolve(
          <AuthorisedTestingFacility> <unknown> { id: atfId, availability: { isAvailable: false } },
        ),
      );
      const renderMock = jest.spyOn(resMock, 'render');

      await confirmAvailability(reqMock, resMock, nextMock);

      expect(extractTokenPayloadServiceMock).toHaveBeenCalledWith(reqMock);
      expect(getAtfServiceMock).toHaveBeenCalledWith(reqMock, atfId);
      expect(renderMock).toHaveBeenCalledWith('availability-confirmation/no', {
        atf: { id: atfId, availability: { isAvailable: false } },
        undefined,
      });
    });

    it('should call res.redirect() to expired token uri when the token is expired', async () => {
      const error: ExpiredTokenException = new ExpiredTokenException('oops!');
      const extractTokenPayloadServiceMock = jest.spyOn(tokenService, 'extractTokenPayload');
      extractTokenPayloadServiceMock.mockImplementation(() => { throw error; });
      const redirectMock = jest.spyOn(resMock, 'redirect');

      await confirmAvailability(reqMock, resMock, nextMock);

      expect(extractTokenPayloadServiceMock).toHaveBeenCalledWith(reqMock);
      expect(redirectMock).toHaveBeenCalledWith(
        302,
        `/availability/reissue-token?token=${token}&correlationId=${correlationId}`,
      );
    });

    it('should call res.render() with 404 status when invalid token', async () => {
      const error: InvalidTokenException = new InvalidTokenException('oops!');
      const extractTokenPayloadServiceMock = jest.spyOn(tokenService, 'extractTokenPayload');
      extractTokenPayloadServiceMock.mockImplementation(() => { throw error; });
      const statusMock = jest.spyOn(resMock, 'status');
      const renderMock = jest.spyOn(resMock, 'render');

      await confirmAvailability(reqMock, resMock, nextMock);

      expect(extractTokenPayloadServiceMock).toHaveBeenCalledWith(reqMock);
      expect(statusMock).toHaveBeenCalledWith(404);
      expect(renderMock).toHaveBeenCalledWith('error/not-found', { error: 'Invalid token' });
    });
  });

  describe('reissueToken method', () => {
    it('should call res.redirect() with proper params', async () => {
      const extractTokenPayloadServiceMock = jest.spyOn(tokenService, 'extractTokenPayload');
      extractTokenPayloadServiceMock.mockReturnValue(<TokenPayload> <unknown> { atfId });
      const reissueTokenServiceMock = jest.spyOn(tokenService, 'reissueToken');
      reissueTokenServiceMock.mockReturnValue(Promise.resolve(<AxiosResponse> {}));
      const redirectMock = jest.spyOn(resMock, 'redirect');

      await reissueToken(reqMock, resMock, nextMock);

      expect(extractTokenPayloadServiceMock).toHaveBeenCalledWith(reqMock, true);
      expect(reissueTokenServiceMock).toHaveBeenCalledWith(reqMock, atfId);
      expect(redirectMock).toHaveBeenCalledWith(
        302,
        `/availability/expired-token?token=${token}&correlationId=${correlationId}`,
      );
    });

    it('retry - should call res.redirect() with proper params', async () => {
      reqMock.query.retry = 'true';
      const extractTokenPayloadServiceMock = jest.spyOn(tokenService, 'extractTokenPayload');
      extractTokenPayloadServiceMock.mockReturnValue(<TokenPayload> <unknown> { atfId });
      const reissueTokenServiceMock = jest.spyOn(tokenService, 'reissueToken');
      reissueTokenServiceMock.mockReturnValue(Promise.resolve(<AxiosResponse> {}));
      const redirectMock = jest.spyOn(resMock, 'redirect');

      await reissueToken(reqMock, resMock, nextMock);

      expect(extractTokenPayloadServiceMock).toHaveBeenCalledWith(reqMock, true);
      expect(reissueTokenServiceMock).toHaveBeenCalledWith(reqMock, atfId);
      expect(redirectMock).toHaveBeenCalledWith(
        302,
        `/availability/expired-token?token=${token}&correlationId=${correlationId}&retry=true`,
      );
    });

    it('should call res.render() with 404 status when invalid token', async () => {
      const error: InvalidTokenException = new InvalidTokenException('oops!');
      const extractTokenPayloadServiceMock = jest.spyOn(tokenService, 'extractTokenPayload');
      extractTokenPayloadServiceMock.mockImplementation(() => { throw error; });
      const statusMock = jest.spyOn(resMock, 'status');
      const renderMock = jest.spyOn(resMock, 'render');

      await reissueToken(reqMock, resMock, nextMock);

      expect(extractTokenPayloadServiceMock).toHaveBeenCalledWith(reqMock, true);
      expect(statusMock).toHaveBeenCalledWith(404);
      expect(renderMock).toHaveBeenCalledWith('error/not-found', { error: 'Invalid token' });
    });
  });

  describe('expiredToken method', () => {
    it('should call res.render() with proper params', async () => {
      const extractTokenPayloadServiceMock = jest.spyOn(tokenService, 'extractTokenPayload');
      extractTokenPayloadServiceMock.mockReturnValue(<TokenPayload> <unknown> { atfId });
      const getAtfServiceMock = jest.spyOn(availabilityService, 'getAtf');
      getAtfServiceMock.mockReturnValue(Promise.resolve(<AuthorisedTestingFacility> <unknown> { id: atfId }));
      const renderMock = jest.spyOn(resMock, 'render');

      await expiredToken(reqMock, resMock, nextMock);

      expect(extractTokenPayloadServiceMock).toHaveBeenCalledWith(reqMock, true);
      expect(getAtfServiceMock).toHaveBeenCalledWith(reqMock, atfId);
      expect(renderMock).toHaveBeenCalledWith('availability-confirmation/expired-token', { atf: { id: atfId }, token });
    });

    it('retry - should call res.render() with proper params', async () => {
      reqMock.query.retry = 'true';
      const extractTokenPayloadServiceMock = jest.spyOn(tokenService, 'extractTokenPayload');
      extractTokenPayloadServiceMock.mockReturnValue(<TokenPayload> <unknown> { atfId });
      const getAtfServiceMock = jest.spyOn(availabilityService, 'getAtf');
      getAtfServiceMock.mockReturnValue(Promise.resolve(<AuthorisedTestingFacility> <unknown> { id: atfId }));
      const renderMock = jest.spyOn(resMock, 'render');

      await expiredToken(reqMock, resMock, nextMock);

      expect(extractTokenPayloadServiceMock).toHaveBeenCalledWith(reqMock, true);
      expect(getAtfServiceMock).toHaveBeenCalledWith(reqMock, atfId);
      expect(renderMock).toHaveBeenCalledWith('availability-confirmation/expired-token-retry', {
        atf: { id: atfId },
        token,
      });
    });

    it('should call res.render() with 404 status when invalid token', async () => {
      const error: InvalidTokenException = new InvalidTokenException('oops!');
      const extractTokenPayloadServiceMock = jest.spyOn(tokenService, 'extractTokenPayload');
      extractTokenPayloadServiceMock.mockImplementation(() => { throw error; });
      const statusMock = jest.spyOn(resMock, 'status');
      const renderMock = jest.spyOn(resMock, 'render');

      await expiredToken(reqMock, resMock, nextMock);

      expect(extractTokenPayloadServiceMock).toHaveBeenCalledWith(reqMock, true);
      expect(statusMock).toHaveBeenCalledWith(404);
      expect(renderMock).toHaveBeenCalledWith('error/not-found', { error: 'Invalid token' });
    });
  });
});
