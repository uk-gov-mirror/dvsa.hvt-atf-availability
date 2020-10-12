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
import availabilityRoute from './routes/availability.route';

// Load environment variables
dotenv.config();

const app: Express = express();
const routes: Router[] = [
  assetRoute,
  availabilityRoute,
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
app.use((req: Request, res: Response, next: NextFunction) => {
  // Extract the Correlation ID from Headers or Query Parameters; default to AWS Request ID
  const corrIdHeader: string = req.apiGateway.event.headers['X-Correlation-Id'];
  const corrIdParam: string = <string> req.query?.correlationId;
  const { awsRequestId } = req.apiGateway.context;
  const correlationId: string = corrIdHeader || corrIdParam || awsRequestId;

  req.app.locals.correlationId = correlationId;
  next();
});

// Routes
app.use(routes);

// Error handling
app.use((req: Request, res: Response, next: NextFunction) => {
  const context = { error: 'Page not found' };
  res.status(404).render('error/not-found', context);
  next();
});

app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  const errorString: string = JSON.stringify(error, Object.getOwnPropertyNames(error));
  const context = { error: process.env.NODE_ENV === 'development' ? errorString : '' };
  res.status(500).render('error/service-unavailable', context);
  next();
});

export default app;
