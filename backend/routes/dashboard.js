const express = require('express');
const Expense = require('../models/Expense');
const authMiddleware = require('../middleware/auth');
const { calculateDateRange } = require('../utils/dateHelpers');

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Get category breakdown
router.get('/categories', async (req, res) => {
  try {
    const { timeRange, startDate, endDate } = req.query;
    const dateFilter = calculateDateRange(timeRange, startDate, endDate);
    
    const categoryTotals = await Expense.aggregate([
      { 
        $match: { 
          userId: req.user._id, 
          date: dateFilter 
        } 
      },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
          avgAmount: { $avg: '$amount' }
        }
      },
      { $sort: { total: -1 } }
    ]);

    const totalSpent = categoryTotals.reduce((sum, cat) => sum + cat.total, 0);
    
    const categoriesWithPercentage = categoryTotals.map(cat => ({
      ...cat,
      percentage: totalSpent > 0 ? ((cat.total / totalSpent) * 100).toFixed(1) : 0
    }));

    res.json({
      categories: categoriesWithPercentage,
      totalSpent,
      totalExpenses: categoryTotals.reduce((sum, cat) => sum + cat.count, 0)
    });
  } catch (error) {
    console.error('Get category breakdown error:', error);
    res.status(500).json({ message: 'Failed to fetch category data' });
  }
});

// Get comparison data (week over week, month over month)
router.get('/comparison', async (req, res) => {
  try {
    const now = new Date();
    
    // Week over week
    const thisWeekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
    const lastWeekStart = new Date(thisWeekStart);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);
    const lastWeekEnd = new Date(thisWeekStart);
    lastWeekEnd.setMilliseconds(-1);

    // Month over month
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(thisMonthStart);
    lastMonthEnd.setMilliseconds(-1);

    const [thisWeekTotal, lastWeekTotal, thisMonthTotal, lastMonthTotal] = await Promise.all([
      Expense.aggregate([
        { $match: { userId: req.user._id, date: { $gte: thisWeekStart } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Expense.aggregate([
        { $match: { userId: req.user._id, date: { $gte: lastWeekStart, $lte: lastWeekEnd } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Expense.aggregate([
        { $match: { userId: req.user._id, date: { $gte: thisMonthStart } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Expense.aggregate([
        { $match: { userId: req.user._id, date: { $gte: lastMonthStart, $lte: lastMonthEnd } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ])
    ]);

    const thisWeek = thisWeekTotal[0]?.total || 0;
    const lastWeek = lastWeekTotal[0]?.total || 0;
    const thisMonth = thisMonthTotal[0]?.total || 0;
    const lastMonth = lastMonthTotal[0]?.total || 0;

    res.json({
      weekOverWeek: {
        current: thisWeek,
        previous: lastWeek,
        percentChange: lastWeek > 0 ? (((thisWeek - lastWeek) / lastWeek) * 100).toFixed(1) : 0
      },
      monthOverMonth: {
        current: thisMonth,
        previous: lastMonth,
        percentChange: lastMonth > 0 ? (((thisMonth - lastMonth) / lastMonth) * 100).toFixed(1) : 0
      }
    });
  } catch (error) {
    console.error('Get comparison data error:', error);
    res.status(500).json({ message: 'Failed to fetch comparison data' });
  }
});

// Get parsing analytics
router.get('/parsing-analytics', async (req, res) => {
  try {
    const { timeRange = 'past_month' } = req.query;
    const dateFilter = calculateDateRange(timeRange);
    
    const analytics = await Expense.aggregate([
      { $match: { userId: req.user._id, date: dateFilter } },
      {
        $group: {
          _id: '$source',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);

    const total = analytics.reduce((sum, item) => sum + item.count, 0);
    const emailParsed = analytics.find(a => a._id === 'email')?.count || 0;
    const nlpParsed = analytics.find(a => a._id === 'nlp')?.count || 0;
    const manualEntries = analytics.find(a => a._id === 'manual')?.count || 0;

    // Estimate time saved (2 minutes per automated entry)
    const timeSaved = (emailParsed + nlpParsed) * 2;
    const automationRate = total > 0 ? (((emailParsed + nlpParsed) / total) * 100).toFixed(1) : 0;

    res.json({
      totalExpenses: total,
      emailParsed,
      nlpParsed,
      manualEntries,
      timeSaved,
      automationRate,
      breakdown: analytics
    });
  } catch (error) {
    console.error('Get parsing analytics error:', error);
    res.status(500).json({ message: 'Failed to fetch parsing analytics' });
  }
});

// Get summary stats
router.get('/summary', async (req, res) => {
  try {
    const { timeRange = 'past_month' } = req.query;
    const dateFilter = calculateDateRange(timeRange);
    
    const [totalStats, categoryCount, avgExpense] = await Promise.all([
      Expense.aggregate([
        { $match: { userId: req.user._id, date: dateFilter } },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' },
            count: { $sum: 1 },
            avg: { $avg: '$amount' }
          }
        }
      ]),
      Expense.distinct('category', { userId: req.user._id, date: dateFilter }),
      Expense.aggregate([
        { $match: { userId: req.user._id, date: dateFilter } },
        { $group: { _id: null, avgAmount: { $avg: '$amount' } } }
      ])
    ]);

    const stats = totalStats[0] || { total: 0, count: 0, avg: 0 };
    
    res.json({
      totalSpent: stats.total,
      totalExpenses: stats.count,
      averageExpense: stats.avg,
      categoriesUsed: categoryCount.length,
      timeRange
    });
  } catch (error) {
    console.error('Get summary error:', error);
    res.status(500).json({ message: 'Failed to fetch summary data' });
  }
});

module.exports = router;