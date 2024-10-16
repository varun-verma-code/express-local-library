import createError from 'http-errors';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import dbConnection from './models/db.js';
import compression from 'compression';
import helmet from 'helmet';
import RateLimit from 'express-rate-limit';

import { router as indexRouter } from './routes/index.js';
import { router as usersRouter } from './routes/users.js';
import { router as catalogRouter } from './routes/catalog.js';

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory

var app = express();

// Add helmet to the middleware chain.
// Set CSP headers to allow our Bootstrap and Jquery to be served
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      'script-src': ["'self'", 'code.jquery.com', 'cdn.jsdelivr.net'],
    },
  })
);

// Set up rate limiter: maximum of twenty requests per minute
const limiter = RateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 20,
});
// Apply rate limiter to all requests
app.use(limiter);

dbConnection();

// Use compression for responses. Must be used before any/all router paths that are required to be compressed
app.use(compression());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

/* app.use() will add the middleware libraries that we imported above into the request handling chain */
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
// Express by default will never serve static files. Even the browser or template/view won't have access to JS or CSS files. Must use static to expose them
app.use(express.static(path.join(__dirname, 'public')));

// Add route-handling code to request handling chain
// The paths '/' and '/users' are treated as prefix to routes defined in the imported files
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/catalog', catalogRouter);

// middleware to catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

export default app;
