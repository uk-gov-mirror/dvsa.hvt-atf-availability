import express, { Router } from 'express';
import {
  confirmAvailability, updateAvailability, reissueToken, expiredToken,
} from '../controllers/availability.controller';

const availabilityRoute: Router = express.Router();

availabilityRoute.get('/availability/update', updateAvailability);
availabilityRoute.get('/availability/confirm', confirmAvailability);
availabilityRoute.get('/availability/reissue-token', reissueToken);
availabilityRoute.get('/availability/expired-token', expiredToken);

export default availabilityRoute;
