import { useState } from 'react'
import { useMutation, useQuery } from 'react-query'
import toast from 'react-hot-toast'
import { expenseAPI, categoryAPI } from '../../services/api'
import LoadingSpinner from '../common/LoadingSpinner'

const NaturalLanguageInput = ({ onSuccess }) => {
  const [text, setText] = useState('')
  const [parsedData, setParsedData] = useState(null)
  const [showPreview, setShowPreview] = useState(false)

  const { data: categories } = useQuery(
    'categories',
    () => categoryAPI.getCategories(),
    { select: data => data.data }
  )

  const parseMutation = useMutation(
    (text) => {
      // First, just parse without creating
      return fetch(`${import.meta.env.VITE_API_URL}/expenses/parse-preview`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ text })
      }).then(res => res.json())
    },
    {
      onSuccess: (data) => {
        setParsedData(data)
        setShowPreview(true)
        toast.success('Expense parsed! Please review and confirm.')
      },
      onError: (error) => {
        toast.error('Failed to parse expense')
      }
    }
  )

  const createMutation = useMutation(
    (expenseData) => expenseAPI.createExpense(expenseData),
    {
      onSuccess: () => {
        toast.success('Expense created successfully!')
        setText('')
        setParsedData(null)
        setShowPreview(false)
        onSuccess()
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to create expense')
      }
    }
  )

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!text.trim()) {
      toast.error('Please enter some text')
      return
    }
    parseMutation.mutate(text)
  }

  const handleConfirm = () => {
    createMutation.mutate({
      ...parsedData,
      source: 'nlp'
    })
  }

  const handleEdit = (field, value) => {
    setParsedData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleCancel = () => {
    setShowPreview(false)
    setParsedData(null)
  }

  const examples = [
    "Spent $12.50 on coffee at Starbucks",
    "Lunch with friends $45 yesterday",
    "Gas station $38.20",
    "Groceries at Walmart $67.80",
    "Uber ride $15.30"
  ]

  if (showPreview && parsedData) {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-notion-text mb-2">
            Review Parsed Expense
          </h3>
          <p className="text-notion-muted text-sm">
            Please review the details and make any necessary changes before confirming
          </p>
        </div>

        <div className="bg-notion-secondary p-4 rounded-lg">
          <p className="text-sm text-notion-muted mb-2">Original text:</p>
          <p className="italic">"{text}"</p>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-notion-text mb-1">Amount</label>
              <input
                type="number"
                value={parsedData.amount || ''}
                onChange={(e) => handleEdit('amount', parseFloat(e.target.value))}
                className="notion-input"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-notion-text mb-1">Category</label>
              <select
                value={parsedData.category || ''}
                onChange={(e) => handleEdit('category', e.target.value)}
                className="notion-select"
              >
                <option value="">Select a category</option>
                {categories?.map((category) => (
                  <option key={category._id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-notion-text mb-1">Description</label>
            <input
              type="text"
              value={parsedData.description || ''}
              onChange={(e) => handleEdit('description', e.target.value)}
              className="notion-input"
            />
          </div>

          {parsedData.merchant && (
            <div>
              <label className="block text-sm font-medium text-notion-text mb-1">Merchant</label>
              <input
                type="text"
                value={parsedData.merchant || ''}
                onChange={(e) => handleEdit('merchant', e.target.value)}
                className="notion-input"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-notion-text mb-1">Date</label>
            <input
              type="date"
              value={parsedData.date ? new Date(parsedData.date).toISOString().split('T')[0] : ''}
              onChange={(e) => handleEdit('date', e.target.value)}
              className="notion-input"
            />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={handleConfirm}
            disabled={createMutation.isLoading}
            className="notion-button-primary disabled:opacity-50 flex items-center space-x-2"
          >
            {createMutation.isLoading && <LoadingSpinner size="small" />}
            <span>✅ Confirm & Create Expense</span>
          </button>
          <button
            onClick={handleCancel}
            className="notion-button-secondary"
          >
            ❌ Cancel
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-notion-text mb-2">
          Describe Your Expense
        </h3>
        <p className="text-notion-muted text-sm">
          Just type naturally how you spent money, and we'll automatically extract the details
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Example: Spent $15.75 on lunch at McDonald's yesterday"
            rows={4}
            className="notion-input text-lg"
            disabled={parseMutation.isLoading}
          />
        </div>

        <button
          type="submit"
          disabled={parseMutation.isLoading || !text.trim()}
          className="notion-button-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          {parseMutation.isLoading && <LoadingSpinner size="small" />}
          <span>🤖 Parse Expense</span>
        </button>
      </form>

      {/* Examples */}
      <div>
        <h4 className="text-md font-medium text-notion-text mb-3">Examples to try:</h4>
        <div className="grid grid-cols-1 gap-2">
          {examples.map((example, index) => (
            <button
              key={index}
              onClick={() => setText(example)}
              className="text-left p-3 bg-notion-secondary hover:bg-notion-hover rounded-md transition-colors text-notion-text"
              disabled={parseMutation.isLoading}
            >
              "{example}"
            </button>
          ))}
        </div>
      </div>

      {/* Tips */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">💡 Tips for better parsing:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Include the amount with $ sign</li>
          <li>• Mention the merchant or store name</li>
          <li>• Add time references like "yesterday" or "today"</li>
          <li>• Describe what you bought</li>
        </ul>
      </div>
    </div>
  )
}

export default NaturalLanguageInput