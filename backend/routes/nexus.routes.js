import express from 'express';
import protect from '../middleware/auth.middleware.js';
import { askController } from '../services/ai/nexus/ask.controller.js';

const router = express.Router();

// @route   POST /api/nexus/ask
// @desc    const userId = typeof req.user === 'object' ? req.user.id : req.user;
// @access  Private
router.post('/ask', protect, askController);

export default router;
