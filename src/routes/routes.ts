import express, { Router } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import compression from 'compression';
import awsServerlessExpressMiddleware from 'aws-serverless-express/middleware';
import { file, imageFile, fontFile } from '../controllers/asset.controller';
import { index } from '../controllers/index.controller';

const routes: Router = express.Router();

// Middleware
routes.use(compression());
routes.use(cors());
routes.use(bodyParser.json());
routes.use(bodyParser.urlencoded({ extended: true }));
routes.use(awsServerlessExpressMiddleware.eventContext());

routes.get('/', index);

routes.get('/assets/:asset', file);
routes.get('/assets/images/:asset', imageFile);
routes.get('/assets/fonts/:asset', fontFile);

export default routes;
