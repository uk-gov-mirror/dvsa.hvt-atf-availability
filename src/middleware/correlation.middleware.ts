import { NextFunction, Request, Response } from 'express';

// Extract the Correlation ID from Headers or Query Parameters; default to AWS Request ID
export const getCorrelationId = (req: Request, res: Response, next: NextFunction): void => {
  const corrIdHeader: string = req.apiGateway.event.headers['X-Correlation-Id'];
  const corrIdParam: string = <string> req.query?.correlationId;
  const { awsRequestId } = req.apiGateway.context;
  const correlationId: string = corrIdHeader || corrIdParam || awsRequestId;

  req.app.locals.correlationId = correlationId;
  next();
};
