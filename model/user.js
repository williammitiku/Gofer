var mongoose = require('mongoose')
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const location = require('../model/location')
const Contact = require('../model/contact')

const User = {

  firstName: {
    type: String,
    required: true
  },
  middleName: {
    type: String,
    required: false
  },
  lastName: {
    type: String,
    required: false
  },
  phoneNumber: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    unique: true,
    validate: {
      validator: function (v) {
        return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v);
      },
      message: "Please enter a valid email"
    },
  },
  isDisabled: {
      type: Boolean,
      default: false
  },
  verificationCode: {
    type: String,
    // default: false
  },
  profileImage: {
      type: String,
      // required: true
  },
  preferredPlaces: [
    location
  ],
  emergencyContact: {
    type: Contact
  },
  deviceId: {
    type: String,
  },
}

const userSchema = mongoose.Schema(User)

userSchema.methods.comparePassword = async function (password, callback) {
  
  bcrypt.compare(password, this.password, async function (error, isMatch) {
    if (error) {
      return callback(error);
    } else {
      callback(null, isMatch);
    }
  });
};

userSchema.methods.encryptPassword = async function (password, callback) {
  bcrypt.genSalt(10, function (saltError, salt) {
    if (saltError) {
      return callback(saltError);
    } else {
      bcrypt.hash(password, salt, function (hashError, hash) {
        if (hashError) {
          return callback(hashError);
        }
        user.password = hash;
        callback(null, hash);
      });
    }
  });
};

userSchema.methods.generateVerificationToken = async function (callback) {
  const user = this;

  const verificationToken = Math.floor(100000 + Math.random() * 900000);
  const defaultPassword = generateCode(user);

  user.verificationCode = verificationToken;
  await user.save();

  return callback(verificationToken, defaultPassword);
};

function generateCode(user) {
  var result = '';
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for (var i = 0; i < 5; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result.toLowerCase() + user._id.toString().substring(0, 5).toLowerCase();
}

const Users = mongoose.model("user", userSchema);

module.exports = { Users, User }