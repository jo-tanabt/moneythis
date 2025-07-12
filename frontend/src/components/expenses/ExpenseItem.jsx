import { useState } from 'react'
import { useMutation } from 'react-query'
import { format } from 'date-fns'
import { expenseAPI } from '../../services/api'
import toast from 'react-hot-toast'

const ExpenseItem = ({ expense, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({
    amount: expense.amount,
    description: expense.description,
    category: expense.category
  })

  const deleteMutation = useMutation(
    () => expenseAPI.deleteExpense(expense._id),
    {
      onSuccess: () => {
        toast.success('Expense deleted')
        onUpdate()
      },
      onError: () => {
        toast.error('Failed to delete expense')
      }
    }
  )

  const updateMutation = useMutation(
    (data) => expenseAPI.updateExpense(expense._id, data),
    {
      onSuccess: () => {
        toast.success('Expense updated')
        setIsEditing(false)
        onUpdate()
      },
      onError: () => {
        toast.error('Failed to update expense')
      }
    }
  )

  const handleSave = () => {
    updateMutation.mutate(editData)
  }

  const handleCancel = () => {
    setEditData({
      amount: expense.amount,
      description: expense.description,
      category: expense.category
    })
    setIsEditing(false)
  }

  const sourceIcons = {
    email: '📧',
    nlp: '🤖',
    manual: '✋'
  }

  const confidenceColor = expense.confidence >= 0.9 ? 'text-green-600' : 
                         expense.confidence >= 0.7 ? 'text-yellow-600' : 'text-red-600'

  return (
    <div className="flex items-center justify-between p-4 border border-notion-border rounded-lg hover:bg-notion-hover transition-colors">
      {isEditing ? (
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="number"
            value={editData.amount}
            onChange={(e) => setEditData({ ...editData, amount: parseFloat(e.target.value) })}
            className="notion-input"
            step="0.01"
            min="0"
          />
          <input
            type="text"
            value={editData.description}
            onChange={(e) => setEditData({ ...editData, description: e.target.value })}
            className="notion-input"
            placeholder="Description"
          />
          <input
            type="text"
            value={editData.category}
            onChange={(e) => setEditData({ ...editData, category: e.target.value })}
            className="notion-input"
            placeholder="Category"
          />
        </div>
      ) : (
        <div className="flex-1">
          <div className="flex items-center space-x-4">
            <div className="text-lg font-semibold text-notion-text">
              ${expense.amount.toFixed(2)}
            </div>
            <div>
              <p className="font-medium text-notion-text">{expense.description}</p>
              <div className="flex items-center space-x-3 text-sm text-notion-muted">
                <span>{expense.category}</span>
                {expense.merchant && <span>• {expense.merchant}</span>}
                <span>• {format(new Date(expense.date), 'MMM d, yyyy')}</span>
                <span className="flex items-center space-x-1">
                  <span>{sourceIcons[expense.source]}</span>
                  <span>{expense.source.toUpperCase()}</span>
                </span>
                {expense.confidence < 1 && (
                  <span className={`${confidenceColor} text-xs`}>
                    {Math.round(expense.confidence * 100)}% confidence
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center space-x-2 ml-4">
        {isEditing ? (
          <>
            <button
              onClick={handleSave}
              disabled={updateMutation.isLoading}
              className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
            >
              Save
            </button>
            <button
              onClick={handleCancel}
              className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setIsEditing(true)}
              className="px-3 py-1 text-sm notion-button-secondary"
            >
              Edit
            </button>
            <button
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isLoading}
              className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
            >
              Delete
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default ExpenseItem