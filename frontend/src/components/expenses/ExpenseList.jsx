import ExpenseItem from './ExpenseItem'
import NotionCard from '../common/NotionCard'

const ExpenseList = ({ expenses, pagination, onPageChange, onRefresh }) => {
  if (expenses.length === 0) {
    return (
      <NotionCard>
        <div className="text-center py-12">
          <p className="text-notion-muted mb-4">No expenses found</p>
          <button 
            onClick={onRefresh}
            className="notion-button-secondary"
          >
            Refresh
          </button>
        </div>
      </NotionCard>
    )
  }

  return (
    <div className="space-y-4">
      <NotionCard>
        <div className="space-y-3">
          {expenses.map((expense) => (
            <ExpenseItem 
              key={expense._id} 
              expense={expense} 
              onUpdate={onRefresh}
            />
          ))}
        </div>
      </NotionCard>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-notion-muted">
            Showing {expenses.length} of {pagination.total} expenses
          </p>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onPageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
              className="notion-button-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            <span className="px-3 py-1 text-sm text-notion-text">
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>
            
            <button
              onClick={() => onPageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages}
              className="notion-button-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ExpenseList