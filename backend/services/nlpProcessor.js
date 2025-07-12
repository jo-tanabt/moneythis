const llmService = require('./llmService');

class NLPProcessor {
  constructor() {
    // Common patterns for quick regex extraction before LLM
    this.patterns = {
      amount: /\$?(\d+(?:\.\d{2})?)/g,
      date: /yesterday|today|(\d{1,2}\/\d{1,2}\/\d{4})|(\d{4}-\d{2}-\d{2})/gi,
      merchants: {
        'starbucks': 'Starbucks',
        'uber': 'Uber',
        'lyft': 'Lyft',
        'amazon': 'Amazon',
        'target': 'Target',
        'walmart': 'Walmart',
        'mcdonalds': 'McDonald\'s',
        'subway': 'Subway'
      }
    };
  }

  async parseExpenseText(text) {
    try {
      // Always use OpenAI for better accuracy and descriptions
      return await llmService.parseExpenseText(text);
    } catch (error) {
      console.error('NLP processing error:', error);
      throw new Error('Failed to process expense text');
    }
  }

  quickExtract(text) {
    const result = {
      amount: null,
      description: '',
      merchant: null,
      date: new Date(),
      category: 'Other',
      confidence: 0,
      source: 'nlp'
    };

    const textLower = text.toLowerCase();

    // Extract amount
    const amountMatches = text.match(this.patterns.amount);
    if (amountMatches) {
      const amounts = amountMatches.map(match => parseFloat(match.replace('$', '')));
      result.amount = Math.max(...amounts); // Take the highest amount
      result.confidence += 0.4;
    }

    // Extract merchant
    for (const [keyword, merchantName] of Object.entries(this.patterns.merchants)) {
      if (textLower.includes(keyword)) {
        result.merchant = merchantName;
        result.confidence += 0.2;
        break;
      }
    }

    // Extract date
    if (textLower.includes('yesterday')) {
      result.date = new Date(Date.now() - 24 * 60 * 60 * 1000);
      result.confidence += 0.1;
    } else if (textLower.includes('today')) {
      result.date = new Date();
      result.confidence += 0.1;
    }

    // Generate description
    result.description = this.generateDescription(text, result.merchant);
    if (result.description) {
      result.confidence += 0.2;
    }

    // Predict category
    result.category = this.predictCategory(text, result.merchant);
    result.confidence += 0.1;

    return result;
  }

  generateDescription(text, merchant) {
    // Extract meaningful description from text
    const words = text.toLowerCase().split(' ');
    
    // Common expense keywords
    const expenseKeywords = [
      'coffee', 'lunch', 'dinner', 'breakfast', 'gas', 'gasoline',
      'groceries', 'food', 'drink', 'ride', 'trip', 'shopping',
      'purchase', 'bill', 'payment'
    ];

    const foundKeywords = words.filter(word => expenseKeywords.includes(word));
    
    if (foundKeywords.length > 0) {
      return foundKeywords[0].charAt(0).toUpperCase() + foundKeywords[0].slice(1);
    }

    if (merchant) {
      return `${merchant} purchase`;
    }

    return 'Expense';
  }

  predictCategory(text, merchant) {
    const textLower = text.toLowerCase();
    
    // Food & Drink
    if (textLower.includes('coffee') || textLower.includes('lunch') || 
        textLower.includes('dinner') || textLower.includes('food') ||
        textLower.includes('restaurant') || textLower.includes('breakfast') ||
        merchant === 'Starbucks' || merchant === 'McDonald\'s' || merchant === 'Subway') {
      return 'Food & Drink';
    }

    // Transportation
    if (textLower.includes('gas') || textLower.includes('uber') || 
        textLower.includes('lyft') || textLower.includes('ride') ||
        textLower.includes('trip') || merchant === 'Uber' || merchant === 'Lyft') {
      return 'Transportation';
    }

    // Shopping
    if (textLower.includes('shopping') || textLower.includes('store') ||
        textLower.includes('purchase') || merchant === 'Amazon' || 
        merchant === 'Target' || merchant === 'Walmart') {
      return 'Shopping';
    }

    // Entertainment
    if (textLower.includes('movie') || textLower.includes('entertainment') ||
        textLower.includes('game') || textLower.includes('concert')) {
      return 'Entertainment';
    }

    // Bills & Utilities
    if (textLower.includes('bill') || textLower.includes('utility') ||
        textLower.includes('payment') || textLower.includes('subscription')) {
      return 'Bills & Utilities';
    }

    return 'Other';
  }

  extractAmountFromText(text) {
    const matches = text.match(this.patterns.amount);
    if (matches) {
      const amounts = matches.map(match => parseFloat(match.replace('$', '')));
      return Math.max(...amounts);
    }
    return null;
  }

  extractMerchantFromText(text) {
    const textLower = text.toLowerCase();
    
    for (const [keyword, merchantName] of Object.entries(this.patterns.merchants)) {
      if (textLower.includes(keyword)) {
        return merchantName;
      }
    }
    
    return null;
  }
}

module.exports = new NLPProcessor();