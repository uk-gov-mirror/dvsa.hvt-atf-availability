import { v4 } from 'uuid';
import { Request, NextFunction, Response } from 'express';
import { AxiosResponse } from 'axios';
import {
  reissueToken, expiredToken, updateAvailability, confirmAvailability,
  accessibility, privacy,
} from '../../src/controllers/index.controller';
import { tokenService } from '../../src/services/token.service';
import { TokenPayload } from '../../src/models/token.model';
import { availabilityService } from '../../src/services/availability.service';
import { AuthorisedTestingFacility } from '../../src/models/authorisedTestingFacility.model';
import { InvalidTokenException } from '../../src/exceptions/invalidToken.exception';
import { ExpiredTokenException } from '../../src/exceptions/expiredToken.exception';
import { ATFOperationException } from '../../src/exceptions/atfOperation.exception';

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
      extractTokenPayloadServiceMock.mockReturnValue(Promise.resolve(<TokenPayload> <unknown> { atfId }));
      const updateAtfServiceMock = jest.spyOn(availabilityService, 'updateAtfAvailability');
      updateAtfServiceMock.mockReturnValue(Promise.resolve(<AuthorisedTestingFacility> <unknown> { id: atfId }));
      const redirectMock = jest.spyOn(resMock, 'redirect');

      await updateAvailability(reqMock, resMock, nextMock);

      expect(extractTokenPayloadServiceMock).toHaveBeenCalledWith(reqMock);
      expect(updateAtfServiceMock).toHaveBeenCalledWith(reqMock, { atfId });
      expect(redirectMock).toHaveBeenCalledWith(
        302,
        `/confirm?token=${token}&correlationId=${correlationId}`,
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
        `/reissue-token?token=${token}&correlationId=${correlationId}`,
      );
    });

    it('should call res.render() with 500 status when invalid token', async () => {
      const error: InvalidTokenException = new InvalidTokenException('oops!');
      const extractTokenPayloadServiceMock = jest.spyOn(tokenService, 'extractTokenPayload');
      extractTokenPayloadServiceMock.mockImplementation(() => { throw error; });
      const statusMock = jest.spyOn(resMock, 'status');
      const renderMock = jest.spyOn(resMock, 'render');

      await updateAvailability(reqMock, resMock, nextMock);

      expect(extractTokenPayloadServiceMock).toHaveBeenCalledWith(reqMock);
      expect(statusMock).toHaveBeenCalledWith(500);
      expect(renderMock).toHaveBeenCalledWith('error/service-unavailable');
    });

    it('should call res.render() with 500 status when atf is not found', async () => {
      const error: ATFOperationException = new ATFOperationException();
      const extractTokenPayloadServiceMock = jest.spyOn(tokenService, 'extractTokenPayload');
      extractTokenPayloadServiceMock.mockReturnValue(Promise.resolve(<TokenPayload> {}));
      const updateAtfAvailabilityServiceMock = jest.spyOn(availabilityService, 'updateAtfAvailability');
      updateAtfAvailabilityServiceMock.mockImplementation(() => { throw error; });
      const statusMock = jest.spyOn(resMock, 'status');
      const renderMock = jest.spyOn(resMock, 'render');

      await updateAvailability(reqMock, resMock, nextMock);

      expect(extractTokenPayloadServiceMock).toHaveBeenCalledWith(reqMock);
      expect(statusMock).toHaveBeenCalledWith(500);
      expect(renderMock).toHaveBeenCalledWith('error/service-unavailable');
    });

    it('should call next(error) when unhandled error', async () => {
      const error: Error = new Error('Oops!');
      const extractTokenPayloadServiceMock = jest.spyOn(tokenService, 'extractTokenPayload');
      extractTokenPayloadServiceMock.mockReturnValue(Promise.resolve(<TokenPayload> {}));
      const updateAtfAvailabilityServiceMock = jest.spyOn(availabilityService, 'updateAtfAvailability');
      updateAtfAvailabilityServiceMock.mockImplementation(() => { throw error; });

      await updateAvailability(reqMock, resMock, nextMock);

      expect(extractTokenPayloadServiceMock).toHaveBeenCalledWith(reqMock);
      expect(nextMock).toHaveBeenCalledWith(error);
    });
  });

  describe('confirmAvailability method', () => {
    it('should call res.render() with proper params when specifying `yes` for isAvailable', async () => {
      const extractTokenPayloadServiceMock = jest.spyOn(tokenService, 'extractTokenPayload');
      extractTokenPayloadServiceMock.mockReturnValue(Promise.resolve(<TokenPayload> <unknown> { atfId }));
      const getAtfServiceMock = jest.spyOn(availabilityService, 'getAtf');
      getAtfServiceMock.mockReturnValue(
        Promise.resolve(
          <AuthorisedTestingFacility> <unknown> {
            id: atfId,
            availability: {
              isAvailable: true,
              endDate: '2020-10-11T17:00:00.000Z',
            },
          },
        ),
      );
      const renderMock = jest.spyOn(resMock, 'render');

      await confirmAvailability(reqMock, resMock, nextMock);

      expect(extractTokenPayloadServiceMock).toHaveBeenCalledWith(reqMock);
      expect(getAtfServiceMock).toHaveBeenCalledWith(reqMock, atfId);
      expect(renderMock).toHaveBeenCalledWith('availability-confirmation/yes', {
        atf: {
          id: atfId,
          availability: {
            isAvailable: true,
            endDate: '2020-10-10T17:00:00.000Z',
          },
        },
      });
    });

    it('should call res.render() with proper params when specifying `no` for isAvailable', async () => {
      const extractTokenPayloadServiceMock = jest.spyOn(tokenService, 'extractTokenPayload');
      extractTokenPayloadServiceMock.mockReturnValue(Promise.resolve(<TokenPayload> <unknown> { atfId }));
      const getAtfServiceMock = jest.spyOn(availabilityService, 'getAtf');
      getAtfServiceMock.mockReturnValue(
        Promise.resolve(
          <AuthorisedTestingFacility> <unknown> {
            id: atfId,
            availability: {
              isAvailable: false,
              endDate: '2020-10-11T17:00:00.000Z',
            },
          },
        ),
      );
      const renderMock = jest.spyOn(resMock, 'render');

      await confirmAvailability(reqMock, resMock, nextMock);

      expect(extractTokenPayloadServiceMock).toHaveBeenCalledWith(reqMock);
      expect(getAtfServiceMock).toHaveBeenCalledWith(reqMock, atfId);
      expect(renderMock).toHaveBeenCalledWith('availability-confirmation/no', {
        atf: {
          id: atfId,
          availability: {
            isAvailable: false,
            endDate: '2020-10-10T17:00:00.000Z',
          },
        },
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
        `/reissue-token?token=${token}&correlationId=${correlationId}`,
      );
    });

    it('should call res.render() with 500 status when invalid token', async () => {
      const error: InvalidTokenException = new InvalidTokenException('oops!');
      const extractTokenPayloadServiceMock = jest.spyOn(tokenService, 'extractTokenPayload');
      extractTokenPayloadServiceMock.mockImplementation(() => { throw error; });
      const statusMock = jest.spyOn(resMock, 'status');
      const renderMock = jest.spyOn(resMock, 'render');

      await confirmAvailability(reqMock, resMock, nextMock);

      expect(extractTokenPayloadServiceMock).toHaveBeenCalledWith(reqMock);
      expect(statusMock).toHaveBeenCalledWith(500);
      expect(renderMock).toHaveBeenCalledWith('error/service-unavailable');
    });

    it('should call res.render() with 500 status when atf is not found', async () => {
      const error: ATFOperationException = new ATFOperationException();
      const extractTokenPayloadServiceMock = jest.spyOn(tokenService, 'extractTokenPayload');
      extractTokenPayloadServiceMock.mockReturnValue(Promise.resolve(<TokenPayload> {}));
      const getAtfAvailabilityServiceMock = jest.spyOn(availabilityService, 'getAtf');
      getAtfAvailabilityServiceMock.mockImplementation(() => { throw error; });
      const statusMock = jest.spyOn(resMock, 'status');
      const renderMock = jest.spyOn(resMock, 'render');

      await confirmAvailability(reqMock, resMock, nextMock);

      expect(extractTokenPayloadServiceMock).toHaveBeenCalledWith(reqMock);
      expect(statusMock).toHaveBeenCalledWith(500);
      expect(renderMock).toHaveBeenCalledWith('error/service-unavailable');
    });

    it('should call next(error) when unhandled error', async () => {
      const error: Error = new Error('Oops!');
      const extractTokenPayloadServiceMock = jest.spyOn(tokenService, 'extractTokenPayload');
      extractTokenPayloadServiceMock.mockReturnValue(Promise.resolve(<TokenPayload> {}));
      const getAtfAvailabilityServiceMock = jest.spyOn(availabilityService, 'getAtf');
      getAtfAvailabilityServiceMock.mockImplementation(() => { throw error; });

      await confirmAvailability(reqMock, resMock, nextMock);

      expect(extractTokenPayloadServiceMock).toHaveBeenCalledWith(reqMock);
      expect(nextMock).toHaveBeenCalledWith(error);
    });
  });

  describe('reissueToken method', () => {
    it('should call res.redirect() with proper params', async () => {
      const extractTokenPayloadServiceMock = jest.spyOn(tokenService, 'extractTokenPayload');
      extractTokenPayloadServiceMock.mockReturnValue(Promise.resolve(<TokenPayload> <unknown> { atfId }));
      const reissueTokenServiceMock = jest.spyOn(tokenService, 'reissueToken');
      reissueTokenServiceMock.mockReturnValue(Promise.resolve(<AxiosResponse> {}));
      const redirectMock = jest.spyOn(resMock, 'redirect');

      await reissueToken(reqMock, resMock, nextMock);

      expect(extractTokenPayloadServiceMock).toHaveBeenCalledWith(reqMock, true);
      expect(reissueTokenServiceMock).toHaveBeenCalledWith(reqMock, atfId);
      expect(redirectMock).toHaveBeenCalledWith(
        302,
        `/expired-token?token=${token}&correlationId=${correlationId}`,
      );
    });

    it('retry - should call res.redirect() with proper params', async () => {
      reqMock.query.retry = 'true';
      const extractTokenPayloadServiceMock = jest.spyOn(tokenService, 'extractTokenPayload');
      extractTokenPayloadServiceMock.mockReturnValue(Promise.resolve(<TokenPayload> <unknown> { atfId }));
      const reissueTokenServiceMock = jest.spyOn(tokenService, 'reissueToken');
      reissueTokenServiceMock.mockReturnValue(Promise.resolve(<AxiosResponse> {}));
      const redirectMock = jest.spyOn(resMock, 'redirect');

      await reissueToken(reqMock, resMock, nextMock);

      expect(extractTokenPayloadServiceMock).toHaveBeenCalledWith(reqMock, true);
      expect(reissueTokenServiceMock).toHaveBeenCalledWith(reqMock, atfId);
      expect(redirectMock).toHaveBeenCalledWith(
        302,
        `/expired-token?token=${token}&correlationId=${correlationId}&retry=true`,
      );
    });

    it('should call res.render() with 500 status when invalid token', async () => {
      const error: InvalidTokenException = new InvalidTokenException('oops!');
      const extractTokenPayloadServiceMock = jest.spyOn(tokenService, 'extractTokenPayload');
      extractTokenPayloadServiceMock.mockImplementation(() => { throw error; });
      const statusMock = jest.spyOn(resMock, 'status');
      const renderMock = jest.spyOn(resMock, 'render');

      await reissueToken(reqMock, resMock, nextMock);

      expect(extractTokenPayloadServiceMock).toHaveBeenCalledWith(reqMock, true);
      expect(statusMock).toHaveBeenCalledWith(500);
      expect(renderMock).toHaveBeenCalledWith('error/service-unavailable');
    });

    it('should call next(error) when unhandled error', async () => {
      const error: Error = new Error('oops!');
      const extractTokenPayloadServiceMock = jest.spyOn(tokenService, 'extractTokenPayload');
      extractTokenPayloadServiceMock.mockImplementation(() => { throw error; });

      await reissueToken(reqMock, resMock, nextMock);

      expect(extractTokenPayloadServiceMock).toHaveBeenCalledWith(reqMock, true);
      expect(nextMock).toHaveBeenCalledWith(error);
    });
  });

  describe('expiredToken method', () => {
    it('should call res.render() with proper params', async () => {
      const extractTokenPayloadServiceMock = jest.spyOn(tokenService, 'extractTokenPayload');
      extractTokenPayloadServiceMock.mockReturnValue(Promise.resolve(<TokenPayload> <unknown> { atfId }));
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
      extractTokenPayloadServiceMock.mockReturnValue(Promise.resolve(<TokenPayload> <unknown> { atfId }));
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

    it('should call res.render() with 500 status when invalid token', async () => {
      const error: InvalidTokenException = new InvalidTokenException('oops!');
      const extractTokenPayloadServiceMock = jest.spyOn(tokenService, 'extractTokenPayload');
      extractTokenPayloadServiceMock.mockImplementation(() => { throw error; });
      const statusMock = jest.spyOn(resMock, 'status');
      const renderMock = jest.spyOn(resMock, 'render');

      await expiredToken(reqMock, resMock, nextMock);

      expect(extractTokenPayloadServiceMock).toHaveBeenCalledWith(reqMock, true);
      expect(statusMock).toHaveBeenCalledWith(500);
      expect(renderMock).toHaveBeenCalledWith('error/service-unavailable');
    });

    it('should call res.render() with 500 status when atf is not found', async () => {
      const error: ATFOperationException = new ATFOperationException();
      const extractTokenPayloadServiceMock = jest.spyOn(tokenService, 'extractTokenPayload');
      extractTokenPayloadServiceMock.mockReturnValue(Promise.resolve(<TokenPayload> {}));
      const getAtfAvailabilityServiceMock = jest.spyOn(availabilityService, 'getAtf');
      getAtfAvailabilityServiceMock.mockImplementation(() => { throw error; });
      const statusMock = jest.spyOn(resMock, 'status');
      const renderMock = jest.spyOn(resMock, 'render');

      await expiredToken(reqMock, resMock, nextMock);

      expect(extractTokenPayloadServiceMock).toHaveBeenCalledWith(reqMock, true);
      expect(statusMock).toHaveBeenCalledWith(500);
      expect(renderMock).toHaveBeenCalledWith('error/service-unavailable');
    });

    it('should call next(error) when unhandled error', async () => {
      const error: Error = new Error('oops!');
      const extractTokenPayloadServiceMock = jest.spyOn(tokenService, 'extractTokenPayload');
      extractTokenPayloadServiceMock.mockImplementation(() => { throw error; });

      await expiredToken(reqMock, resMock, nextMock);

      expect(extractTokenPayloadServiceMock).toHaveBeenCalledWith(reqMock, true);
      expect(nextMock).toHaveBeenCalledWith(error);
    });
  });

  describe('privacy method', () => {
    it('should render index/privacy page', () => {
      const renderMock = jest.spyOn(resMock, 'render');

      privacy(reqMock, resMock);

      expect(renderMock).toHaveBeenCalledWith('index/privacy');
    });
  });

  describe('accessibility method', () => {
    it('should render index/accessibility page', () => {
      const renderMock = jest.spyOn(resMock, 'render');

      accessibility(reqMock, resMock);

      expect(renderMock).toHaveBeenCalledWith('index/accessibility');
    });
  });
});
