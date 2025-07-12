const express = require('express');
const { body, validationResult } = require('express-validator');
const Expense = require('../models/Expense');
const authMiddleware = require('../middleware/auth');
const nlpService = require('../services/nlpProcessor');
const notificationService = require('../services/notificationService');

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Get all expenses for user
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 50, 
      category, 
      startDate, 
      endDate, 
      sortBy = 'date', 
      sortOrder = 'desc' 
    } = req.query;
    
    const filter = { userId: req.user._id };
    
    if (category) filter.category = category;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    // Build sort object
    const sortObj = {};
    sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const expenses = await Expense.find(filter)
      .sort(sortObj)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Expense.countDocuments(filter);

    res.json({
      expenses,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
      sortBy,
      sortOrder
    });
  } catch (error) {
    console.error('Get expenses error:', error);
    res.status(500).json({ message: 'Failed to fetch expenses' });
  }
});

// Create new expense
router.post('/', [
  body('amount').isNumeric().withMessage('Amount must be a number'),
  body('description').notEmpty().withMessage('Description is required'),
  body('date').optional().isISO8601().withMessage('Invalid date format')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const expense = new Expense({
      ...req.body,
      userId: req.user._id,
      source: 'manual'
    });

    await expense.save();

    // Send notification
    try {
      await notificationService.notifyExpenseLogged(req.user._id, expense);
    } catch (notifError) {
      console.error('Notification error:', notifError);
      // Don't fail the request if notification fails
    }

    res.status(201).json(expense);
  } catch (error) {
    console.error('Create expense error:', error);
    res.status(500).json({ message: 'Failed to create expense' });
  }
});

// Parse natural language for preview (no creation)
router.post('/parse-preview', [
  body('text').notEmpty().withMessage('Text is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const parsedData = await nlpService.parseExpenseText(req.body.text);
    
    if (!parsedData.amount) {
      return res.status(400).json({ message: 'Could not extract amount from text' });
    }

    // Return parsed data without creating expense
    res.json(parsedData);
  } catch (error) {
    console.error('Parse preview error:', error);
    res.status(500).json({ message: 'Failed to parse expense text' });
  }
});

// Parse natural language expense
router.post('/parse-text', [
  body('text').notEmpty().withMessage('Text is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const parsedData = await nlpService.parseExpenseText(req.body.text);
    
    if (!parsedData.amount) {
      return res.status(400).json({ message: 'Could not extract amount from text' });
    }

    const expense = new Expense({
      ...parsedData,
      userId: req.user._id,
      source: 'nlp',
      rawData: { originalText: req.body.text }
    });

    await expense.save();

    // Send notification
    try {
      await notificationService.notifyExpenseLogged(req.user._id, expense);
    } catch (notifError) {
      console.error('Notification error:', notifError);
    }

    res.status(201).json(expense);
  } catch (error) {
    console.error('Parse text error:', error);
    res.status(500).json({ message: 'Failed to parse expense text' });
  }
});

// Update expense
router.put('/:id', [
  body('amount').optional().isNumeric().withMessage('Amount must be a number'),
  body('description').optional().notEmpty().withMessage('Description cannot be empty')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const expense = await Expense.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true }
    );

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    res.json(expense);
  } catch (error) {
    console.error('Update expense error:', error);
    res.status(500).json({ message: 'Failed to update expense' });
  }
});

// Delete expense
router.delete('/:id', async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Delete expense error:', error);
    res.status(500).json({ message: 'Failed to delete expense' });
  }
});

module.exports = router;