import express, { Router } from 'express';
import { index } from '../controllers/index.controller';

const indexRoute: Router = express.Router();

indexRoute.get('/', index);

export default indexRoute;
