/* eslint-disable import/no-dynamic-require */
const AppError = require(`${__dirname}/../utils/AppError`);

const handleErrorDB = err => {
  const message = `invalid ${err.path} with ${err.value}`;
  return new AppError(message, 404);
};

const handleValidationError = err => {
  const message = Object.values(err.errors).reduce((prev, current) => {
    prev += +' ' + current.properties.message;
    return prev;
  }, '');
  console.log(message);

  return new AppError(message, 404);
};

const handleJsonWebTokenError = () => {
  return new AppError('Invalid Token', 401); // unauthorized
};

const handleTokenExpireError = () => {
  return new AppError('Expired Token Please Re-login', 401); // unauthorized
};

const handleDuplicateFieldsDB = err => {
  let value = Object.keys(err.keyValue)[0];
  value = err.keyValue[value];
  const message = `Duplicated ${value} which should be unique`;
  return new AppError(message, 404);
};
// const handleValidationError = err => {
//   return new AppError('chutiyap', 404);
// };

const sendErrorDev = (err, req, res) => {
  // A) API
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack
    });
  }

  // B) RENDERED WEBSITE
  console.error('ERROR 💥', err);
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: err.message
  });
};
const sendErrorProd = (err, req, res) => {
  // A) API
  if (req.originalUrl.startsWith('/api')) {
    // A) Operational, trusted error: send message to client
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message
      });
    }
    // B) Programming or other unknown error: don't leak error details
    // 1) Log error
    console.error('ERROR 💥', err);
    // 2) Send generic message
    return res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!'
    });
  }

  // B) RENDERED WEBSITE
  // A) Operational, trusted error: send message to client
  if (err.isOperational) {
    console.log(err);
    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong!',
      msg: err.message
    });
  }
  // B) Programming or other unknown error: don't leak error details
  // 1) Log error
  console.error('ERROR 💥', err);
  // 2) Send generic message
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: 'Please try again later.'
  });
};

const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500; // Again we will define err.statusCode while handling error but sometimes error are internal to application and we get 500
  err.status = err.status || 'error'; // If we define err then we will also give status otherswise just give message that error
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    if (error.name === 'CastError') {
      console.log('castError'); // Galat ID
      error = handleErrorDB(error);
    }
    if (error.code === 11000) {
      // Duplicate Fields
      error = handleDuplicateFieldsDB(error);
    }

    if (err.name === 'ValidationError') {
      error = handleValidationError(err);
    }
    if (err.name === 'JsonWebTokenError') {
      error = handleJsonWebTokenError();
    }
    if (err.name === 'TokenExpiredError') {
      error = handleTokenExpireError();
    }
    sendErrorProd(err, req, res);
  }
};

module.exports = globalErrorHandler;

// [Object.keys(error.errors)[0]]
