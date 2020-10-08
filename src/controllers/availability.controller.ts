import { Request, Response } from 'express';
import { logger } from '../utils/logger.util';
import { PageSettings } from '../models/pageSettings.model';
import { booleanHelper } from '../utils/booleanHelper.util';
import { AuthorisedTestingFacility } from '../models/authorisedTestingFacility.model';
import { availabilityService } from '../services/availability.service';
import { tokenService } from '../services/token.service';
import { TokenPayload } from '../models/token.model';

const pageSettings: PageSettings = {
  serviceName: 'Tell DVSA if you could take more MOT bookings',
  hideNewServiceBanner: true,
  hideBackLink: true,
};

export const updateAvailability = async (req: Request, res: Response): Promise<void> => {
  logger.info(req, 'Handling update ATF availability request');

  try {
    const tokenPayload: TokenPayload = tokenService.extractTokenPayload(req);
    await availabilityService.updateAtfAvailability(req, tokenPayload);

    const confirmationUri = `/availability/confirm?token=${tokenService.retrieveTokenFromQueryParams(req)}`;
    logger.info(req, `Redirecting to ${confirmationUri}`);

    return res.redirect(
      302,
      confirmationUri,
    );
  } catch (error) {
    // TODO: Add logic for handling specific exceptions (RTA-33)
    logger.info(req, 'To be implemented');
    throw error;
  }
};

export const confirmAvailability = async (req: Request, res: Response): Promise<void> => {
  logger.info(req, 'Handling confirm ATF availability request');

  try {
    const tokenPayload: TokenPayload = tokenService.extractTokenPayload(req);
    const atf: AuthorisedTestingFacility = await availabilityService.getAtf(req, tokenPayload.atfId);
    const templateName: string = booleanHelper.mapBooleanToYesNoString(atf.availability.isAvailable);

    return res.render(`availability-confirmation/${templateName}`, {
      atf,
      pageSettings,
    });
  } catch (error) {
    // TODO: Add logic for handling specific exceptions (RTA-33)
    logger.info(req, 'To be implemented');
    throw error;
  }
};
