const axios = require('axios');

class NotificationService {
  constructor() {
    this.telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
    this.telegramApiUrl = `https://api.telegram.org/bot${this.telegramBotToken}`;
  }

  async sendTelegramNotification(chatId, message) {
    if (!this.telegramBotToken) {
      console.error('Telegram bot token not configured');
      return false;
    }

    try {
      const response = await axios.post(`${this.telegramApiUrl}/sendMessage`, {
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML'
      });

      return response.data.ok;
    } catch (error) {
      console.error('Telegram notification error:', error.response?.data || error.message);
      return false;
    }
  }

  async sendLineNotification(userId, message) {
    // TODO: Implement Line messaging API
    console.log('Line notification not implemented yet');
    return false;
  }

  async notifyExpenseLogged(userId, expense) {
    try {
      // Get user notification preferences
      const User = require('../models/User');
      const user = await User.findById(userId);

      if (!user || !user.notificationSettings.enableNotifications) {
        return;
      }

      const amount = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: expense.currency || 'USD'
      }).format(expense.amount);

      const sourceEmoji = {
        email: '📧',
        nlp: '🤖',
        manual: '✋'
      };

      const message = `
💰 <b>New Expense Logged</b>

💵 Amount: ${amount}
📝 Description: ${expense.description}
🏷️ Category: ${expense.category}
${expense.merchant ? `🏪 Merchant: ${expense.merchant}` : ''}
📅 Date: ${expense.date.toLocaleDateString()}
${sourceEmoji[expense.source] || '📝'} Source: ${expense.source.toUpperCase()}

${expense.confidence < 0.9 ? '⚠️ <i>Auto-parsed - please verify accuracy</i>' : ''}
      `.trim();

      let success = false;

      // Send to preferred platform
      if (user.notificationSettings.preferredPlatform === 'telegram' && user.notificationSettings.telegramChatId) {
        success = await this.sendTelegramNotification(user.notificationSettings.telegramChatId, message);
      } else if (user.notificationSettings.preferredPlatform === 'line' && user.notificationSettings.lineBotId) {
        success = await this.sendLineNotification(user.notificationSettings.lineBotId, message);
      }

      return success;
    } catch (error) {
      console.error('Notification service error:', error);
      return false;
    }
  }

  async notifyDailySummary(userId, summary) {
    try {
      const User = require('../models/User');
      const user = await User.findById(userId);

      if (!user || !user.notificationSettings.enableNotifications) {
        return;
      }

      const totalAmount = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(summary.totalSpent);

      const message = `
📊 <b>Daily Expense Summary</b>

💰 Total Spent: ${totalAmount}
📝 Expenses: ${summary.totalExpenses}
🏷️ Categories: ${summary.categoriesUsed}
📧 Auto-parsed: ${summary.autoParsed}

Have a great day! 🌟
      `.trim();

      if (user.notificationSettings.telegramChatId) {
        return await this.sendTelegramNotification(user.notificationSettings.telegramChatId, message);
      }

      return false;
    } catch (error) {
      console.error('Daily summary notification error:', error);
      return false;
    }
  }

  async setupTelegramWebhook(chatId) {
    // Helper method to connect user's Telegram chat
    try {
      const testMessage = `
🎉 <b>Welcome to ExpenseThis!</b>

Your Telegram notifications are now set up successfully.
You'll receive updates here whenever a new expense is logged.

To get started, visit your dashboard and start tracking expenses! 💰
      `.trim();

      return await this.sendTelegramNotification(chatId, testMessage);
    } catch (error) {
      console.error('Telegram setup error:', error);
      return false;
    }
  }
}

module.exports = new NotificationService();