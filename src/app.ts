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
import indexRoute from './routes/index.route';
import assetRoute from './routes/asset.route';

// Load environment variables
dotenv.config();

const app: Express = express();
const routes: Router[] = [
  indexRoute,
  assetRoute,
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
  const { awsRequestId } = req.apiGateway.context;
  const correlationId: string = req.apiGateway.event.headers['X-Correlation-Id'] || awsRequestId;

  req.app.locals.correlationId = correlationId;
  next();
});

app.use(routes);

export default app;
