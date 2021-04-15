import { NextFunction, Request, Response } from 'express';
import { logger } from '../utils/logger.util';
import { booleanHelper } from '../utils/booleanHelper.util';
import { getDefaultChoiceError } from '../utils/errors.util';
import { AuthorisedTestingFacility } from '../models/authorisedTestingFacility.model';
import { availabilityService } from '../services/availability.service';
import { tokenService } from '../services/token.service';
import { TokenPayload } from '../models/token.model';
import { ExpiredTokenException } from '../exceptions/expiredToken.exception';
import { InvalidTokenException } from '../exceptions/invalidToken.exception';
import { ATFOperationException } from '../exceptions/atfOperation.exception';

const buildRedirectUri = (baseUri: string, req: Request, retry = false) : string => {
  const tokenParam = `?token=${tokenService.retrieveTokenFromQueryParams(req)}`;
  // Headers are removed when redirecting, so the Correlation ID is extracted and set as a Query Parameter
  const correlationId = `&correlationId=${<string> req.app.locals.correlationId}`;
  const retryParam: string = retry ? '&retry=true' : '';
  const redirectUri = `${baseUri}${tokenParam}${correlationId}${retryParam}`;

  logger.info(req, `Redirecting to ${redirectUri}`);
  return redirectUri;
};

export const updateAvailability = async(req:Request, res:Response, next: NextFunction): Promise<void> => {
  logger.info(req, 'presenting ATF availability choice');
  try {
    const tokenPayload: TokenPayload = await tokenService.extractTokenPayload(req);
    let atf: AuthorisedTestingFacility = await availabilityService.getAtf(req, tokenPayload.atfId);
    atf.availability = availabilityService.setAvailability(tokenPayload, false);
    atf.token = tokenService.retrieveTokenFromQueryParams(req);
    logger.debug(req,"Start date retrieved  " + new Date(tokenPayload.startDate).toISOString);
    logger.debug(req,"End date retrieved  " + new Date(tokenPayload.endDate).toISOString);

    res.render('availability-confirmation/choose', {'atf':atf})

  } catch (error) {
    if (error instanceof ExpiredTokenException) {
      return res.redirect(302, buildRedirectUri('/reissue-token', req));
    }

    if (error instanceof InvalidTokenException || error instanceof ATFOperationException) {
      return res.status(500).render('error/service-unavailable');
    }

    return next(error);
  }
}

export const confirmAvailability = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  logger.info(req, 'Handling confirm ATF availability request');
  const availability = req.body?.availability || undefined;
  try {
    const tokenPayload: TokenPayload = await tokenService.extractTokenPayload(req);
    let atf: AuthorisedTestingFacility = await availabilityService.getAtf(req, tokenPayload.atfId);
    atf.token = tokenService.retrieveTokenFromQueryParams(req);
    if(availability === undefined) {
      return res.render('availability-confirmation/choose',{
        'atf':atf,
        hasErrors:true,
        formErrors:getDefaultChoiceError()
      })
    }
    const newAvailability = await availabilityService.updateAtfAvailability(req, tokenPayload, (availability === 'true'));
    logger.info(req, `update response is ${newAvailability.availability.isAvailable.toString()} set for ${newAvailability.id}`);

    // Bug - new dates aren't getting set for the template
    // availability & last updated value is not guaranteed to be there on the atf object
    atf.availability.startDate = newAvailability.availability.startDate;
    atf.availability.endDate = newAvailability.availability.endDate;
    atf.availability.isAvailable = availability;
    // don't set las updated value as this should show when the user LAST updated. Check in template is the value is there - if not, don't display that line

    const templateName: string = booleanHelper.mapBooleanToYesNoString((availability === 'true'));
    return res.render(`availability-confirmation/${templateName}`, { atf });
  } catch (error) {
    if (error instanceof ExpiredTokenException) {
      return res.redirect(302, buildRedirectUri('/reissue-token', req));
    }

    if (error instanceof InvalidTokenException || error instanceof ATFOperationException) {
      return res.status(500).render('error/service-unavailable');
    }

    return next(error);
  }
};

export const reissueToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  logger.info(req, 'Handling ATF reissue token request');

  try {
    const tokenPayload: TokenPayload = await tokenService.extractTokenPayload(req, true);
    await tokenService.reissueToken(req, tokenPayload.atfId);

    const retry: boolean = (req.query?.retry === 'true');
    return res.redirect(302, buildRedirectUri('/expired-token', req, retry));
  } catch (error) {
    if (error instanceof InvalidTokenException) {
      return res.status(500).render('error/service-unavailable');
    }

    return next(error);
  }
};

export const expiredToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  logger.info(req, 'Handling ATF expired token request');

  try {
    const tokenPayload: TokenPayload = await tokenService.extractTokenPayload(req, true);
    const atf: AuthorisedTestingFacility = await availabilityService.getAtf(req, tokenPayload.atfId);

    const retry: boolean = (req.query?.retry === 'true');
    const template = `availability-confirmation/expired-token${retry ? '-retry' : ''}`;

    return res.render(template, { atf, token: tokenService.retrieveTokenFromQueryParams(req) });
  } catch (error) {
    if (error instanceof InvalidTokenException || error instanceof ATFOperationException) {
      return res.status(500).render('error/service-unavailable');
    }

    return next(error);
  }
};

export const privacy = (req: Request, res: Response) => res.render('index/privacy');

export const accessibility = (req: Request, res: Response) => res.render('index/accessibility');
