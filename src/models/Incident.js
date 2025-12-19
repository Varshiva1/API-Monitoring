import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const incidentSchema = new Schema({
  monitor: {
    type: Schema.Types.ObjectId,
    ref: 'Monitor',
    required: true,
    index: true,
  },
  type: {
    type: String,
    enum: ['downtime', 'slow_response', 'status_code_mismatch', 'timeout'],
    required: true,
  },
  status: {
    type: String,
    enum: ['open', 'acknowledged', 'resolved'],
    default: 'open',
    index: true,
  },
  startTime: {
    type: Date,
    default: Date.now,
  },
  endTime: {
    type: Date,
  },
  duration: {
    type: Number, // in minutes
  },
  details: {
    statusCode: Number,
    responseTime: Number,
    errorMessage: String,
    expectedStatusCode: Number,
  },
  notifications: [{
    channel: {
      type: String,
      enum: ['email', 'slack'],
    },
    sentAt: Date,
    success: Boolean,
  }],
  resolvedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Indexes for better performance
incidentSchema.index({ monitor: 1, status: 1 });
incidentSchema.index({ startTime: -1 });

// Calculate duration when incident is resolved
incidentSchema.methods.resolve = function() {
  this.status = 'resolved';
  this.endTime = new Date();
  this.duration = Math.round((this.endTime - this.startTime) / 60000); // minutes
};

// Get formatted duration
incidentSchema.methods.getDurationString = function() {
  if (!this.duration) return 'N/A';
  
  const hours = Math.floor(this.duration / 60);
  const minutes = this.duration % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

// Check if incident is open
incidentSchema.methods.isOpen = function() {
  return this.status === 'open' || this.status === 'acknowledged';
};

export default model('Incident', incidentSchema);