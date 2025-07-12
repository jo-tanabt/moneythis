import { useState } from 'react'
import { useQuery } from 'react-query'
import { Link } from 'react-router-dom'
import NotionCard from '../components/common/NotionCard'
import LoadingSpinner from '../components/common/LoadingSpinner'
import ExpenseList from '../components/expenses/ExpenseList'
import ExpenseFilter from '../components/expenses/ExpenseFilter'
import { expenseAPI } from '../services/api'

const ExpensesPage = () => {
  const [filters, setFilters] = useState({
    category: '',
    startDate: '',
    endDate: '',
    sortBy: 'date',
    sortOrder: 'desc',
    page: 1
  })

  const { data: expensesData, isLoading, refetch } = useQuery(
    ['expenses', filters],
    () => expenseAPI.getExpenses(filters),
    { 
      select: data => data.data,
      keepPreviousData: true
    }
  )

  const handleFilterChange = (newFilters) => {
    setFilters({ ...filters, ...newFilters, page: 1 })
  }

  const handlePageChange = (page) => {
    setFilters({ ...filters, page })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-notion-text">Expenses</h1>
        <Link 
          to="/add-expense"
          className="notion-button-primary"
        >
          + Add Expense
        </Link>
      </div>

      <ExpenseFilter 
        filters={filters}
        onFilterChange={handleFilterChange}
      />

      {isLoading ? (
        <NotionCard>
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="large" />
          </div>
        </NotionCard>
      ) : (
        <ExpenseList 
          expenses={expensesData?.expenses || []}
          pagination={{
            currentPage: expensesData?.currentPage || 1,
            totalPages: expensesData?.totalPages || 1,
            total: expensesData?.total || 0
          }}
          onPageChange={handlePageChange}
          onRefresh={refetch}
        />
      )}
    </div>
  )
}

export default ExpensesPage