/* eslint-disable import/no-dynamic-require */
const multer = require('multer');
const sharp = require('sharp');

const catchAsync = require(`${__dirname}/../utils/catchHandler`);
const User = require(`${__dirname}/../model/usermodel.js`);
const AppError = require(`${__dirname}/../utils/AppError`);
const handlerFactory = require(`${__dirname}/handlerFactory`);

const filterObj = (user, request, allowed) => {
  console.log(user);
  const filter = [];
  Object.keys(request).forEach(el => {
    console.log(el);
    if (allowed.includes(el)) {
      filter.push(el);
    }
  });
  const filtered = {};
  filter.forEach(el => {
    filtered[el] = request[el];
  });
  return filtered;
};

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/img/users');
//   },
//   filename: (req, file, cb) => {
//     const ext = file.mimetype.split('/')[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//   }
// });
const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
});
exports.uploadUserPhoto = upload.single('photo');

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`; //  we did just to ensure that req.file.filename is available for upcoming middlewares

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
});

exports.updateMe = catchAsync(async (req, res, next) => {
  console.log(req.file);
  console.log(req.body);
  console.log('update process initiated');
  if (req.body.password || req.body.passwordConfirm) {
    next(new AppError('Please use Update password ', 401));
  }
  // eslint-disable-next-line no-unused-vars
  const allowed = ['name', 'email'];
  const ToChange = filterObj(req.user, req.body, allowed);
  console.log(ToChange);
  console.log(req.user);
  if (req.file) {
    ToChange.photo = req.file.filename;
  }
  const user = await User.findByIdAndUpdate(req.user.id, ToChange, {
    new: true,
    runValidators: true //
  });
  res.status(200).json({
    status: 'Done',
    user
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  console.log('Delete process initiated');

  // eslint-disable-next-line no-unused-vars
  const user = await User.findByIdAndUpdate(
    req.user.id,
    { active: 'false' },
    {
      new: true,
      runValidators: true //
    }
  );

  res.status(201).json({
    status: 'Deletion Done',
    user
  });
});
exports.getAllUsers = handlerFactory.getAll(User);
exports.updateUser = handlerFactory.updateOne(User);
exports.deleteUser = handlerFactory.deleteOne(User);
exports.createUser = handlerFactory.createOne(User); // we have sign-up feature for this Wont be implemented ever
exports.getUser = handlerFactory.getOne(User);
