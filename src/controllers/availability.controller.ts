import { NextFunction, Request, Response } from 'express';
import { logger } from '../utils/logger.util';
import { booleanHelper } from '../utils/booleanHelper.util';
import { AuthorisedTestingFacility } from '../models/authorisedTestingFacility.model';
import { availabilityService } from '../services/availability.service';
import { tokenService } from '../services/token.service';
import { TokenPayload } from '../models/token.model';
import { ExpiredTokenException } from '../exceptions/expiredToken.exception';
import { InvalidTokenException } from '../exceptions/invalidToken.exception';

const buildRedirectUri = (baseUri: string, req: Request, retry = false) : string => {
  const tokenParam = `?token=${tokenService.retrieveTokenFromQueryParams(req)}`;
  // Headers are removed when redirecting, so the Correlation ID is extracted and set as a Query Parameter
  const correlationId = `&correlationId=${<string> req.app.locals.correlationId}`;
  const retryParam: string = retry ? '&retry=true' : '';
  const redirectUri = `${baseUri}${tokenParam}${correlationId}${retryParam}`;

  logger.info(req, `Redirecting to ${redirectUri}`);
  return redirectUri;
};

export const updateAvailability = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  logger.info(req, 'Handling update ATF availability request');

  try {
    const tokenPayload: TokenPayload = tokenService.extractTokenPayload(req);
    await availabilityService.updateAtfAvailability(req, tokenPayload);

    return res.redirect(302, buildRedirectUri('/availability/confirm', req));
  } catch (error) {
    if (error instanceof ExpiredTokenException) {
      return res.redirect(302, buildRedirectUri('/availability/reissue-token', req));
    }

    if (error instanceof InvalidTokenException) {
      return res.status(404).render('error/service-unavailable');
    }

    logger.error(req, `An unexpected error occured: ${JSON.stringify(error, Object.getOwnPropertyNames(error))}`);
    return next(error);
  }
};

export const confirmAvailability = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  logger.info(req, 'Handling confirm ATF availability request');

  try {
    const tokenPayload: TokenPayload = tokenService.extractTokenPayload(req);
    const atf: AuthorisedTestingFacility = await availabilityService.getAtf(req, tokenPayload.atfId);
    const templateName: string = booleanHelper.mapBooleanToYesNoString(atf.availability.isAvailable);

    return res.render(`availability-confirmation/${templateName}`, { atf });
  } catch (error) {
    if (error instanceof ExpiredTokenException) {
      return res.redirect(302, buildRedirectUri('/availability/reissue-token', req));
    }

    if (error instanceof InvalidTokenException) {
      return res.status(404).render('error/service-unavailable');
    }

    logger.error(req, `An unexpected error occured: ${JSON.stringify(error, Object.getOwnPropertyNames(error))}`);
    return next(error);
  }
};

export const reissueToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  logger.info(req, 'Handling ATF reissue token request');

  try {
    const tokenPayload: TokenPayload = tokenService.extractTokenPayload(req, true);
    await tokenService.reissueToken(req, tokenPayload.atfId);

    const retry: boolean = (req.query?.retry === 'true');
    return res.redirect(302, buildRedirectUri('/availability/expired-token', req, retry));
  } catch (error) {
    if (error instanceof InvalidTokenException) {
      return res.status(404).render('error/service-unavailable');
    }

    logger.error(req, `An unexpected error occured: ${JSON.stringify(error, Object.getOwnPropertyNames(error))}`);
    return next(error);
  }
};

export const expiredToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  logger.info(req, 'Handling ATF expired token request');

  try {
    const tokenPayload: TokenPayload = tokenService.extractTokenPayload(req, true);
    const atf: AuthorisedTestingFacility = await availabilityService.getAtf(req, tokenPayload.atfId);

    const retry: boolean = (req.query?.retry === 'true');
    const template = `availability-confirmation/expired-token${retry ? '-retry' : ''}`;

    return res.render(template, { atf, token: tokenService.retrieveTokenFromQueryParams(req) });
  } catch (error) {
    if (error instanceof InvalidTokenException) {
      return res.status(404).render('error/service-unavailable');
    }

    logger.error(req, `An unexpected error occured: ${JSON.stringify(error, Object.getOwnPropertyNames(error))}`);
    return next(error);
  }
};
