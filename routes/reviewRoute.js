const express = require('express');
// eslint-disable-next-line import/no-dynamic-require
const reviewController = require(`${__dirname}/../controller/reviewController`);
const router = new express.Router({ mergeParams: true });
// eslint-disable-next-line import/no-dynamic-require
const authorization = require(`${__dirname}/../controller/authorizationController`);

router.use(authorization.protected); //From this point all are protected
router
  .route('/')
  .post(
    authorization.protected,
    authorization.restrictTo('user'),
    reviewController.setDate,
    reviewController.createReview
  )
  .get(reviewController.getAllReviews);

router
  .route('/:id')
  .delete(
    authorization.restrictTo('user', 'admin'),
    reviewController.deleteReview
  )
  .patch(
    authorization.restrictTo('user', 'admin'),
    reviewController.updateReview
  )
  .get(reviewController.getReview);
module.exports = router;
