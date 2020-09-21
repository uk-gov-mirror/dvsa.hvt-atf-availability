import path from 'path';
import express, { Express } from 'express';
import nunjucks from 'nunjucks';
import routes from './routes/routes';

const app: Express = express();

// View engine
app.set('view engine', 'njk');
app.set('views', path.join(__dirname, 'views'));
nunjucks.configure(['views', 'govuk-frontend'], {
  autoescape: true,
  express: app,
});

app.use('/', routes);

export default app;
