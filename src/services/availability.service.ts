import { Request } from 'express';
import { AxiosResponse } from 'axios';
import { AuthorisedTestingFacility, Availability } from '../models/authorisedTestingFacility.model';
import { request } from '../utils/request.util';
import { TokenPayload } from '../models/token.model';
import { logger } from '../utils/logger.util';

const getAtf = async (req: Request, id: string): Promise<AuthorisedTestingFacility> => {
  logger.info(req, `Retrieving ATF [${id}] details`);

  return request.get(
    req,
    `${process.env.API_BASE_URL_READ}${process.env.DYNAMODB_ATF_TABLE_NAME}/${id}?keyName=id`,
  )
    .then((response: AxiosResponse<AuthorisedTestingFacility>) => response.data)
    .catch((error) => {
      const errorString: string = JSON.stringify(error, Object.getOwnPropertyNames(error));
      logger.warn(req, `Could not retrieve ATF [${id}] details, error: ${errorString}`);

      return <AuthorisedTestingFacility> {};
    });
};
const updateAtfAvailability = async (req: Request, tokenPayload: TokenPayload): Promise<AuthorisedTestingFacility> => {
  const availability: Availability = {
    isAvailable: tokenPayload.isAvailable,
    startDate: tokenPayload.startDate,
    endDate: tokenPayload.endDate,
    lastUpdated: new Date().toISOString(),
  };

  logger.info(
    req,
    `Updating ATF [${tokenPayload.atfId}], availability: ${JSON.stringify(availability)}`,
  );

  const baseUrl = `${process.env.API_BASE_URL_WRITE}${process.env.DYNAMODB_ATF_TABLE_NAME}`;
  const uri = `${baseUrl}/${tokenPayload.atfId}?keyName=id`;

  return request.put(req, uri, { availability })
    .then((response: AxiosResponse<AuthorisedTestingFacility>) => response.data)
    .catch((error) => {
      const errorString: string = JSON.stringify(error, Object.getOwnPropertyNames(error));
      logger.warn(req, `Could not update ATF [${tokenPayload.atfId}] details, error: ${errorString}`);

      return <AuthorisedTestingFacility> {};
    });
};

export const availabilityService = {
  getAtf,
  updateAtfAvailability,
};
