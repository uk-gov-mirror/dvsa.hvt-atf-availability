import express, { Router } from 'express';
import {
  privacy, accessibility, confirmAvailability, expiredToken, reissueToken, updateAvailability, cookiePreferences, cookies
} from '../controllers/index.controller';

const indexRoute: Router = express.Router();

indexRoute.get('/update', updateAvailability);
indexRoute.post('/confirm', confirmAvailability);
indexRoute.get('/reissue-token', reissueToken);
indexRoute.get('/expired-token', expiredToken);
indexRoute.get('/privacy', privacy);
indexRoute.get('/accessibility', accessibility);
indexRoute.get('/cookie-preferences', cookiePreferences);
indexRoute.get('/cookies', cookies);
export default indexRoute;
