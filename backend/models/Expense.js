const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  subcategory: {
    type: String,
    trim: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  source: {
    type: String,
    enum: ['email', 'manual', 'nlp'],
    required: true
  },
  rawData: {
    type: mongoose.Schema.Types.Mixed // Store original email/text data
  },
  tags: [{
    type: String,
    trim: true
  }],
  location: {
    type: String,
    trim: true
  },
  merchant: {
    type: String,
    trim: true
  },
  isShared: {
    type: Boolean,
    default: false
  },
  sharedWith: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  confidence: {
    type: Number,
    min: 0,
    max: 1,
    default: 1 // 1 for manual entries, lower for parsed entries
  },
  currency: {
    type: String,
    default: 'USD'
  },
  receipt: {
    url: String,
    filename: String
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
expenseSchema.index({ userId: 1, date: -1 });
expenseSchema.index({ userId: 1, category: 1 });
expenseSchema.index({ userId: 1, source: 1 });
expenseSchema.index({ date: 1 });

// Virtual for formatted amount
expenseSchema.virtual('formattedAmount').get(function() {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: this.currency || 'USD'
  }).format(this.amount);
});

// Ensure virtual fields are serialized
expenseSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Expense', expenseSchema);