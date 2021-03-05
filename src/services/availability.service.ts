import { Request } from 'express';
import { AxiosResponse } from 'axios';
import { AuthorisedTestingFacility } from '../models/authorisedTestingFacility.model';
import { request } from '../utils/request.util';
import { TokenPayload } from '../models/token.model';
import { logger } from '../utils/logger.util';
import { Availability } from '../models/availability.model';
import { ATFOperationException } from '../exceptions/atfOperation.exception';

const getAtf = async (req: Request, id: string): Promise<AuthorisedTestingFacility> => {
  logger.info(req, `Retrieving ATF [${id}] details`);

  return request.get(
    req,
    `${process.env.API_BASE_URL_READ}/${process.env.DYNAMODB_ATF_TABLE_NAME}/${id}?keyName=id`,
  )
    .then((response: AxiosResponse<AuthorisedTestingFacility>) => response.data)
    .catch((error) => {
      const errorString: string = JSON.stringify(error, Object.getOwnPropertyNames(error));
      logger.warn(req, `Failed to retrieve ATF [${id}] details, error: ${errorString}`);
      throw new ATFOperationException();
    });
};
const updateAtfAvailability = async (req: Request, tokenPayload: TokenPayload, isAvailable: boolean): Promise<AuthorisedTestingFacility> => {
  const availability: Availability = setAvailability(tokenPayload, isAvailable);

  logger.info(
    req,
    `Updating ATF [${tokenPayload.atfId}], availability: ${JSON.stringify(isAvailable)}`,
  );

  const baseUrl = `${process.env.API_BASE_URL_WRITE}/${process.env.DYNAMODB_ATF_TABLE_NAME}`;
  const uri = `${baseUrl}/${tokenPayload.atfId}?keyName=id`;

  return request.put(req, uri, { availability })
    .then((response: AxiosResponse<AuthorisedTestingFacility>) => response.data)
    .catch((error) => {
      const errorString: string = JSON.stringify(error, Object.getOwnPropertyNames(error));
      logger.warn(req, `Failed to update ATF [${tokenPayload.atfId}] availability, error: ${errorString}`);
      throw new ATFOperationException();
    });
};

const setAvailability = (tokenPayload: TokenPayload, availability: boolean) => ({
  isAvailable: availability,
  startDate: tokenPayload.startDate,
  endDate: tokenPayload.endDate,
  lastUpdated: new Date().toISOString(),
});

export const availabilityService = {
  getAtf,
  updateAtfAvailability,
  setAvailability,
};
