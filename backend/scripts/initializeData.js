const mongoose = require('mongoose');
const Category = require('../models/Category');
const EmailPattern = require('../models/EmailPattern');
require('dotenv').config();

const defaultCategories = [
  {
    name: 'food & drink',
    subcategories: ['restaurant', 'coffee', 'groceries', 'fast food', 'delivery'],
    keywords: ['restaurant', 'coffee', 'starbucks', 'mcdonalds', 'pizza', 'food', 'lunch', 'dinner', 'breakfast'],
    isDefault: true,
    color: '#EF4444',
    icon: '🍕'
  },
  {
    name: 'transportation',
    subcategories: ['gas', 'public transit', 'rideshare', 'parking', 'maintenance'],
    keywords: ['uber', 'lyft', 'gas', 'gasoline', 'parking', 'metro', 'taxi', 'bus'],
    isDefault: true,
    color: '#3B82F6',
    icon: '🚗'
  },
  {
    name: 'shopping',
    subcategories: ['clothing', 'electronics', 'home goods', 'personal care'],
    keywords: ['amazon', 'target', 'walmart', 'shopping', 'store', 'mall', 'clothes'],
    isDefault: true,
    color: '#10B981',
    icon: '🛍️'
  },
  {
    name: 'entertainment',
    subcategories: ['movies', 'games', 'streaming', 'events', 'hobbies'],
    keywords: ['netflix', 'spotify', 'movie', 'game', 'entertainment', 'concert', 'theater'],
    isDefault: true,
    color: '#F59E0B',
    icon: '🎬'
  },
  {
    name: 'bills & utilities',
    subcategories: ['electricity', 'water', 'internet', 'phone', 'insurance'],
    keywords: ['bill', 'utility', 'electric', 'water', 'internet', 'phone', 'insurance'],
    isDefault: true,
    color: '#8B5CF6',
    icon: '📄'
  },
  {
    name: 'healthcare',
    subcategories: ['doctor', 'pharmacy', 'dental', 'vision', 'wellness'],
    keywords: ['doctor', 'hospital', 'pharmacy', 'medical', 'health', 'dental'],
    isDefault: true,
    color: '#EC4899',
    icon: '🏥'
  },
  {
    name: 'travel',
    subcategories: ['flights', 'hotels', 'car rental', 'activities'],
    keywords: ['flight', 'hotel', 'travel', 'vacation', 'trip', 'airbnb'],
    isDefault: true,
    color: '#06B6D4',
    icon: '✈️'
  },
  {
    name: 'other',
    subcategories: [],
    keywords: [],
    isDefault: true,
    color: '#6B7280',
    icon: '📝'
  }
];

const defaultEmailPatterns = [
  {
    sender: 'store-news@amazon.com',
    merchantName: 'Amazon',
    patterns: {
      amount: 'Total.*?\\$([0-9,]+\\.?[0-9]*)',
      date: 'Order Date.*?([A-Za-z]+ [0-9]{1,2}, [0-9]{4})',
      description: 'Amazon\\.com order',
      total: 'Total.*?\\$([0-9,]+\\.?[0-9]*)'
    },
    successRate: 0.9,
    createdBy: 'system',
    confidence: 0.9
  },
  {
    sender: 'receipts@uber.com',
    merchantName: 'Uber',
    patterns: {
      amount: 'Total.*?\\$([0-9,]+\\.?[0-9]*)',
      date: '([A-Za-z]+ [0-9]{1,2}, [0-9]{4})',
      description: 'Uber ride',
      total: 'Total.*?\\$([0-9,]+\\.?[0-9]*)'
    },
    successRate: 0.85,
    createdBy: 'system',
    confidence: 0.85
  },
  {
    sender: 'noreply@starbucks.com',
    merchantName: 'Starbucks',
    patterns: {
      amount: 'Total.*?\\$([0-9,]+\\.?[0-9]*)',
      date: '([0-9]{1,2}/[0-9]{1,2}/[0-9]{4})',
      description: 'Starbucks purchase',
      total: 'Total.*?\\$([0-9,]+\\.?[0-9]*)'
    },
    successRate: 0.8,
    createdBy: 'system',
    confidence: 0.8
  }
];

async function initializeData() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('📦 Connected to MongoDB');

    // Initialize categories
    console.log('🏷️ Initializing default categories...');
    for (const categoryData of defaultCategories) {
      const existingCategory = await Category.findOne({ 
        name: categoryData.name, 
        isDefault: true 
      });
      
      if (!existingCategory) {
        await Category.create(categoryData);
        console.log(`✅ Created category: ${categoryData.name}`);
      } else {
        console.log(`⏭️ Category already exists: ${categoryData.name}`);
      }
    }

    // Initialize email patterns
    console.log('📧 Initializing default email patterns...');
    for (const patternData of defaultEmailPatterns) {
      const existingPattern = await EmailPattern.findOne({ 
        sender: patternData.sender 
      });
      
      if (!existingPattern) {
        await EmailPattern.create(patternData);
        console.log(`✅ Created email pattern: ${patternData.merchantName}`);
      } else {
        console.log(`⏭️ Email pattern already exists: ${patternData.merchantName}`);
      }
    }

    console.log('🎉 Data initialization complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error initializing data:', error);
    process.exit(1);
  }
}

// Run if this file is executed directly
if (require.main === module) {
  initializeData();
}

module.exports = { initializeData };