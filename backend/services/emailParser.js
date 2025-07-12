const EmailPattern = require('../models/EmailPattern');
const llmService = require('./llmService');

class EmailParser {
  constructor() {
    this.regexPatterns = new Map();
    this.loadRegexPatterns();
  }

  async loadRegexPatterns() {
    try {
      const patterns = await EmailPattern.find({ isActive: true }).sort({ successRate: -1 });
      this.regexPatterns.clear();
      
      patterns.forEach(pattern => {
        if (!this.regexPatterns.has(pattern.sender)) {
          this.regexPatterns.set(pattern.sender, []);
        }
        this.regexPatterns.get(pattern.sender).push(pattern);
      });
      
      console.log(`📧 Loaded ${patterns.length} email patterns`);
    } catch (error) {
      console.error('Failed to load regex patterns:', error);
    }
  }

  async parseEmail(emailContent, sender) {
    try {
      // 1. Try regex patterns first
      const regexResult = await this.tryRegexParsing(emailContent, sender);
      if (regexResult.confidence > 0.8) {
        return regexResult;
      }

      console.log(`📧 Regex parsing failed for ${sender}, falling back to LLM`);

      // 2. Fallback to LLM parsing
      const llmResult = await llmService.parseEmail(emailContent);
      
      // 3. Learn new regex pattern from successful LLM parse
      if (llmResult.confidence > 0.9) {
        await this.learnRegexPattern(emailContent, llmResult, sender);
      }
      
      return llmResult;
    } catch (error) {
      console.error('Email parsing error:', error);
      throw new Error('Failed to parse email content');
    }
  }

  async tryRegexParsing(emailContent, sender) {
    const patterns = this.getPatternsBySender(sender);
    let bestResult = { confidence: 0 };

    for (const pattern of patterns) {
      try {
        const result = this.extractDataWithPattern(emailContent, pattern);
        if (result.confidence > bestResult.confidence) {
          bestResult = result;
          // Update pattern usage
          await pattern.updateSuccessRate(result.confidence > 0.7);
        }
      } catch (error) {
        console.error(`Pattern matching error for ${pattern.merchantName}:`, error);
      }
    }

    return bestResult;
  }

  extractDataWithPattern(emailContent, pattern) {
    const result = {
      amount: null,
      description: '',
      merchant: pattern.merchantName,
      date: new Date(),
      category: this.predictCategory(pattern.merchantName),
      confidence: 0,
      source: 'email'
    };

    try {
      // Extract amount
      const amountRegex = new RegExp(pattern.patterns.amount, 'gi');
      const amountMatch = emailContent.match(amountRegex);
      if (amountMatch) {
        const amount = parseFloat(amountMatch[0].replace(/[^0-9.]/g, ''));
        if (!isNaN(amount) && amount > 0) {
          result.amount = amount;
          result.confidence += 0.4;
        }
      }

      // Extract date if pattern exists
      if (pattern.patterns.date) {
        const dateRegex = new RegExp(pattern.patterns.date, 'gi');
        const dateMatch = emailContent.match(dateRegex);
        if (dateMatch) {
          const parsedDate = new Date(dateMatch[0]);
          if (!isNaN(parsedDate.getTime())) {
            result.date = parsedDate;
            result.confidence += 0.2;
          }
        }
      }

      // Extract description
      if (pattern.patterns.description) {
        const descRegex = new RegExp(pattern.patterns.description, 'gi');
        const descMatch = emailContent.match(descRegex);
        if (descMatch) {
          result.description = descMatch[0].trim();
          result.confidence += 0.2;
        }
      }

      // Default description if none found
      if (!result.description) {
        result.description = `${pattern.merchantName} purchase`;
        result.confidence += 0.1;
      }

      // Confidence bonus for known merchant
      result.confidence += 0.1;

    } catch (error) {
      console.error('Pattern extraction error:', error);
    }

    return result;
  }

  getPatternsBySender(sender) {
    if (!sender) return [];
    
    const directMatch = this.regexPatterns.get(sender.toLowerCase()) || [];
    
    // Also try domain-based matching
    const domain = sender.includes('@') ? sender.split('@')[1] : '';
    const domainPatterns = [];
    
    if (domain) {
      for (const [patternSender, patterns] of this.regexPatterns) {
        if (patternSender.includes(domain)) {
          domainPatterns.push(...patterns);
        }
      }
    }

    return [...directMatch, ...domainPatterns];
  }

