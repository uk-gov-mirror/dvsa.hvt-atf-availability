/* eslint-disable max-len */
export const getValidYesToken = (): string => 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdGFydERhdGUiOjE2MDE5OTQxMDUsImVuZERhdGUiOjE2MDQ0MTMzMDUsImlzQXZhaWxhYmxlIjp0cnVlLCJpYXQiOjE2MDE5OTQxMDUsImV4cCI6MTkxOTg3NDE4MSwiaXNzIjoiaHR0cHM6Ly9ib29rLWhndi1idXMtdHJhaWxlci1tb3Quc2VydmljZS5nb3YudWsiLCJzdWIiOiIxRDYyQUJGRC1GMDNELTRERTAtOUVENS04QzAyRjk3QzU1M0QifQ.FAi7W62qXv5wbD0MbDLqWzGXj6MzGh1QZksSj5uTdhM';
export const getValidNoToken = (): string => 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdGFydERhdGUiOjE2MDE5OTQxMDUsImVuZERhdGUiOjE2MDQ0MTMzMDUsImlzQXZhaWxhYmxlIjpmYWxzZSwiaWF0IjoxNjAxOTk0MTA1LCJleHAiOjE5MTk4NzQxODEsImlzcyI6Imh0dHBzOi8vYm9vay1oZ3YtYnVzLXRyYWlsZXItbW90LnNlcnZpY2UuZ292LnVrIiwic3ViIjoiMUQ2MkFCRkQtRjAzRC00REUwLTlFRDUtOEMwMkY5N0M1NTNEIn0.IRaSjlnmeYeqLLObMC1vL9NAhwjDrvNPZhAewWggW_0';
export const getExpiredYesToken = (): string => 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdGFydERhdGUiOjE2MDE5OTQxMDUsImVuZERhdGUiOjE2MDQ0MTMzMDUsImlzQXZhaWxhYmxlIjp0cnVlLCJpYXQiOjMxNTUzMjgwMCwiZXhwIjozMTYwNTEyMDAsImlzcyI6Imh0dHBzOi8vYm9vay1oZ3YtYnVzLXRyYWlsZXItbW90LnNlcnZpY2UuZ292LnVrIiwic3ViIjoiMUQ2MkFCRkQtRjAzRC00REUwLTlFRDUtOEMwMkY5N0M1NTNEIn0.xZLsIWl_zRVZzinIdKQ6uZzjsoEjBGK_VX-O9SQP65A';
export const getExpiredNoToken = (): string => 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdGFydERhdGUiOjE2MDE5OTQxMDUsImVuZERhdGUiOjE2MDQ0MTMzMDUsImlzQXZhaWxhYmxlIjpmYWxzZSwiaWF0IjozMTU1MzI4MDAsImV4cCI6MzE2MDUxMjAwLCJpc3MiOiJodHRwczovL2Jvb2staGd2LWJ1cy10cmFpbGVyLW1vdC5zZXJ2aWNlLmdvdi51ayIsInN1YiI6IjFENjJBQkZELUYwM0QtNERFMC05RUQ1LThDMDJGOTdDNTUzRCJ9.eTy8vcAodz78nSFDbJWKyxZZU19ME8SmeMgkZ768t3s';
export const getInvalidToken = (): string => 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdGFydERhdGUiOjE2MDE5OTQxMDUsImVuZERhdGUiOjE2MDQ0MTMzMDUsImlzQXZhaWxhYmxlIjp0cnVlLCJpYXQiOjMxNTUzMjgwMCwiZXhwIjozMTYwNTEyMDAsImlzcyI6Imh0dHBzOi8vYm9vay1oZ3YtYnVzLXRyYWlsZXItbW90LnNlcnZpY2UuZ292LnVrIiwic3ViIjoiMUQ2MkFCRkQtRjAzRC00REUwLTlFRDUtOEMwMkY5N0M1NTNEIn0.xW2aFHfxhXDTkxXTtqAEdnHlyJtdFhDwXdRIPqLBIck';
export const getIsAvailableMissingToken = () : string => 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdGFydERhdGUiOjE2MDE5OTQxMDUsImVuZERhdGUiOjE2MDQ0MTMzMDUsImlhdCI6MTYwMTk5NDEwNSwiZXhwIjoxOTE5ODc0MTgxLCJpc3MiOiJodHRwczovL2Jvb2staGd2LWJ1cy10cmFpbGVyLW1vdC5zZXJ2aWNlLmdvdi51ayIsInN1YiI6IjFENjJBQkZELUYwM0QtNERFMC05RUQ1LThDMDJGOTdDNTUzRCJ9.yV-nIN1rVsk3N4iE_5lTvLKAHY3dPL3nL-EEfEUvsbc';
export const getSubMissingToken = () : string => 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdGFydERhdGUiOjE2MDE5OTQxMDUsImVuZERhdGUiOjE2MDQ0MTMzMDUsImlzQXZhaWxhYmxlIjp0cnVlLCJpYXQiOjE2MDE5OTQxMDUsImV4cCI6MTkxOTg3NDE4MSwiaXNzIjoiaHR0cHM6Ly9ib29rLWhndi1idXMtdHJhaWxlci1tb3Quc2VydmljZS5nb3YudWsifQ.OxGciP8vdxDHNdLMPtFZrXQVtjTj94eXjy0j8E38TKk';
export const getStartDateMissingToken = () : string => 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbmREYXRlIjoxNjA0NDEzMzA1LCJpc0F2YWlsYWJsZSI6dHJ1ZSwiaWF0IjoxNjAxOTk0MTA1LCJleHAiOjE5MTk4NzQxODEsImlzcyI6Imh0dHBzOi8vYm9vay1oZ3YtYnVzLXRyYWlsZXItbW90LnNlcnZpY2UuZ292LnVrIiwic3ViIjoiMUQ2MkFCRkQtRjAzRC00REUwLTlFRDUtOEMwMkY5N0M1NTNEIn0.Us6F69wQ_dymDrDGL8luuwhH9hwmkuCqE8e0pouLgXg';
export const getEndDateMissingToken = () : string => 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdGFydERhdGUiOjE2MDE5OTQxMDUsImlzQXZhaWxhYmxlIjp0cnVlLCJpYXQiOjE2MDE5OTQxMDUsImV4cCI6MTkxOTg3NDE4MSwiaXNzIjoiaHR0cHM6Ly9ib29rLWhndi1idXMtdHJhaWxlci1tb3Quc2VydmljZS5nb3YudWsiLCJzdWIiOiIxRDYyQUJGRC1GMDNELTRERTAtOUVENS04QzAyRjk3QzU1M0QifQ.a2SJs5F8erJm1Tsng6wsfIINxmw3RptUnfvcko6GXNg';
export const getJwtSecret = (): string => 'secret';
