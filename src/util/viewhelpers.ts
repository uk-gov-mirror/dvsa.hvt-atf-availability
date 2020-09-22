import nunjucks, { Environment } from 'nunjucks';
import { Express } from 'express';

export function setUpNunjucks(app:Express) :Environment {
  const env = nunjucks.configure(['views', 'govuk-frontend'], {
    autoescape: true,
    express: app,
  }).addGlobal('NODE_ENV', process.env.NODE_ENV)
    .addGlobal('getAsset', (name:string) => (process.env.CDN_URL || '/assets/') + name);
  // ... any other globals or custom filters here

  return env;
}
export default {};