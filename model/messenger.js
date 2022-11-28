var mongoose = require('mongoose')
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const location = {
  name: {
      type: String,
      // required: true
  },
  latitude: {
      type: Number,
      required: false
  },
  longitude: {
      type: Number,
      required: false
  }
}


const contact = {
  fullName: {
    type: String,
    required: false
  },  
  EmergencyContactphoneNumber: {
    type: String,
    required: false
  },
  
}
const car = {
  carModel: {
    type: String,
  },  
  carManufacturedYear: {
    type: String,
  },
  carPLateNumber: {
    type: String,
  },  
  carPhoto: {
    type: String,
  },
}
const Messenger = {
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
loadType:{
  type:String,
  required:true
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
    fullName: {
      type: String,
      required: false
    },  
    EmergencyContactphoneNumber: {
      type: String,
      required: false
    },
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
  car: {
    carModel: {
      type: String,
    },  
    carManufacturedYear: {
      type: String,
    },
    carPLateNumber: {
      type: String,
    }, 
    carLoadSize: {
      type: String,
    }, 
  },

  
  
  isCar : {
        type: Boolean,
        default: true
  },
  
  deviceId: {
    type: String,
  },
}

const messengerSchema = mongoose.Schema(Messenger)

messengerSchema.pre("save", function (next) {
  const messenger = this;


  if (this.isModified("password") || this.isNew) {
    bcrypt.genSalt(10, function (saltError, salt) {
      if (saltError) {
        return next(saltError);
      } else {
        bcrypt.hash(messenger.password, salt, function (hashError, hash) {
          if (hashError) {
            return next(hashError);
          }
          messenger.password = hash;
          next();
        });
      }
    });
  } else {
    next();
  }
});
messengerSchema.methods.comparePassword = async function (password, callback) {
  
  bcrypt.compare(password, this.password, async function (error, isMatch) {
    if (error) {
      return callback(error);
    } else {
      callback(null, isMatch);
    }
  });
};

messengerSchema.methods.encryptPassword = async function (password, callback) {
  bcrypt.genSalt(10, function (saltError, salt) {
    if (saltError) {
      return callback(saltError);
    } else {
      bcrypt.hash(password, salt, function (hashError, hash) {
        if (hashError) {
          return callback(hashError);
        }
        messenger.password = hash;
        callback(null, hash);
      });
    }
  });
};

messengerSchema.methods.generateVerificationToken = async function (callback) {
  const messenger = this;

  const verificationToken = Math.floor(100000 + Math.random() * 900000);
  const defaultPassword = generateCode(messenger);

  messenger.verificationCode = verificationToken;
  await messenger.save();

  return callback(verificationToken, defaultPassword);
};

function generateCode(messenger) {
  var result = '';
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for (var i = 0; i < 5; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result.toLowerCase() + messenger._id.toString().substring(0, 5).toLowerCase();
}

const Messengers = mongoose.model("messenger", messengerSchema);

module.exports = { Messengers, Messenger }