const express = require('express');

const authorization = require(`./../controller/authorizationController`);
const view = require(`./../controller/viewController`);
const booking = require(`./../controller/bookingController`);
// So now if you give tour and user pug consider it as variable and undestands it
const CSP = 'Content-Security-Policy';
const POLICY =
  "default-src 'self' https://js.stripe.com/v3/ ;" +
  "base-uri 'self';block-all-mixed-content;" +
  "font-src 'self' https: data:;" +
  "frame-ancestors 'self';" +
  "img-src http://localhost:1000 'self' blob: data:;" +
  "object-src 'none';" +
  "script-src https: cdn.jsdelivr.net cdnjs.cloudflare.com api.mapbox.com 'self' blob: ;" +
  "script-src-attr 'none';" +
  "style-src 'self' https: 'unsafe-inline';" +
  'upgrade-insecure-requests;';

const router = express.Router();

router.use((req, res, next) => {
  res.setHeader(CSP, POLICY);
  next();
});

router.get('/tour/:slug', authorization.isLoggedIn, view.getTour);
router.get(
  '/',
  booking.createBookingCheckout,
  authorization.isLoggedIn,
  view.getOverview
);
router.get('/login', authorization.isLoggedIn, view.login);
router.get('/me', authorization.protected, view.getAccount);
module.exports = router;
router.get(
  '/my-tours',
  booking.createBookingCheckout,
  authorization.protected,
  view.getMyTours
);
