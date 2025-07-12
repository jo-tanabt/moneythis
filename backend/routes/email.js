const express = require('express');
const authMiddleware = require('../middleware/auth');
const emailParser = require('../services/emailParser');
const gmailService = require('../services/gmailService');

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Manually parse email content
router.post('/parse', async (req, res) => {
  try {
    const { emailContent, sender } = req.body;
    
    if (!emailContent) {
      return res.status(400).json({ message: 'Email content is required' });
    }

    const parsedData = await emailParser.parseEmail(emailContent, sender);
    
    if (!parsedData.amount) {
      return res.status(400).json({ message: 'Could not extract expense data from email' });
    }

    res.json({
      success: true,
      data: parsedData,
      confidence: parsedData.confidence || 0
    });
  } catch (error) {
    console.error('Email parsing error:', error);
    res.status(500).json({ message: 'Failed to parse email' });
  }
});

// Sync recent emails from Gmail
router.post('/sync', async (req, res) => {
  try {
    const { days = 7 } = req.body; // Default to last 7 days
    
    // Get user's Gmail access token
    const user = req.user;
    if (!user.googleTokens?.accessToken) {
      return res.status(400).json({ message: 'Gmail access not configured' });
    }

    const newExpenses = await gmailService.syncRecentEmails(user, days);
    
    res.json({
      success: true,
      message: `Synced ${newExpenses.length} new expenses`,
      expenses: newExpenses
    });
  } catch (error) {
    console.error('Email sync error:', error);
    res.status(500).json({ message: 'Failed to sync emails' });
  }
});

// Get email parsing patterns
router.get('/patterns', async (req, res) => {
  try {
    const patterns = await emailParser.getPatterns();
    res.json(patterns);
  } catch (error) {
    console.error('Get patterns error:', error);
    res.status(500).json({ message: 'Failed to fetch patterns' });
  }
});

// Test email parsing with sample data
router.post('/test-parse', async (req, res) => {
  try {
    const { sampleEmail } = req.body;
    
    const testResult = await emailParser.testParsing(sampleEmail);
    
    res.json({
      success: true,
      result: testResult,
      patterns: testResult.patternsUsed
    });
  } catch (error) {
    console.error('Test parsing error:', error);
    res.status(500).json({ message: 'Failed to test email parsing' });
  }
});

module.exports = router;