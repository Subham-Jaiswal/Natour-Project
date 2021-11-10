/* eslint-disable import/no-dynamic-require */
// eslint-disable-next-line import/no-dynamic-require
const handlerFactory = require(`${__dirname}/handlerFactory`);
// eslint-disable-next-line import/no-dynamic-require
const Review = require(`${__dirname}/../model/reviewmodel`);

exports.setDate = (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};
exports.getAllReviews = handlerFactory.getAll(Review);
exports.deleteReview = handlerFactory.deleteOne(Review);
exports.updateReview = handlerFactory.updateOne(Review);
exports.createReview = handlerFactory.createOne(Review);
exports.getReview = handlerFactory.getOne(Review);
