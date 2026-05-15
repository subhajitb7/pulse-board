const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  selectedOption: {
    type: String,
    required: true,
  },
});

const responseSchema = new mongoose.Schema({
  pollId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Poll',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  answers: [answerSchema],
}, { timestamps: true });

const Response = mongoose.model('Response', responseSchema);
module.exports = Response;
