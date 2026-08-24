const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: true,
    unique: true
  },

  // PROFILE DATA
  name: String,
  email: {
    type: String,
    unique: true,
    sparse: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  hostel: String,
  room: String,
  address: String,

  addresses: [
    {
      hostel: {
        type: String,
        required: true
      },

      room: {
        type: String,
        required: true
      },

      address: {
        type: String,
        required: true
      },

      isDefault: {
        type: Boolean,
        default: false
      }
    }
  ],

  isProfileComplete: {
    type: Boolean,
    default: false
  },

}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);