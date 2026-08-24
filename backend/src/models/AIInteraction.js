const mongoose = require('mongoose');

const aiInteractionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
    },
    type: {
      type: String,
      enum: ['TASK_GENERATION', 'TASK_BREAKDOWN', 'PRIORITY_SUGGESTION', 'RISK_ANALYSIS', 'HEALTH_SUMMARY'],
      required: true,
    },
    prompt: {
      type: String,
      required: true,
    },
    response: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    tokensUsed: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('AIInteraction', aiInteractionSchema);
