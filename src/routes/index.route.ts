import express, { Router } from 'express';
import {
  privacy, accessibility, confirmAvailability, expiredToken, reissueToken, updateAvailability,
} from '../controllers/index.controller';

const indexRoute: Router = express.Router();

indexRoute.get('/update', updateAvailability);
indexRoute.post('/confirm', confirmAvailability);
indexRoute.get('/reissue-token', reissueToken);
indexRoute.get('/expired-token', expiredToken);
indexRoute.get('/privacy', privacy);
indexRoute.get('/accessibility', accessibility);
export default indexRoute;
