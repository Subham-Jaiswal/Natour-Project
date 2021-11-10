// eslint-disable-next-line import/no-dynamic-require
const Tour = require(`${__dirname}/../model/tourmodel`);

// eslint-disable-next-line import/no-dynamic-require
const Booking = require(`${__dirname}/../model/bookingmodel`);

// eslint-disable-next-line import/no-dynamic-require
const AppError = require(`${__dirname}/../utils/AppError`);

const catchAsync = require(`./../utils/catchHandler`);
exports.getOverview = catchAsync(async (req, res, next) => {
  const tours = await Tour.find();
  res.status(200).render('overview', {
    tours,
    title: `|Exciting tours for adventurous people`
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user title'
  });
  if (!tour) {
    next(new AppError('There is no tour of that name', 404));
  }
  res.status(200).render('tour', {
    title: `${tour.name} Tour`,
    tour
  });
});

exports.login = catchAsync(async (req, res, next) => {
  res.status(200).render('login', {
    title: 'login Page'
  });
});

exports.getAccount = catchAsync(async (req, res, next) => {
  res.status(200).render('account', {
    title: 'login Page'
  });
});

exports.getMyTours = catchAsync(async (req, res, next) => {
  const bookings = await Booking.find({ user: req.user.id });
  const tourIDs = bookings.map(el => el.tour);
  const tours = await Tour.find({ _id: { $in: tourIDs } });
  res.status(200).render('overview', {
    title: 'My Tours',
    tours
  });
});
