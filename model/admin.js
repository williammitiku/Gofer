const mongoose = require('mongoose')
const bcrypt = require("bcryptjs");

const Admin = {
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
    password: {
        type: String,
        required: true,
    },
    phoneNumber: {
        type: String,
        required: true
    },

    isDisabled: {
        type: Boolean,
        default: false
    },
    isVerified: {
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
    restId: {
        type: Number,
    },
    role: {
        type: Number,
        required: true
    },
};
const adminSchema = mongoose.Schema(Admin)



adminSchema.pre("save", function (next) {
  const admin = this;


  if (this.isModified("password") || this.isNew) {
    bcrypt.genSalt(10, function (saltError, salt) {
      if (saltError) {
        return next(saltError);
      } else {
        bcrypt.hash(admin.password, salt, function (hashError, hash) {
          if (hashError) {
            return next(hashError);
          }
          admin.password = hash;
          next();
        });
      }
    });
  } else {
    next();
  }
});
adminSchema.methods.comparePassword = async function (password, callback) {
  
  bcrypt.compare(password, this.password, async function (error, isMatch) {
    if (error) {
      return callback(error);
    } else {
      callback(null, isMatch);
    }
  });
};

adminSchema.methods.encryptPassword = async function (password, callback) {
  bcrypt.genSalt(10, function (saltError, salt) {
    if (saltError) {
      return callback(saltError);
    } else {
      bcrypt.hash(password, salt, function (hashError, hash) {
        if (hashError) {
          return callback(hashError);
        }
        admin.password = hash;
        callback(null, hash);
      });
    }
  });
};

adminSchema.methods.generateVerificationToken = async function (callback) {
  const admin = this;

  const verificationToken = Math.floor(100000 + Math.random() * 900000);
  const defaultPassword = generateCode(admin);

  admin.verificationCode = verificationToken;
  await admin.save();

  return callback(verificationToken, defaultPassword);
};

function generateCode(admin) {
  var result = '';
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for (var i = 0; i < 5; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result.toLowerCase() + admin._id.toString().substring(0, 5).toLowerCase();
}

const Admins = mongoose.model('admin', adminSchema)


module.exports = { Admins, Admin }