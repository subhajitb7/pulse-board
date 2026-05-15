const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  options: [{ type: String, required: true }],
  isMandatory: { type: Boolean, default: true },
});

const pollSchema = new mongoose.Schema({
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  questions: [questionSchema],
  isAnonymous: {
    type: Boolean,
    default: true,
  },
  expiresAt: {
    type: Date,
  },
  isPublished: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

const Poll = mongoose.model('Poll', pollSchema);
module.exports = Poll;
