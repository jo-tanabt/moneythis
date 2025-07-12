import { useState } from 'react'
import NotionCard from '../components/common/NotionCard'
import { useAuth } from '../hooks/useAuth'

const SettingsPage = () => {
  const { user } = useAuth()
  const [telegramChatId, setTelegramChatId] = useState(
    user?.notificationSettings?.telegramChatId || ''
  )

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-notion-text">Settings</h1>

      {/* Profile Settings */}
      <NotionCard>
        <h2 className="text-xl font-semibold text-notion-text mb-4">Profile</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-notion-text mb-1">
              Name
            </label>
            <input
              type="text"
              value={user?.name || ''}
              disabled
              className="notion-input bg-notion-secondary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-notion-text mb-1">
              Email
            </label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="notion-input bg-notion-secondary"
            />
          </div>
        </div>
      </NotionCard>

      {/* Notification Settings */}
      <NotionCard>
        <h2 className="text-xl font-semibold text-notion-text mb-4">Notifications</h2>
        <div className="space-y-6">
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                defaultChecked={user?.notificationSettings?.enableNotifications}
                className="mr-2"
              />
              <span className="text-notion-text">Enable expense notifications</span>
            </label>
          </div>

          <div>
            <h3 className="font-medium text-notion-text mb-3">Telegram Setup</h3>
            <div className="bg-blue-50 p-4 rounded-lg mb-4">
              <h4 className="font-medium text-blue-900 mb-2">📱 How to set up Telegram notifications:</h4>
              <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                <li>Search for "ExpenseThisBot" on Telegram</li>
                <li>Start a conversation with the bot</li>
                <li>Send the command /start</li>
                <li>Copy your Chat ID and paste it below</li>
              </ol>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-notion-text mb-1">
                Telegram Chat ID
              </label>
              <input
                type="text"
                value={telegramChatId}
                onChange={(e) => setTelegramChatId(e.target.value)}
                placeholder="Your Telegram Chat ID"
                className="notion-input"
              />
              <p className="text-sm text-notion-muted mt-1">
                Get this from @ExpenseThisBot after sending /start
              </p>
            </div>
          </div>

          <button className="notion-button-primary">
            Save Notification Settings
          </button>
        </div>
      </NotionCard>

      {/* Email Sync Settings */}
      <NotionCard>
        <h2 className="text-xl font-semibold text-notion-text mb-4">Email Sync</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-notion-text">Gmail Integration</h3>
              <p className="text-sm text-notion-muted">
                Automatically parse receipts from your Gmail
              </p>
            </div>
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
              ✅ Connected
            </span>
          </div>

          <button className="notion-button-secondary">
            🔄 Sync Recent Emails
          </button>
        </div>
      </NotionCard>

      {/* Data & Privacy */}
      <NotionCard>
        <h2 className="text-xl font-semibold text-notion-text mb-4">Data & Privacy</h2>
        <div className="space-y-4">
          <button className="notion-button-secondary">
            📤 Export My Data
          </button>
          <button className="text-red-600 hover:text-red-700 underline">
            Delete My Account
          </button>
        </div>
      </NotionCard>
    </div>
  )
}

export default SettingsPage