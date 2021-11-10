/* eslint-disable import/no-dynamic-require */
const express = require('express');

const user = require(`${__dirname}/../controller/userController`);
const authorization = require(`${__dirname}/../controller/authorizationController`);
const router = new express.Router();

router.post('/sign-up', authorization.signUp);
router.post('/login', authorization.login);
router.post('/forgotPassword', authorization.forgotPassword);
router.patch('/resetPassword/:token', authorization.resetPassword);
router.get('/logout', authorization.logout);
// router.use(authorization.protected); // This will be Like added to all middleware Stack in router
// So if we uncomment that means the down one all will have protected call back

router.patch(
  '/updateMe',
  authorization.protected,
  user.uploadUserPhoto,
  user.resizeUserPhoto,
  user.updateMe
);
router.get(
  '/getMe',
  authorization.protected,
  user.getMe,
  authorization.protected,
  user.getUser
);
router.delete('/DeleteMe', authorization.protected, user.deleteMe);

router.patch(
  '/UpdatePassword',
  authorization.protected,
  authorization.updatePassword
);

router.use(authorization.protected);
router.use(authorization.restrictTo('admin')); // So from downpart all the the routed will have to go through protected and restrictTo
router
  .route('/')
  .get(user.getAllUsers)
  .post(user.createUser);

router
  .route('/:id')
  .get(user.getUser)
  .patch(user.updateUser)
  .delete(user.deleteUser);
module.exports = router;
