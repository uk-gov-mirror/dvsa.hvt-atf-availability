import nunjucks, { Environment } from 'nunjucks';
import { Express } from 'express';
import { format } from 'date-fns';

export const setUpNunjucks = (app: Express): Environment => {
  const env = nunjucks.configure(['views', 'govuk-frontend'], {
    autoescape: true,
    express: app,
  }).addGlobal('NODE_ENV', process.env.NODE_ENV)
    .addGlobal('getAsset', (name: string) => (process.env.CDN_URL || '/assets/') + name)
    .addFilter('formatDate', (date: string) => format(new Date(date), 'dd MMMM yyyy'))
    .addFilter('formatDateTime', (date: string) => format(new Date(date), 'EEEE dd MMMM yyyy \'at\' h:m aaaa'));
  // ... any other globals or custom filters here

  return env;
};
