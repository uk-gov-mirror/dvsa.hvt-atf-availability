import { v4 } from 'uuid';
import { Request } from 'express';
import { logger } from '../../src/utils/logger.util';

let apiRequestId: string;
let awsRequestId: string;
let requestMock: Request;

describe('Test logger', () => {
  beforeAll(() => {
    apiRequestId = v4();
    awsRequestId = v4();
    requestMock = <Request> <unknown> {
      apiGateway: { event: { requestContext: { requestId: apiRequestId } } },
      app: { locals: { correlationId: awsRequestId } },
    };
  });

  test('logger.debug() calls console.debug() with expected parameters', () => {
    console.debug = jest.fn();

    logger.debug(requestMock, 'hello');

    expect(console.debug).toHaveBeenCalledWith(logger.logFormat, apiRequestId, awsRequestId, 'hello');
  });

  test('logger.info() calls console.info() with expected parameters', () => {
    console.info = jest.fn();

    logger.info(requestMock, 'hello');

    expect(console.info).toHaveBeenCalledWith(logger.logFormat, apiRequestId, awsRequestId, 'hello');
  });

  test('logger.warn() calls console.warn() with expected parameters', () => {
    console.warn = jest.fn();

    logger.warn(requestMock, 'hello');

    expect(console.warn).toHaveBeenCalledWith(logger.logFormat, apiRequestId, awsRequestId, 'hello');
  });

  test('logger.error() calls console.error() with expected parameters', () => {
    console.error = jest.fn();

    logger.error(requestMock, 'hello');

    expect(console.error).toHaveBeenCalledWith(logger.logFormat, apiRequestId, awsRequestId, 'hello');
  });
});
