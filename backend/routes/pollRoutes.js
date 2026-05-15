const express = require('express');
const router = express.Router();
const {
  createPoll,
  getMyPolls,
  getPoll,
  respondToPoll,
  getPollAnalytics,
  publishPoll,
  getPollResults,
} = require('../controllers/pollController');
const { protect, optionalAuth } = require('../middlewares/authMiddleware');

router.post('/', protect, createPoll);
router.get('/my-polls', protect, getMyPolls);
router.get('/:id', optionalAuth, getPoll);
router.post('/:id/respond', optionalAuth, respondToPoll);
router.get('/:id/analytics', protect, getPollAnalytics);
router.patch('/:id/publish', protect, publishPoll);
router.get('/:id/results', getPollResults);

module.exports = router;
