const { OpenAI } = require('openai');

class LLMService {
  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY not found in environment variables');
    } else {
      console.log('OpenAI API key loaded:', process.env.OPENAI_API_KEY.substring(0, 10) + '...');
    }
    
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  async parseEmail(emailContent) {
    try {
      const prompt = `
Parse the following email content and extract expense information. Return a JSON object with the following structure:

{
  "amount": number (extracted amount as a decimal),
  "description": string (brief description of the purchase),
  "merchant": string (name of the merchant/vendor),
  "date": string (date in ISO format, use email date or current date if not found),
  "category": string (predicted category like "Food & Drink", "Transportation", "Shopping", etc.),
  "confidence": number (confidence score between 0 and 1)
}

Email content:
${emailContent}

Rules:
- Only extract if this is clearly a purchase receipt or expense
- Amount should be the total purchase amount
- If multiple amounts exist, use the total/final amount
- Category should be one of: Food & Drink, Transportation, Shopping, Entertainment, Bills & Utilities, Healthcare, Travel, Other
- Confidence should be high (0.8+) only if all fields are clearly identifiable
- Return null for amount if no clear expense is found

Respond with only the JSON object:`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.1,
        max_tokens: 200
      });

      const result = JSON.parse(response.choices[0].message.content);
      
      // Validate and clean the result
      if (!result.amount || result.amount <= 0) {
        throw new Error('No valid amount found in email');
      }

      return {
        amount: parseFloat(result.amount),
        description: result.description || 'Email purchase',
        merchant: result.merchant || 'Unknown Merchant',
        date: result.date ? new Date(result.date) : new Date(),
        category: result.category || 'Other',
        confidence: result.confidence || 0.7,
        source: 'email'
      };

    } catch (error) {
      console.error('LLM parsing error:', error);
      throw new Error('Failed to parse email with LLM');
    }
  }

  async parseExpenseText(text) {
    try {
      const prompt = `
Parse the following natural language text about an expense and extract the information. Return a JSON object:

{
  "amount": number,
  "description": string (detailed description of what was purchased),
  "merchant": string (if mentioned),
  "date": string (if mentioned, otherwise current date),
  "category": string,
  "confidence": number (0-1)
}

Text: "${text}"

Categories (use exact names): Food & Drink, Transportation, Shopping, Entertainment, Bills & Utilities, Healthcare, Travel, Other

IMPORTANT RULES:
- Create a meaningful, specific description (not just generic words like "expense" or "purchase")
- Use title case for descriptions (e.g., "Coffee At Starbucks", "Lunch With Friends", "Gas Fill-Up")
- Extract specific items when mentioned (e.g., "coffee", "lunch", "groceries", "uber ride")
- Be descriptive but concise (2-4 words typically)

Examples:
"Spent $12.50 on coffee at Starbucks" -> {"amount": 12.50, "description": "Coffee At Starbucks", "merchant": "Starbucks", "category": "Food & Drink", "confidence": 0.9}
"Gas station $38.20" -> {"amount": 38.20, "description": "Gas Fill-Up", "category": "Transportation", "confidence": 0.8}
"Lunch with friends $45 yesterday" -> {"amount": 45, "description": "Lunch With Friends", "category": "Food & Drink", "confidence": 0.9}
"Groceries at Walmart $67.80" -> {"amount": 67.80, "description": "Groceries At Walmart", "merchant": "Walmart", "category": "Shopping", "confidence": 0.9}

Respond with only the JSON:`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.1,
        max_tokens: 200
      });

      console.log('OpenAI response:', response.choices[0].message.content);

      const result = JSON.parse(response.choices[0].message.content);
      
      if (!result.amount || result.amount <= 0) {
        throw new Error('No valid amount found in text');
      }

      return {
        amount: parseFloat(result.amount),
        description: result.description || 'Expense',
        merchant: result.merchant || null,
        date: result.date ? new Date(result.date) : new Date(),
        category: result.category || 'Other',
        confidence: result.confidence || 0.7,
        source: 'nlp'
      };

    } catch (error) {
      console.error('NLP parsing error:', error);
      console.error('Error details:', error.message);
      
      // Fallback response if OpenAI fails
      const amountMatch = text.match(/\$?(\d+(?:\.\d{2})?)/);
      if (amountMatch) {
        return {
          amount: parseFloat(amountMatch[1]),
          description: 'Parsed Expense',
          merchant: null,
          date: new Date(),
          category: 'Other',
          confidence: 0.5,
          source: 'nlp'
        };
      }
      
      throw new Error('Failed to parse expense text');
    }
  }

  async categorizeExpense(description, merchant) {
    try {
      const prompt = `
Categorize this expense into one of these categories:
Food & Drink, Transportation, Shopping, Entertainment, Bills & Utilities, Healthcare, Travel, Other

Description: ${description}
Merchant: ${merchant || 'Unknown'}

Respond with only the category name:`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.1,
        max_tokens: 20
      });

      return response.choices[0].message.content.trim();
    } catch (error) {
      console.error('Categorization error:', error);
      return 'Other';
    }
  }
}

module.exports = new LLMService();