import express from 'express';
import protect from '../middleware/auth.middleware.js';
import { askController } from '../services/ai/nexus/ask.controller.js';

const router = express.Router();

// @route   POST /api/nexus/ask
// @desc    Query the personal knowledge assistant
// @access  Private
router.post('/ask', protect, askController);

export default router;
