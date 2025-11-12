// models/Task.js
import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const TaskSchema = new Schema({
  text: {
    type: String,
    required: [true, 'Task text is required'],
    trim: true,
    maxlength: [140, 'Task text too long (max 140 chars)'],
    index: true
  },
  completed: {
    type: Boolean,
    default: false,
    index: true
  },
  ownerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: false // keep optional for TaskFlow Lite; future-proof for users
  }
}, {
  timestamps: true,
  versionKey: false // disable __v unless you need optimistic concurrency
});

// Compound index example for queries like: find active tasks for owner sorted by createdAt
TaskSchema.index({ ownerId: 1, completed: 1, createdAt: -1 });

// Example pre-save hook: sanitize or normalize text
TaskSchema.pre('save', function(next) {
  if (this.text) {
    this.text = this.text.replace(/\s+/g, ' ').trim();
  }
  next();
});

// Post hook for logging (non-blocking)
TaskSchema.post('save', function(doc) {
  // avoid heavy logic here - just log or emit events
  // e.g., eventEmitter.emit('task.created', doc);
});

export const Task = model('Task', TaskSchema);
