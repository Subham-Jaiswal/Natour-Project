/* eslint-disable import/no-dynamic-require */
const express = require('express');
const path = require('path');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');

const tourRouter = require(`${__dirname}/routes/tourRoute`);
const userRouter = require(`${__dirname}/routes/userRoute`);
const reviewRouter = require(`${__dirname}/routes/reviewRoute`);
const viewRouter = require(`${__dirname}/routes/viewRoute`);
const bookingRouter = require(`${__dirname}/routes/bookingRoute`);
const AppError = require(`${__dirname}/utils/AppError`);
const globalErrorHandler = require(`${__dirname}/controller/globalErrorController`);
// Middleware
const app = express();
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public'))); // All the static assest will be served from a folder called public IMP
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'", 'data:', 'blob:', 'ws:'],
        baseUri: ["'self'"],
        fontSrc: ["'self'", 'data:'],
        scriptSrc: [
          "'self'",
          'https:',
          'http:',
          'blob:',
          'https://*.mapbox.com',
          'https://checkout.stripe.com.stripe.com',
          'https://m.stripe.network',
          'https://*.cloudflare.com'
        ],
        frameSrc: ["'self'", 'https://checkout.stripe.com'],
        objectSrc: ["'none'"],
        styleSrc: ["'self'", 'https:', "'unsafe-inline'"],
        workerSrc: [
          "'self'",
          'data:',
          'blob:',
          'https://*.tiles.mapbox.com',
          'https://api.mapbox.com',
          'https://events.mapbox.com',
          'https://m.stripe.network'
        ],
        childSrc: ["'self'", 'blob:'],
        imgSrc: ["'self'", 'data:', 'blob:'],
        formAction: ["'self'"],
        connectSrc: [
          "'self'",
          "'unsafe-inline'",
          'data:',
          'blob:',
          'https://*.stripe.com',
          'https://*.mapbox.com',
          'https://*.cloudflare.com/',
          'https://bundle.js:*',
          'ws://127.0.0.1:*/'
        ],
        upgradeInsecureRequests: []
      }
    }
  })
);

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP , Please try again in an hour'
});
app.use('/api', limiter);

app.use(morgan(`dev`)); // Accessible to all routes
app.use(express.json({ limit: '10kb' })); // Accessible to all routes
app.use(cookieParser());

// Data Sanitization against NOSQL Query Injection

app.use(mongoSanitize()); // filter out all dollar and malicious injection\
app.use(xss()); // filter out HTML  malicious injection\
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price'
    ]
  })
); // Prevent Parameter Pollution but we can whitelist parameter also
app.use((req, res, next) => {
  // Accessible to all routes
  console.log(req.cookies);
  next(); // Mandatory to finish the request response cycle This will be available to all req , res in the same middleware  stack
});
// app.use((req, res, next) => {
//   res.setHeader(
//     'Content-Security-Policy',
//     "script-src  'self' api.mapbox.com",
//     "script-src-elem 'self' api.mapbox.com"
//   );
//   next();
// });
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter); // Accessible to '/api/v1/tours'  routes
app.use('/api/v1/users', userRouter); // Accessible to '/api/v1/tours'  routes
app.use('/api/v1/bookings', bookingRouter);
app.use('/api/v1/reviews', reviewRouter);
app.all('*', (req, res, next) => {
  // res.status(404).json({
  //   status: 'fail',
  //   message: `can't find ${req.originalUrl}`
  // });
  // const err = new Error(`can't able find ${req.originalUrl}`); // This string is that err.message property
  // err.statusCode = 404; // Like we said in Below definition we will define [line 32]
  // err.status = 'fail';
  // next(err); // if next function receives an argument express will automatically know its a global error middleware .. Jump all the middleware in between in middleware stack

  next(new AppError());
});

app.use(globalErrorHandler);

module.exports = app;
