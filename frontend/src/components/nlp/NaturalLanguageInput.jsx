import { useState } from 'react'
import { useMutation } from 'react-query'
import toast from 'react-hot-toast'
import { expenseAPI } from '../../services/api'
import LoadingSpinner from '../common/LoadingSpinner'

const NaturalLanguageInput = ({ onSuccess }) => {
  const [text, setText] = useState('')
  const [parsedData, setParsedData] = useState(null)

  const parseMutation = useMutation(
    (text) => expenseAPI.parseText(text),
    {
      onSuccess: (response) => {
        setParsedData(response.data)
        toast.success('Expense parsed and created!')
        setText('')
        onSuccess()
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to parse expense')
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

  const examples = [
    "Spent $12.50 on coffee at Starbucks",
    "Lunch with friends $45 yesterday",
    "Gas station $38.20",
    "Groceries at Walmart $67.80",
    "Uber ride $15.30"
  ]

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
          <span>🤖 Parse & Create Expense</span>
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