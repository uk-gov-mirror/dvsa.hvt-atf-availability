import { Request } from 'express';

const logFormat = '{ "apiRequestId": "%s", "correlationId": "%s", "message": "%s" }';

const debug = (req: Request, msg: string): void => {
  console.debug(logFormat, req.apiGateway.event.requestContext.requestId, req.app.locals.correlationId, msg);
};

const info = (req: Request, msg: string): void => {
  console.info(logFormat, req.apiGateway.event.requestContext.requestId, req.app.locals.correlationId, msg);
};

const warn = (req: Request, msg: string): void => {
  console.warn(logFormat, req.apiGateway.event.requestContext.requestId, req.app.locals.correlationId, msg);
};

const error = (req: Request, msg: string): void => {
  console.error(logFormat, req.apiGateway.event.requestContext.requestId, req.app.locals.correlationId, msg);
};

export const logger = {
  logFormat,
  debug,
  info,
  warn,
  error,
};
