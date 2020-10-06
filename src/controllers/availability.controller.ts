import { Request, Response } from 'express';
import { logger } from '../utils/logger.util';
import { PageSettings } from '../models/pageSettings.model';
import { booleanHelper } from '../utils/booleanHelper.util';
import { AuthorisedTestingFacility } from '../models/authorisedTestingFacility.model';
import { availabilityService } from '../services/availability.service';
import { tokenService } from '../services/token.service';
import { TokenStatus } from '../enums/token.enum';
import { TokenPayload } from '../models/token.model';

const pageSettings: PageSettings = {
  serviceName: 'Tell DVSA if you could take more MOT bookings',
  hideNewServiceBanner: true,
  hideBackLink: true,
};

export const updateAvailability = async (req: Request, res: Response): Promise<void> => {
  const token: string = retrieveToken(req);
  logger.info(req, `Handling update ATF availability request, token: ${token}`);

  try {
    const tokenStatus: TokenStatus = tokenService.getTokenStatus(token);

    if ([TokenStatus.INVALID, TokenStatus.EXPIRED].includes(tokenStatus)) {
      // TODO: add logic for handling invalid/expired statuses (RTA-33)
      throw new Error('Not yet implemented!');
    }

    const tokenPayload: TokenPayload = tokenService.extractTokenPayload(token);

    logger.info(req, 'Valid token provided');
    await availabilityService.updateAtfAvailability(req, tokenPayload);

    const confirmationUri = `/availability/confirm?token=${token}`;
    logger.info(req, `Redirecting to ${confirmationUri}`);

    return res.redirect(
      302,
      confirmationUri,
    );
  } catch (error) {
    logger.error(req, error);
    throw error;
  }
};

export const confirmAvailability = async (req: Request, res: Response): Promise<void> => {
  const token: string = retrieveToken(req);
  logger.info(req, `Handling confirm ATF availability request, token: ${token}`);

  try {
    const tokenStatus: TokenStatus = tokenService.getTokenStatus(token);

    if ([TokenStatus.INVALID, TokenStatus.EXPIRED].includes(tokenStatus)) {
      // TODO: add logic for handling invalid/expired statuses (RTA-33)
      throw new Error('Not yet implemented!');
    }

    const tokenPayload: TokenPayload = tokenService.extractTokenPayload(token);
    const atf: AuthorisedTestingFacility = await availabilityService.getAtf(req, tokenPayload.atfId);
    const templateName: string = booleanHelper.mapBooleanToYesNoString(atf.availability.isAvailable);

    return res.render(`availability-confirmation/${templateName}`, {
      atf,
      pageSettings,
    });
  } catch (error) {
    logger.error(req, error);
    throw error;
  }
};

const retrieveToken = (req: Request): string => <string> req.query?.token;
