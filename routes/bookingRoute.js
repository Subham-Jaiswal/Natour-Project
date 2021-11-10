const express = require('express');
// eslint-disable-next-line import/no-dynamic-require
const bookingController = require(`${__dirname}/../controller/bookingController`);
const router = new express.Router();
// eslint-disable-next-line import/no-dynamic-require
const authorization = require(`${__dirname}/../controller/authorizationController`);

router.get(
  '/checkout-session/:tourId',
  authorization.protected,
  bookingController.getCheckoutSession
);

module.exports = router;
