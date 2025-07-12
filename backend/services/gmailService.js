const { google } = require('googleapis');
const emailParser = require('./emailParser');
const Expense = require('../models/Expense');
const notificationService = require('./notificationService');

class GmailService {
  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
  }

  async syncRecentEmails(user, days = 7) {
    try {
      // Set up OAuth client with user tokens
      this.oauth2Client.setCredentials({
        access_token: user.googleTokens.accessToken,
        refresh_token: user.googleTokens.refreshToken,
      });

      const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });
      
      // Calculate date range
      const since = new Date();
      since.setDate(since.getDate() - days);
      const query = `after:${Math.floor(since.getTime() / 1000)} (receipt OR purchase OR order OR payment)`;

      // Search for relevant emails
      const response = await gmail.users.messages.list({
        userId: 'me',
        q: query,
        maxResults: 50
      });

      const messages = response.data.messages || [];
      const newExpenses = [];

      for (const message of messages) {
        try {
          // Get email content
          const emailData = await gmail.users.messages.get({
            userId: 'me',
            id: message.id,
            format: 'full'
          });

          // Extract email details
          const headers = emailData.data.payload.headers;
          const fromHeader = headers.find(h => h.name === 'From');
          const subjectHeader = headers.find(h => h.name === 'Subject');
          const dateHeader = headers.find(h => h.name === 'Date');

          const sender = fromHeader?.value || '';
          const subject = subjectHeader?.value || '';
          const emailDate = new Date(dateHeader?.value || Date.now());

          // Get email body
          const emailContent = await this.extractEmailBody(emailData.data.payload);
          
          // Check if this email has already been processed
          const existingExpense = await Expense.findOne({
            userId: user._id,
            'rawData.emailId': message.id
          });

          if (existingExpense) {
            continue; // Skip already processed emails
          }

          // Parse email for expense data
          const parsedData = await emailParser.parseEmail(emailContent, sender);
          
          if (parsedData.amount && parsedData.amount > 0) {
            // Create expense
            const expense = new Expense({
              ...parsedData,
              userId: user._id,
              date: emailDate,
              rawData: {
                emailId: message.id,
                sender,
                subject,
                content: emailContent.substring(0, 1000) // Store first 1000 chars
              }
            });

            await expense.save();
            newExpenses.push(expense);

            // Send notification
            try {
              await notificationService.notifyExpenseLogged(user._id, expense);
            } catch (notifError) {
              console.error('Notification error for email sync:', notifError);
            }
          }
        } catch (emailError) {
          console.error(`Error processing email ${message.id}:`, emailError);
          continue;
        }
      }

      return newExpenses;
    } catch (error) {
      console.error('Gmail sync error:', error);
      throw new Error('Failed to sync emails from Gmail');
    }
  }

  async extractEmailBody(payload) {
    let body = '';

    if (payload.body && payload.body.data) {
      body = Buffer.from(payload.body.data, 'base64').toString('utf-8');
    } else if (payload.parts) {
      for (const part of payload.parts) {
        if (part.mimeType === 'text/plain' || part.mimeType === 'text/html') {
          if (part.body && part.body.data) {
            body += Buffer.from(part.body.data, 'base64').toString('utf-8');
          }
        } else if (part.parts) {
          // Recursively extract from nested parts
          body += await this.extractEmailBody(part);
        }
      }
    }

    // Clean up HTML if present
    body = body.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    
    return body;
  }

  async refreshTokens(user) {
    try {
      this.oauth2Client.setCredentials({
        refresh_token: user.googleTokens.refreshToken,
      });

      const { credentials } = await this.oauth2Client.refreshAccessToken();
      
      // Update user tokens
      user.googleTokens.accessToken = credentials.access_token;
      user.googleTokens.expiryDate = new Date(credentials.expiry_date);
      await user.save();

      return true;
    } catch (error) {
      console.error('Token refresh error:', error);
      return false;
    }
  }
}

module.exports = new GmailService();