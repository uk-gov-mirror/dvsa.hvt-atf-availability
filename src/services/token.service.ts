import { TokenStatus } from '../enums/token.enum';
import { TokenPayload } from '../models/token.model';

const getTokenStatus = (token: string): TokenStatus => {
  // TODO: add logic for retrieving token status using jsonwebtoken (RTA-19)
  if (token === 'valid') {
    return TokenStatus.VALID;
  }

  if (token === 'invalid') {
    return TokenStatus.INVALID;
  }

  return TokenStatus.EXPIRED;
};

const extractTokenPayload = (token: string): TokenPayload => ({
  // TODO: add logic for extracting token payload data using jsonwebtoken (RTA-19)
  atfId: '941E0D96-0D40-403E-A227-02CB775F0EFB',
  isAvailable: false,
  startDate: '2020-09-21T08:00:00Z',
  endDate: '2020-10-11T17:00:00Z',
});

export const tokenService = {
  getTokenStatus,
  extractTokenPayload,
};
