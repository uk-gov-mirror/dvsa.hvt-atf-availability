import path from 'path';
import express, {
  Express, Router, Request, Response, NextFunction,
} from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import compression from 'compression';
import awsServerlessExpressMiddleware from 'aws-serverless-express/middleware';
import dotenv from 'dotenv';
import { setUpNunjucks } from './utils/viewHelper.util';
import assetRoute from './routes/asset.route';
import indexRoute from './routes/index.route';
import { getCorrelationId } from './middleware/correlation.middleware';
import { logger } from './utils/logger.util';

// Environment variables
dotenv.config();

const app: Express = express();
const routes: Router[] = [
  assetRoute,
  indexRoute,
];

// View engine
app.set('view engine', 'njk');
app.set('views', path.join(__dirname, 'views'));
setUpNunjucks(app);

// Middleware
app.use(compression());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(awsServerlessExpressMiddleware.eventContext());
app.use(getCorrelationId);

// Routes
app.use(routes);

// Error handling
app.use((req: Request, res: Response, next: NextFunction) => {
  logger.error(req, 'Page not found');
  res.status(404).render('error/not-found');
  next();
});

app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  const errorString = `An unexpected error occured: ${JSON.stringify(error, Object.getOwnPropertyNames(error))}`;
  logger.error(req, errorString);
  const context = { error: process.env.NODE_ENV === 'development' ? errorString : '' };
  res.status(500).render('error/service-unavailable', context);
  next();
});

export default app;
