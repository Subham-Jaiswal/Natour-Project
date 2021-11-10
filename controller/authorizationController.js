// eslint-disable-next-line import/no-dynamic-require
const { promisify } = require('util');
// eslint-disable-next-line import/no-dynamic-require
const User = require(`${__dirname}/../model/usermodel`);
// eslint-disable-next-line import/no-dynamic-require
const catchAsync = require(`${__dirname}/../utils/catchHandler`);
const jwt = require('jsonwebtoken');
// eslint-disable-next-line import/no-dynamic-require
const AppError = require(`${__dirname}/../utils/AppError`);
// eslint-disable-next-line import/no-dynamic-require
const Email = require(`${__dirname}/../utils/email`);
// eslint-disable-next-line import/no-dynamic-require
// const SendEmail = require(`${__dirname}/../utils/email`);

const crypto = require('crypto');

const signUpToken = id => {
  return jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

const createTokenAndSend = (user, statuscode, res) => {
  console.log('cooking cookie');
  const token = signUpToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  res.cookie('jwt', token, cookieOptions);
  user.password = undefined;
  res.status(statuscode).json({
    status: 'Passed',
    token: token,
    data: {
      user
    }
  });
};

exports.protected = catchAsync(async (req, res, next) => {
  // 1) Getting Token and check if it's there
  //Common practise is to send token with req.header
  //req.headers a object that contain all headers
  //Standard way of sending token -->
  //Authorization: "Bearer <token>"
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  console.log(token);
  if (!token) {
    next(new AppError('You are not login Please Login', 401));
  }
  // 2) Verification Token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  console.log(decoded);
  // What is line 37 is doing decoding our token+secret , No if you give wrong token then it will throw error
  // 3) Check user still exist
  const freshUser = await User.findById(decoded.id);
  console.log(freshUser);
  if (!freshUser) {
    next(new AppError('User of the current token doest exist', 401));
  }
  //4) check user changed password after the token was issued
  if (freshUser.passwordChangedDate) {
    console.log('defined');
    if (await freshUser.passwordChanged(decoded.iat)) {
      next(new AppError('Password Changed Please relogin', 401));
    }
  }

  req.user = freshUser;
  res.locals.user = freshUser;
  next();
});
exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });
  res.status(200).json({ status: 'success' });
};

exports.isLoggedIn = async (req, res, next) => {
  console.log('Verifying cookie');
  if (req.cookies.jwt) {
    try {
      // 1) verify token
      console.log('verify token');

      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );
      console.log(decoded);
      // 2) Check if user still exists
      console.log('Check if user still exists');
      const currentUser = await User.findById(decoded.id);
      console.log(currentUser);
      if (!currentUser) {
        return next();
      }

      // 3) Check if user changed password after the token was issued
      console.log('Check if user changed password after the token was issued');

      console.log(await currentUser.passwordChanged(decoded.iat));
      if (await currentUser.passwordChanged(decoded.iat)) {
        return next();
      }
      console.log('cookie verified');
      // THERE IS A LOGGED IN USER
      res.locals.user = currentUser;
      return next();
    } catch (err) {
      console.log('error');
      return next();
    }
  }
  next();
};

exports.restrictTo = (...roles) => {
  return async (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      next(
        new AppError(
          'You dont have the permission only admin and moderator have ',
          403
        )
      ); // 403 forbidden
    } else {
      console.log('authorization done');
      next();
    }
  };
};

exports.signUp = catchAsync(async (req, res, next) => {
  // const newUser = await User.create({
  //   // We did this to filter only that content which will go to db , if everything go to db anyone can claim admin role
  //   name: req.body.name,
  //   email: req.body.email,
  //   password: req.body.password,
  //   passwordConfirm: req.body.passwordConfirm,
  // });

  const newUser = await User.create(req.body);
  const url = `${req.protocol}://${req.get('host')}/me`;
  await new Email(newUser, url).sendWelcome();
  // We did this to filter only that content which will go to db , if everything go to db anyone can claim admin role

  // On sign-up we are also directly login him also no need to check hence we give our jwt to user :) in res
  createTokenAndSend(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  //1 email and Password Both should Exist
  console.log(email);
  console.log(password);
  if (!(email && password)) {
    return next(new AppError('Password or Email is missing', 404));
  }

  const user = await User.findOne({ email }).select('+password');
  console.log(user);
  console.log('mila ya nnhi');
  // first we try to find the user by email, we cannot do it by password... as for password hiding we kept its display as false ri8,,,so we select the password also by select('+password');

  // again we need to check upcoming password and the password of  user who has that same mail is same or not but for that we have to bcrypt.compare because password is enctrypted and stored in dB so to compare password coming from request and encrypted password stores in database

  // For that again we will write a method but we will write a method directly into the usermodel. It will be a user Instance..Hence it will be available for everyuser object

  if (user === null) {
    next(new AppError('Invalid Email or Password', 401)); //401 -> Not Authorized
  } else if (!(await user.correctPassword(password, user.password))) {
    next(new AppError('Invalid Email or Password', 401));
  } else {
    createTokenAndSend(user, 201, res);
    console.log('successful update');
  }
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    next(new AppError('User does not exist', 403));
  } else {
    console.log('else');
    const resetToken = await user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });
    // Validator ignorance

    const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/users/resetPassword/${resetToken}`;

    // eslint-disable-next-line no-unused-vars
    const message = `Forgot your password ? Submit a PATCH request with your new password and password confirmation to : ${resetURL}`;

    try {
      // await SendEmail({
      //   email: user.email,
      //   subject: 'Your Password request token is valid only for 10 mins',
      //   message: message
      // });

      await new Email(user, resetURL).sendPasswordReset();

      res.status(200).json({
        status: `success`,
        message: `Token Sent`
      });
    } catch (err) {
      console.log(err);
      user.createPasswordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });
      next(new AppError('Try again later', 500));
    }
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  //1 Use Token to query the database and get the user
  let { token } = req.params;
  token = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  //2 If token not expired then change the password

  const user = await User.findOne({
    PasswordResetToken: token,
    PasswordResetExpires: { $gte: Date.now() }
  });

  if (!user) {
    user.createPasswordResetToken = undefined;
    user.passwordResetExpires = undefined;
    return next(new AppError('Token Expired or doesnt exist', 404));
  }

  console.log('userFound');

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.createPasswordResetToken = undefined;
  user.passwordResetExpires = undefined;
  if (user.password === user.passwordConfirm)
    await user.save({ validateBeforeSave: false });

  createTokenAndSend(user, 201, res);

  //3 Log in him
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // Takes password,confirmPassword , newPassword

  //1 Get User From Collection
  const user = await User.findById(req.user._id).select('+password');
  console.log(user);
  if (!user) {
    next(new AppError('User Doesnt Exist', 404));
  }
  console.log(req.body.password, user.password);
  if (await user.correctPassword(req.body.password, user.password)) {
    user.password = req.body.newPassword;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save({ validateBeforeSave: false });
    createTokenAndSend(user, 201, res);
  } else next(new AppError(`password is not correct`, 401));
});
