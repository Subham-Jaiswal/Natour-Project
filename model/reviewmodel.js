const mongoose = require('mongoose');

// eslint-disable-next-line import/no-dynamic-require
const Tour = require(`${__dirname}/tourmodel`);
const reviewSchema = new mongoose.Schema({
  review: {
    type: String,
    required: [true, 'A tour must have a name'],
    unique: true,
    trim: true,
    maxlength: [400, 'A tour name must have less or equal then 40 characters'],
    minlength: [10, 'A tour name must have more or equal then 10 characters']
    // validate: [validator.isAlpha, 'Tour name must only contain characters']
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  createdAt: Date,
  tour: {
    type: mongoose.Schema.ObjectId,
    ref: 'Tour',
    required: [true, 'Review Must Belong to a tour']
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Review Must Belong to a user']
  }
});

reviewSchema.pre(/^find/, function(next) {
  // this.populate({
  //   path: 'tour',
  //   select: 'name'
  // })
  this.populate({
    path: 'tour',
    select: 'name'
  }).populate({
    path: 'user',
    select: 'name photo'
  });
  next();
});

reviewSchema.statics.calculateAverage = async function(
  // Review - Model
  tourID // static method Can be accessed by Review.calculateAverage // this point to the current model i.e Review Schem) {
) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourID }
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' }
      }
    }
  ]);
  console.log(stats);
  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourID, {
      ratingsAverage: stats[0].avgRating
    });
  } else {
    await Tour.findByIdAndUpdate(tourID, {
      ratingsAverage: 4.5
    });
  }
};
reviewSchema.pre('/^findOneAnd', async function(next) {
  this.r = await this.findOne();
  console.log(this.r);
  next();
});
//findByIdAndUpdate
//findByIdAndDelete is findOneAnd only behind the hood
reviewSchema.post('/^findOneAnd/', async function() {
  await this.r.constructor.calculateAverage(this.r.tour);
});
reviewSchema.post('save', function() {
  this.constructor.calculateAverage(this.tour); // this refers to the current Document we need to do do, Review.calculateAverage() but we dont have access to it , that why this.constructor => which means constructor for reviewSchema => Review
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
