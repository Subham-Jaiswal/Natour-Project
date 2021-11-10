/* eslint-disable import/no-dynamic-require */
// eslint-disable-next-line import/no-dynamic-require
const catchAsync = require(`${__dirname}/../utils/catchHandler`);
// eslint-disable-next-line import/no-dynamic-require
const AppError = require(`${__dirname}/../utils/AppError`);
const ApiFeatures = require(`${__dirname}/../utils/Apifeatures.js`);

exports.deleteOne = model => {
  return catchAsync(async (req, res, next) => {
    // --> Not Implementing Now
    console.log('H');
    // eslint-disable-next-line no-unused-vars
    const doc = await model.findByIdAndDelete(req.params.id);
    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }
    res.status(204).json({
      status: 'success',
      data: null
    });
  });
};

exports.updateOne = model => {
  return catchAsync(async (req, res, next) => {
    const doc = await model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!doc) {
      // eslint-disable-next-line no-new
      next(new AppError('Not Found', 404));
      return;
    }

    res.status(200).json({
      status: 'success',
      data: {
        date: doc
      }
    });
  });
};

exports.createOne = model => {
  return catchAsync(async (req, res, next) => {
    // const newTour = new Tour();
    // newTour.save().then() /// This is a way .save() --> Return Promise

    console.log(req.body);
    const newdoc = await model.create(req.body); // on create the pre-save-middleware or hook will run
    console.log('Controller first');
    res.status(201).json({
      status: 'Passed',
      data: newdoc
    });
  });
};

exports.getOne = (model, populateObj) => {
  return catchAsync(async (req, res, next) => {
    let query = model.findById(req.params.id);
    console.log(query);
    if (populateObj) {
      query = query.populate(populateObj);
    }
    const doc = await query;
    if (!doc) {
      // eslint-disable-next-line no-new
      next(new AppError('Not Found', 404));
      return;
    }
    res.status(200).json({
      status: 'success',
      data: {
        data: doc
      }
    });
  });
};

exports.getAll = model => {
  return catchAsync(async (req, res, next) => {
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };
    const features = new ApiFeatures(model.find(filter), req.query)
      .advanceFilter()
      .sort()
      .fields()
      .pagination();
    const doc = await features.query;
    res.status(200).json({
      status: 'success',
      length: doc.length,
      data: {
        data: doc
      }
    });
  });
};
