/* eslint-disable import/no-dynamic-require */
const express = require('express');

const authorization = require(`${__dirname}/../controller/authorizationController`);
const tour = require(`${__dirname}/../controller/tourController`);
const reviewRouter = require(`${__dirname}/reviewRoute`);
const router = new express.Router();

router.route('/Top-5-cheap-and-best').get(tour.alias, tour.getAllTours);
router.route('/tour-stats').get(tour.getStats);
router.route('/distances/:latlng/unit/:unit').get(tour.getDistances);
router.route('/monthly-tour-count/:year').get(tour.getMonthlyTourCount);
router
  .route('/tour-within/:distance/center/:latlng/:unit')
  .get(tour.getTourWithin);

router
  .route('/')
  .get(tour.getAllTours)
  .post(
    authorization.protected,
    authorization.restrictTo('lead-guide', 'admin'),
    tour.createTour
  );

router
  .route('/:id')
  .get(tour.getTour)
  .patch(
    authorization.protected,
    authorization.restrictTo('lead-guide', 'admin'),
    tour.uploadTourImages,
    tour.resizeTourImages,
    tour.updateTour
  )
  .delete(
    authorization.protected,
    authorization.restrictTo('admin', 'moderator'),
    tour.deleteTour
  );

router.use('/:tourId/reviews', reviewRouter);
module.exports = router;
