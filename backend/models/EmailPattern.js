const mongoose = require('mongoose');

const emailPatternSchema = new mongoose.Schema({
  sender: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  merchantName: {
    type: String,
    required: true,
    trim: true
  },
  patterns: {
    amount: {
      type: String,
      required: true
    },
    date: String,
    description: String,
    total: String,
    merchant: String
  },
  successRate: {
    type: Number,
    default: 0,
    min: 0,
    max: 1
  },
  usageCount: {
    type: Number,
    default: 0
  },
  lastUsed: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: String,
    enum: ['system', 'llm', 'manual'],
    default: 'system'
  },
  confidence: {
    type: Number,
    default: 0.5,
    min: 0,
    max: 1
  },
  sampleEmails: [{
    content: String,
    extractedData: mongoose.Schema.Types.Mixed,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
emailPatternSchema.index({ sender: 1 });
emailPatternSchema.index({ merchantName: 1 });
emailPatternSchema.index({ successRate: -1 });
emailPatternSchema.index({ createdBy: 1 });

// Method to update success rate
emailPatternSchema.methods.updateSuccessRate = function(successful) {
  this.usageCount += 1;
  if (successful) {
    this.successRate = ((this.successRate * (this.usageCount - 1)) + 1) / this.usageCount;
  } else {
    this.successRate = (this.successRate * (this.usageCount - 1)) / this.usageCount;
  }
  this.lastUsed = new Date();
  return this.save();
};

module.exports = mongoose.model('EmailPattern', emailPatternSchema);