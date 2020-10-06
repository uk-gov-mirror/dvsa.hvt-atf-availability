import express, { Router } from 'express';
import { confirmAvailability, updateAvailability } from '../controllers/availability.controller';

const availabilityRoute: Router = express.Router();

availabilityRoute.get('/availability/update', updateAvailability);
availabilityRoute.get('/availability/confirm', confirmAvailability);

export default availabilityRoute;
