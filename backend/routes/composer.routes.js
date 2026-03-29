import express from 'express';
import protect from '../middleware/auth.middleware.js';
import { synthesizeFromMemory } from '../controllers/composer.controller.js';

const router = express.Router();

// @route   POST /api/composer/pre-fetch
// @desc    Retrieve relevant memories for selection
router.post('/pre-fetch', protect, synthesizeFromMemory.preFetchSources || (async (req, res) => {
  const { preFetchSources } = await import('../controllers/composer.controller.js');
  return preFetchSources(req, res);
}));

// @route   POST /api/composer/synthesize
// @desc    Synthesize new content from user's memories
// @access  Private
router.post('/synthesize', protect, synthesizeFromMemory);

export default router;
