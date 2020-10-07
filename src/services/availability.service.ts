import { Request } from 'express';
import { AxiosResponse } from 'axios';
import { AuthorisedTestingFacility, Availability } from '../models/authorisedTestingFacility.model';
import { request } from '../utils/request.util';
import { TokenPayload } from '../models/token.model';
import { logger } from '../utils/logger.util';

const getAtf = async (req: Request, id: string): Promise<AuthorisedTestingFacility> => request.get(
  req,
  `${process.env.API_BASE_URL_READ}${process.env.DYNAMODB_ATF_TABLE_NAME}/${id}?keyName=id`,
)
  .then((response: AxiosResponse<AuthorisedTestingFacility>) => response.data);

const updateAtfAvailability = async (req: Request, tokenPayload: TokenPayload): Promise<AuthorisedTestingFacility> => {
  const availability: Availability = {
    isAvailable: tokenPayload.isAvailable,
    startDate: tokenPayload.startDate,
    endDate: tokenPayload.endDate,
    lastUpdated: new Date().toISOString(),
  };

  logger.info(
    req,
    `Updating ATF availability, ATF id: ${tokenPayload.atfId}, availability: ${JSON.stringify(availability)}`,
  );

  return request.put(
    req,
    `${process.env.API_BASE_URL_WRITE}${process.env.DYNAMODB_ATF_TABLE_NAME}/${tokenPayload.atfId}?keyName=id`,
    { availability },
  )
    .then((response: AxiosResponse<AuthorisedTestingFacility>) => response.data)
    .catch((error) => {
      logger.error(req, `Could not update ATF availability, error: ${JSON.stringify(error)}`);

      return <AuthorisedTestingFacility> {};
    });
};

export const availabilityService = {
  getAtf,
  updateAtfAvailability,
};
