const mongoose = require('mongoose');

const nodeSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    type: { type: String, required: true }, // trigger, aiAction, integration, condition, transform, output
    position: {
      x: { type: Number, default: 0 },
      y: { type: Number, default: 0 },
    },
    data: {
      label: { type: String, default: 'New Node' },
      provider: { type: String, default: '' }, // gmail, slack, discord, google-sheets, openrouter, gemini, custom
      action: { type: String, default: '' },
      config: { type: mongoose.Schema.Types.Mixed, default: {} },
      inputs: { type: mongoose.Schema.Types.Mixed, default: {} },
      outputs: { type: mongoose.Schema.Types.Mixed, default: {} },
    },
  },
  { _id: false }
);

const edgeSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    source: { type: String, required: true },
    target: { type: String, required: true },
    sourceHandle: { type: String, default: null },
    targetHandle: { type: String, default: null },
    animated: { type: Boolean, default: true },
    label: { type: String, default: '' },
    style: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { _id: false }
);

const workflowSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Workflow name is required'],
      trim: true,
      maxlength: [100, 'Workflow name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      default: '',
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['draft', 'active', 'paused', 'archived'],
      default: 'draft',
      index: true,
    },
    triggerConfig: {
      type: { type: String, default: 'manual' }, // manual, webhook, schedule, event
      cron: { type: String, default: '' },
      event: { type: String, default: '' },
      config: { type: mongoose.Schema.Types.Mixed, default: {} },
    },
    nodes: [nodeSchema],
    edges: [edgeSchema],
    version: {
      type: Number,
      default: 1,
    },
    tags: [{ type: String, trim: true }],
  },
  {
    timestamps: true,
  }
);

workflowSchema.index({ owner: 1, name: 'text', description: 'text' });

module.exports = mongoose.model('Workflow', workflowSchema);
