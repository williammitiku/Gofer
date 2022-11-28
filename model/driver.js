var mongoose = require('mongoose')
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const location = require('../model/location')
const Contact = require('../model/contact')
const Car = require('../model/car')

const Driver = {
  firstName: {
    type: String,
    required: true
  },
  middleName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  nationalId: {
    type: String,
    required: true
  },
  dateOfBirth: {
    type: String,
    required: false
  },
  password: {
    type: String,
    required: true
  },
  phoneNumber: {
    type: String,
    required: true
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
isVerified: {
  type: Boolean,
  default: false
},
driverId: {
    type: String,
    // default: false
  },
verificationCode: {
  type: String,
  // default: false
},
profileImage: {
    type: String,
    // required: true
},
licenceImage: {
  type: String,
  // required: true
},
  preferredPlaces: [
    location
  ],
  emergencyContact: {
      type: Contact
  },
  car: {
    type: Car
  },
  isRestaurant : {
        type: Boolean,
        default: false
  },
  deviceId: {
    type: String,
  },
}

const driverSchema = mongoose.Schema(Driver)

driverSchema.pre("save", function (next) {
  const driver = this;


  if (this.isModified("password") || this.isNew) {
    bcrypt.genSalt(10, function (saltError, salt) {
      if (saltError) {
        return next(saltError);
      } else {
        bcrypt.hash(driver.password, salt, function (hashError, hash) {
          if (hashError) {
            return next(hashError);
          }
          driver.password = hash;
          next();
        });
      }
    });
  } else {
    next();
  }
});
driverSchema.methods.comparePassword = async function (password, callback) {
  
  bcrypt.compare(password, this.password, async function (error, isMatch) {
    if (error) {
      return callback(error);
    } else {
      callback(null, isMatch);
    }
  });
};

driverSchema.methods.encryptPassword = async function (password, callback) {
  bcrypt.genSalt(10, function (saltError, salt) {
    if (saltError) {
      return callback(saltError);
    } else {
      bcrypt.hash(password, salt, function (hashError, hash) {
        if (hashError) {
          return callback(hashError);
        }
        driver.password = hash;
        callback(null, hash);
      });
    }
  });
};

driverSchema.methods.generateVerificationToken = async function (callback) {
  const driver = this;

  const verificationToken = Math.floor(100000 + Math.random() * 900000);
  const defaultPassword = generateCode(driver);

  driver.verificationCode = verificationToken;
  await driver.save();

  return callback(verificationToken, defaultPassword);
};

function generateCode(driver) {
  var result = '';
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for (var i = 0; i < 5; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result.toLowerCase() + driver._id.toString().substring(0, 5).toLowerCase();
}

const Drivers = mongoose.model("driver", driverSchema);

module.exports = { Drivers, Driver }