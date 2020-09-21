import axios, { AxiosResponse } from 'axios';
import { Request, Response } from 'express';

export const index = async (req: Request, res: Response): Promise<void> => {
  const responseData: Record<string, unknown> = await axios
    .get(
      'http://host.docker.internal:3000/?message=api%20integration%20successful',
      { headers: { 'X-Correlation-Id': req.apiGateway.context.awsRequestId } },
    )
    .then((response: AxiosResponse<Record<string, unknown>>) => response.data)
    .catch((err) => {
      console.error(err);
      return {};
    });

  return res.render('index', {
    message: `Hello world! - here's some data from the API: ${JSON.stringify(responseData)}`,
  });
};
