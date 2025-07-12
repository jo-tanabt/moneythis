const { OpenAI } = require('openai');

class LLMService {
  constructor() {
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
  "description": string,
  "merchant": string (if mentioned),
  "date": string (if mentioned, otherwise current date),
  "category": string,
  "confidence": number (0-1)
}

Text: "${text}"

Categories: Food & Drink, Transportation, Shopping, Entertainment, Bills & Utilities, Healthcare, Travel, Other

Examples:
"Spent $12.50 on coffee at Starbucks" -> {"amount": 12.50, "description": "Coffee", "merchant": "Starbucks", "category": "Food & Drink", "confidence": 0.9}
"Gas $45 yesterday" -> {"amount": 45, "description": "Gas", "category": "Transportation", "confidence": 0.8}

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
        max_tokens: 150
      });

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