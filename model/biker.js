var mongoose = require('mongoose')
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const location = require('../model/location')
const Contact = require('../model/contact')

const Biker = {
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
    unique: false,
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
bike:{
  bikeModel: {
    type: String,
  },  
  bikeManufacturedYear: {
    type: String,
  },
  bikePLateNumber: {
    type: String,
  }, 
  bikeImage: {
    type: String,
    // required: true
},
},
  deviceId: {
    type: String,
  },
}

const bikerSchema = mongoose.Schema(Biker)

bikerSchema.pre("save", function (next) {
  const biker = this;


  if (this.isModified("password") || this.isNew) {
    bcrypt.genSalt(10, function (saltError, salt) {
      if (saltError) {
        return next(saltError);
      } else {
        bcrypt.hash(biker.password, salt, function (hashError, hash) {
          if (hashError) {
            return next(hashError);
          }
          biker.password = hash;
          next();
        });
      }
    });
  } else {
    next();
  }
});
bikerSchema.methods.comparePassword = async function (password, callback) {
  
  bcrypt.compare(password, this.password, async function (error, isMatch) {
    if (error) {
      return callback(error);
    } else {
      callback(null, isMatch);
    }
  });
};

bikerSchema.methods.encryptPassword = async function (password, callback) {
  bcrypt.genSalt(10, function (saltError, salt) {
    if (saltError) {
      return callback(saltError);
    } else {
      bcrypt.hash(password, salt, function (hashError, hash) {
        if (hashError) {
          return callback(hashError);
        }
        biker.password = hash;
        callback(null, hash);
      });
    }
  });
};

bikerSchema.methods.generateVerificationToken = async function (callback) {
  const biker = this;

  const verificationToken = Math.floor(100000 + Math.random() * 900000);
  const defaultPassword = generateCode(biker);

  biker.verificationCode = verificationToken;
  await biker.save();

  return callback(verificationToken, defaultPassword);
};

function generateCode(biker) {
  var result = '';
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for (var i = 0; i < 5; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result.toLowerCase() + biker._id.toString().substring(0, 5).toLowerCase();
}
const Bikers = mongoose.model("biker", bikerSchema);

module.exports = { Bikers, Biker }