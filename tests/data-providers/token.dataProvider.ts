import jwt from 'jsonwebtoken';

export const getValidToken = (): string => tokenGenerator({algorithm:"HS256",issuer:"issuer","expiresIn":60 * 60,subject:"856090d1-f2dc-4bbc-ad36-8d14382339e0"},getJwtSecret(),{startDate:1619395199,endDate:1619395199});
export const getExpiredToken = (): string => tokenGenerator({algorithm:"HS256",issuer:"issuer","expiresIn":0,subject:"856090d1-f2dc-4bbc-ad36-8d14382339e0"},getJwtSecret(),{startDate:1619395199,endDate:1619395199});
/* eslint-disable max-len */
export const getInvalidToken = (): string => 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdGFydERhdGUiOjE2MDE5OTQxMDUsImVuZERhdGUiOjE2MDQ0MTMzMDUsImlzQXZhaWxhYmxlIjp0cnVlLCJpYXQiOjMxNTUzMjgwMCwiZXhwIjozMTYwNTEyMDAsImlzcyI6Imh0dHBzOi8vYm9vay1oZ3YtYnVzLXRyYWlsZXItbW90LnNlcnZpY2UuZ292LnVrIiwic3ViIjoiMUQ2MkFCRkQtRjAzRC00REUwLTlFRDUtOEMwMkY5N0M1NTNEIn0.xW2aFHfxhXDTkxXTtqAEdnHlyJtdFhDwXdRIPqLBIck';

export const getSubMissingToken = () : string => tokenGenerator({algorithm:"HS256",issuer:"issuer","expiresIn":60 * 60},getJwtSecret(),{startDate:1619395199,endDate:1619395199});

export const getStartDateMissingToken = () : string => tokenGenerator({algorithm:"HS256",issuer:"issuer","expiresIn":60 * 60,subject:"856090d1-f2dc-4bbc-ad36-8d14382339e0"},getJwtSecret(),{endDate:1619395199});

export const getEndDateMissingToken = () : string => tokenGenerator({algorithm:"HS256",issuer:"issuer","expiresIn":60 * 60,subject:"856090d1-f2dc-4bbc-ad36-8d14382339e0"},getJwtSecret(),{startDate:1619395199});

export const getJwtSecret = (): string => 'hvtr4567'


interface payload {
    startDate?:number,
    endDate?:number
}

const tokenGenerator = (options:jwt.SignOptions, secret:string, payload?:payload, ):string => {
   return jwt.sign(payload || {}, secret, options);
}