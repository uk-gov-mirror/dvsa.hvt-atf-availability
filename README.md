# hvt-atf-availability

A Serverless Node Express application for ATF availability.


**Requirements**

- node [v12.18.3](https://nodejs.org/en/download/releases/)
- [Docker](https://www.docker.com/get-started)
- [SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html)


**Run Locally**

- `npm i`
- `cp .env.development .env`
- `npm run build:dev`
- `npm run start:dev`
- go to `http://localhost:3002/` on browser


**Test Locally**
- `npm test`
- code coverage is output to console and stored in `/coverage/`
    - settings can be configured in `jest.config.js`