const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  subcategories: [{
    type: String,
    trim: true
  }],
  keywords: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  isDefault: {
    type: Boolean,
    default: false
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null // null for system defaults
  },
  color: {
    type: String,
    default: '#3B82F6' // Default blue color
  },
  icon: {
    type: String,
    default: '💰'
  }
}, {
  timestamps: true
});

// Compound index to ensure unique categories per user
categorySchema.index({ name: 1, userId: 1 }, { unique: true });

// Index for faster queries
categorySchema.index({ isDefault: 1 });
categorySchema.index({ userId: 1 });

module.exports = mongoose.model('Category', categorySchema);