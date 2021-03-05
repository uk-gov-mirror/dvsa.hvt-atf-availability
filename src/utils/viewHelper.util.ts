import nunjucks, { Environment } from 'nunjucks';
import { Express } from 'express';
import { format, utcToZonedTime } from 'date-fns-tz';

export const setUpNunjucks = (app: Express): Environment => {
  const env = nunjucks.configure(['views'], {
    autoescape: true,
    express: app,
  }).addGlobal('NODE_ENV', process.env.NODE_ENV)
    .addGlobal('getAsset', (name: string) => (process.env.CDN_URL || '/assets/') + name)
    .addFilter('formatDate', (date: string) => format(utcToZonedTime(new Date(date), process.env.TIMEZONE), 'd MMMM yyyy'))
    .addFilter('formatDateTime', (date: string) => format(utcToZonedTime(new Date(date), process.env.TIMEZONE), 'EEEE d MMMM yyyy \'at\' h:mmaaaaa\'m\''));
  // ... any other globals or custom filters here

  return env;
};