  async learnRegexPattern(emailContent, llmResult, sender) {
    try {
      console.log(`🤖 Learning new pattern for ${sender}`);
      
      // Find the exact text segments that match the parsed data
      const amountMatch = this.findExactMatch(emailContent, llmResult.amount.toString());
      const dateMatch = this.findExactMatch(emailContent, llmResult.date);
      
      if (!amountMatch) {
        console.log('Could not find amount in email content, skipping pattern learning');
        return;
      }

      // Generate regex patterns from successful matches
      const newPattern = new EmailPattern({
        sender: sender.toLowerCase(),
        merchantName: llmResult.merchant || this.extractMerchantFromSender(sender),
        patterns: {
          amount: this.generateAmountRegex(amountMatch),
          date: dateMatch ? this.generateDateRegex(dateMatch) : null,
          description: this.generateDescriptionRegex(llmResult.description)
        },
        confidence: llmResult.confidence,
        createdBy: 'llm',
        sampleEmails: [{
          content: emailContent.substring(0, 1000), // Store first 1000 chars
          extractedData: llmResult
        }]
      });

      await newPattern.save();
      console.log(`✅ Learned new pattern for ${sender}`);
      
      // Reload patterns to include the new one
      await this.loadRegexPatterns();
      
    } catch (error) {
      console.error('Pattern learning error:', error);
    }
  }

  findExactMatch(text, value) {
    if (!value) return null;
    
    const escaped = value.toString().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escaped, 'gi');
    const match = text.match(regex);
    return match ? match[0] : null;
  }

  generateAmountRegex(amountText) {
    // Create a flexible regex for amounts
    const cleaned = amountText.replace(/[^0-9.]/g, '');
    const beforeChars = amountText.replace(cleaned, '').split(cleaned)[0] || '';
    const afterChars = amountText.replace(cleaned, '').split(cleaned)[1] || '';
    
    return `${this.escapeRegex(beforeChars)}\\d+\\.?\\d*${this.escapeRegex(afterChars)}`;
  }

  generateDateRegex(dateText) {
    // Create regex patterns for common date formats
    if (/\d{1,2}\/\d{1,2}\/\d{4}/.test(dateText)) {
      return '\\d{1,2}\\/\\d{1,2}\\/\\d{4}';
    }
    if (/\d{4}-\d{2}-\d{2}/.test(dateText)) {
      return '\\d{4}-\\d{2}-\\d{2}';
    }
    return null;
  }

  generateDescriptionRegex(description) {
    if (!description) return null;
    
    // Create a simple regex for the description
    const words = description.split(' ').slice(0, 3); // First 3 words
    return words.map(word => this.escapeRegex(word)).join('\\s+');
  }

  escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  extractMerchantFromSender(sender) {
    // Extract merchant name from email sender
    if (sender.includes('@')) {
      const domain = sender.split('@')[1];
      return domain.split('.')[0].charAt(0).toUpperCase() + domain.split('.')[0].slice(1);
    }
    return 'Unknown Merchant';
  }

  predictCategory(merchant) {
    // Simple category prediction based on merchant name
    const merchantLower = merchant.toLowerCase();
    
    if (merchantLower.includes('amazon') || merchantLower.includes('shop')) return 'Shopping';
    if (merchantLower.includes('uber') || merchantLower.includes('lyft')) return 'Transportation';
    if (merchantLower.includes('starbucks') || merchantLower.includes('coffee')) return 'Food & Drink';
    if (merchantLower.includes('gas') || merchantLower.includes('shell') || merchantLower.includes('exxon')) return 'Transportation';
    if (merchantLower.includes('netflix') || merchantLower.includes('spotify')) return 'Entertainment';
    
    return 'Other';
  }

  async getPatterns() {
    return await EmailPattern.find().sort({ successRate: -1 });
  }

  async testParsing(sampleEmail) {
    // Test method for debugging
    const sender = 'test@example.com';
    return await this.parseEmail(sampleEmail, sender);
  }
}

module.exports = new EmailParser();