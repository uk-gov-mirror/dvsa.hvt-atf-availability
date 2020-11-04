import { NextFunction, Response, Request } from 'express';
import { v4 } from 'uuid';
import { getCorrelationId } from '../../src/middleware/correlation.middleware';

let awsRequestId: string;
let correlationId: string;
let reqMock: Request;
let resMock: Response;
let nextMock: NextFunction;

describe('correlation middleware', () => {
  beforeEach(() => {
    awsRequestId = v4();
    correlationId = v4();
    reqMock = <Request> <unknown> {
      apiGateway: {
        context: { awsRequestId },
        event: { headers: {} },
      },
      query: {},
      app: { locals: { } },
    };
    resMock = <Response> <unknown> { redirect: jest.fn(), render: jest.fn(), status: jest.fn().mockReturnThis() };
    nextMock = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('getCorrelationId() gets the corrleation ID from the request headers', () => {
    reqMock.apiGateway.event.headers = { 'X-Correlation-Id': correlationId };

    getCorrelationId(reqMock, resMock, nextMock);

    expect(reqMock.app.locals).toEqual({ correlationId });
    expect(nextMock).toHaveBeenCalledWith();
  });

  test('getCorrelationId() gets the corrleation ID from the request query params', () => {
    reqMock.query = { correlationId };

    getCorrelationId(reqMock, resMock, nextMock);

    expect(reqMock.app.locals).toEqual({ correlationId });
    expect(nextMock).toHaveBeenCalledWith();
  });

  test('getCorrelationId() sets the corrleation ID when none is found', () => {
    getCorrelationId(reqMock, resMock, nextMock);

    expect(reqMock.app.locals).toEqual({ correlationId: awsRequestId });
    expect(nextMock).toHaveBeenCalledWith();
  });
});
