const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  googleId: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  name: {
    type: String,
    required: true
  },
  googleTokens: {
    accessToken: String,
    refreshToken: String,
    expiryDate: Date
  },
  notificationSettings: {
    telegramChatId: String,
    lineBotId: String,
    enableNotifications: {
      type: Boolean,
      default: true
    },
    preferredPlatform: {
      type: String,
      enum: ['telegram', 'line'],
      default: 'telegram'
    }
  },
  preferences: {
    defaultCategories: [{
      type: String
    }],
    currency: {
      type: String,
      default: 'USD'
    },
    emailFilters: [{
      type: String
    }],
    timezone: {
      type: String,
      default: 'UTC'
    }
  },
  friends: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for faster queries
userSchema.index({ email: 1 });
userSchema.index({ googleId: 1 });

// Don't return sensitive data
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.googleTokens;
  return user;
};

module.exports = mongoose.model('User', userSchema);