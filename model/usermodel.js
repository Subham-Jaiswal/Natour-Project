const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A user must have a name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'A user must have a email'],
    trim: true,
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, `Please Provide a correct Email Address`]
  },
  photo: { type: String, default: 'default.jpg' },
  password: {
    type: String,
    required: [true, 'A user must have a password'],
    trim: true,
    minlength: 8,
    select: false
  },
  passwordChangedDate: Date,
  role: {
    type: String,
    enum: ['admin', 'user', 'moderator', 'lead-guide'],
    default: 'user'
  },
  passwordConfirm: {
    type: String,
    required: [true, 'A user must have a confirmPassword'],
    trim: true,

    // This will run only on save
    // NOt on update
    // so while updating a document we should still use save so that validator can run again
    validate: {
      validator: function(el) {
        console.log('validation me khatam');
        console.log(this);
        console.log(el);
        console.log(this.password);
        return el === this.password;
      }
    }
  },
  PasswordResetToken: String, // In database encrypted token will be stored only
  PasswordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false
  }
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  console.log(this.password);
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = 'undefined';
  console.log(this.password);
  this.passwordChangedDate = Date.now() - 1000;
  console.log(this.passwordChangedDate);
  next();
});

userSchema.methods.correctPassword = async function(
  candidatePassword,
  userPassword
) {
  const answer = await bcrypt.compare(candidatePassword, userPassword);
  console.log(answer);
  return answer;
}; // This method will be available to everyobject

userSchema.methods.passwordChanged = async function(JWTTimeStamp) {
  console.log('passwordChanged Methods');
  if (this.passwordChangedDate) {
    const passwordChangedDate = (this.passwordChangedDate.getTime() / 1000) * 1;
    console.log(typeof passwordChangedDate);
    console.log(typeof JWTTimeStamp);
    // eslint-disable-next-line radix
    if (passwordChangedDate > JWTTimeStamp) {
      console.log('true');
      return true;
    }
    console.log('false');
    return false;
  }

  console.log('returning false');
  return false;
};

userSchema.methods.createPasswordResetToken = async function() {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.PasswordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.PasswordResetExpires = Date.now() + 10 * 60 * 1000;
  console.log(resetToken, this.PasswordResetToken);
  return resetToken; // User will not encrypted token only database will have encrypted version so even if some get hold of our database its ok they wont get account access
};

const User = mongoose.model('User', userSchema);

module.exports = User;
