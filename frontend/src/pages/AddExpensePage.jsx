import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import NotionCard from '../components/common/NotionCard'
import ExpenseForm from '../components/expenses/ExpenseForm'
import NaturalLanguageInput from '../components/nlp/NaturalLanguageInput'

const AddExpensePage = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('manual')

  const handleExpenseCreated = () => {
    navigate('/expenses')
  }

  const tabs = [
    { id: 'manual', label: 'Manual Entry', icon: '✋' },
    { id: 'nlp', label: 'Natural Language', icon: '🤖' },
  ]

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-notion-text">Add Expense</h1>
        <p className="text-notion-muted mt-1">
          Add a new expense manually or using natural language
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-notion-secondary p-1 rounded-lg">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-notion-text shadow-sm'
                : 'text-notion-muted hover:text-notion-text'
            }`}
          >
            <span>{tab.icon}</span>
            <span className="font-medium">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <NotionCard>
        {activeTab === 'manual' && (
          <ExpenseForm onSuccess={handleExpenseCreated} />
        )}
        
        {activeTab === 'nlp' && (
          <NaturalLanguageInput onSuccess={handleExpenseCreated} />
        )}
      </NotionCard>
    </div>
  )
}

export default AddExpensePage