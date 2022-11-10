/*
 * forgerock-sample-web-react
 *
 * index.mjs
 *
 * Copyright (c) 2021 ForgeRock. All rights reserved.
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import fs from 'node:fs';
import cors from 'cors';
import express from 'express';
import cookieParser from 'cookie-parser';
import { createServer } from 'https';

import { AM_URL, PORT } from './app/constants.js';
import routes from './app/routes.js';

/**
 * Create and configure Express
 */
const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    credentials: true,
    origin: function (origin, callback) {
      // DON'T DO THIS IN PRODUCTION!
      return callback(null, true);
    },
  }),
);

/**
 * Log all server interactions
 */
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

/**
 * Initialize routes
 */
routes(app);

/**
 * Attach application to port and listen for requests
 */
const options = {
  key: fs.readFileSync(
    '/Users/jackson.aguas/Documents/Projects/CIAM_Prudential/Demo/forgerock-javascript-sdk/samples/todo-api/secrets/key.pem',
  ),
  cert: fs.readFileSync(
    '/Users/jackson.aguas/Documents/Projects/CIAM_Prudential/Demo/forgerock-javascript-sdk/samples/todo-api/secrets/cert.pem',
  ),
};
if (!AM_URL) {
  createServer(() => null).listen(PORT);

  console.error(
    'ERROR: Missing .env value. Ensure you have an .env file within the dir of this sample app.',
  );
  console.error(
    'Ensure you have a .env file with appropriate values and the proper security certificate and key.',
  );
  console.error('Please stop this process.');
} else {
  // Prod uses Nginx, so run regular server
  console.log('Creating Node HTTPS server');
  createServer(options, app).listen(PORT);

  console.log(`Node server listening on port: ${PORT}.`);
}
