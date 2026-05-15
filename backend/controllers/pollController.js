const Poll = require('../models/Poll');
const Response = require('../models/Response');

const createPoll = async (req, res) => {
  try {
    const { title, description, questions, isAnonymous, expiresAt } = req.body;

    if (!title || !questions || questions.length === 0) {
      return res.status(400).json({ message: 'Title and at least one question are required' });
    }

    for (const q of questions) {
      if (!q.text || !q.options || q.options.length < 2) {
        return res.status(400).json({ message: 'Each question must have text and at least 2 options' });
      }
    }

    const poll = await Poll.create({
      creatorId: req.user._id,
      title,
      description,
      questions,
      isAnonymous,
      expiresAt,
    });

    res.status(201).json(poll);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMyPolls = async (req, res) => {
  try {
    const polls = await Poll.find({ creatorId: req.user._id }).sort({ createdAt: -1 });

    // Attach response count to each poll
    const pollsWithCounts = await Promise.all(
      polls.map(async (poll) => {
        const responseCount = await Response.countDocuments({ pollId: poll._id });
        return { ...poll.toObject(), responseCount };
      })
    );

    res.json(pollsWithCounts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPoll = async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.id);
    if (!poll) {
      return res.status(404).json({ message: 'Poll not found' });
    }

    // If published and expired, redirect to results view info
    const isExpired = poll.expiresAt && new Date() > new Date(poll.expiresAt);

    if (!poll.isAnonymous && !req.user) {
      return res.status(401).json({
        message: 'You must be logged in to view this poll',
        requiresAuth: true,
      });
    }

    res.json({ ...poll.toObject(), isExpired });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Poll not found' });
    }
    res.status(500).json({ message: error.message });
  }
};

const respondToPoll = async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.id);
    if (!poll) {
      return res.status(404).json({ message: 'Poll not found' });
    }

    if (poll.expiresAt && new Date() > new Date(poll.expiresAt)) {
      return res.status(400).json({ message: 'This poll has expired and is no longer accepting responses' });
    }

    if (!poll.isAnonymous && !req.user) {
      return res.status(401).json({ message: 'You must be logged in to respond to this poll' });
    }

    // Prevent duplicate responses for authenticated polls
    if (!poll.isAnonymous && req.user) {
      const existingResponse = await Response.findOne({ pollId: poll._id, userId: req.user._id });
      if (existingResponse) {
        return res.status(400).json({ message: 'You have already responded to this poll' });
      }
    }

    const { answers } = req.body;

    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ message: 'Answers are required' });
    }

    // Validate mandatory questions
    for (const question of poll.questions) {
      if (question.isMandatory) {
        const answer = answers.find(a => a.questionId === question._id.toString());
        if (!answer || !answer.selectedOption) {
          return res.status(400).json({ message: `Question "${question.text}" is mandatory` });
        }
      }
    }

    // Validate selected options are valid
    for (const answer of answers) {
      const question = poll.questions.find(q => q._id.toString() === answer.questionId);
      if (question && !question.options.includes(answer.selectedOption)) {
        return res.status(400).json({ message: `Invalid option selected for "${question.text}"` });
      }
    }

    const newResponse = await Response.create({
      pollId: poll._id,
      userId: req.user ? req.user._id : null,
      answers,
    });

    // Fetch analytics to emit via WebSocket
    const analytics = await calculateAnalytics(poll._id);
    const io = req.app.get('io');
    if (io) {
      io.to(`poll_${poll._id}`).emit('new-response', analytics);
    }

    res.status(201).json(newResponse);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const calculateAnalytics = async (pollId) => {
  const responses = await Response.find({ pollId });
  const totalResponses = responses.length;

  const optionCounts = {}; // { questionId: { optionName: count } }
  responses.forEach(response => {
    response.answers.forEach(answer => {
      if (!optionCounts[answer.questionId]) {
        optionCounts[answer.questionId] = {};
      }
      if (!optionCounts[answer.questionId][answer.selectedOption]) {
        optionCounts[answer.questionId][answer.selectedOption] = 0;
      }
      optionCounts[answer.questionId][answer.selectedOption]++;
    });
  });

  return { totalResponses, optionCounts };
};

const getPollAnalytics = async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.id);
    if (!poll) {
      return res.status(404).json({ message: 'Poll not found' });
    }

    if (poll.creatorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const analytics = await calculateAnalytics(poll._id);
    const recentResponses = await Response.find({ pollId: poll._id })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('userId', 'name email');

    res.json({ poll, analytics, recentResponses });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const publishPoll = async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.id);
    if (!poll) {
      return res.status(404).json({ message: 'Poll not found' });
    }

    if (poll.creatorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    poll.isPublished = true;
    await poll.save();

    res.json(poll);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPollResults = async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.id);
    if (!poll) {
      return res.status(404).json({ message: 'Poll not found' });
    }

    if (!poll.isPublished) {
      return res.status(403).json({ message: 'Results have not been published yet' });
    }

    const analytics = await calculateAnalytics(poll._id);
    res.json({ poll, analytics });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Poll not found' });
    }
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createPoll,
  getMyPolls,
  getPoll,
  respondToPoll,
  getPollAnalytics,
  publishPoll,
  getPollResults,
};
