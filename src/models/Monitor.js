import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const monitorSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  name: {
    type: String,
    required: [true, 'Please provide a monitor name'],
    trim: true,
  },
  url: {
    type: String,
    required: [true, 'Please provide a URL to monitor'],
    trim: true,
  },
  method: {
    type: String,
    enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD'],
    default: 'GET',
  },
  interval: {
    type: Number,
    default: 5, // minutes
    min: 1,
  },
  timeout: {
    type: Number,
    default: 30, // seconds
  },
  headers: {
    type: Map,
    of: String,
    default: new Map(),
  },
  expectedStatusCode: {
    type: Number,
    default: 200,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  status: {
    type: String,
    enum: ['up', 'down', 'paused', 'unknown'],
    default: 'unknown',
  },
  lastChecked: {
    type: Date,
  },
  lastResponseTime: {
    type: Number, // in milliseconds
  },
  uptime: {
    percentage: { type: Number, default: 100 },
    totalChecks: { type: Number, default: 0 },
    successfulChecks: { type: Number, default: 0 },
    failedChecks: { type: Number, default: 0 },
  },
  consecutiveFailures: {
    type: Number,
    default: 0,
  },
  alertChannels: {
    email: { type: Boolean, default: true },
    slack: { type: Boolean, default: false },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Indexes for better performance
monitorSchema.index({ user: 1, isActive: 1 });
monitorSchema.index({ status: 1 });

// Calculate uptime percentage
monitorSchema.methods.calculateUptime = function() {
  if (this.uptime.totalChecks === 0) {
    this.uptime.percentage = 100;
  } else {
    this.uptime.percentage = Number(
      ((this.uptime.successfulChecks / this.uptime.totalChecks) * 100).toFixed(2)
    );
  }
};

// Get formatted uptime string
monitorSchema.methods.getUptimeString = function() {
  return `${this.uptime.percentage}% (${this.uptime.successfulChecks}/${this.uptime.totalChecks})`;
};

export default model('Monitor', monitorSchema);