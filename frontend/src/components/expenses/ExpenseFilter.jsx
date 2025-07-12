import { useQuery } from 'react-query'
import { categoryAPI } from '../../services/api'

const ExpenseFilter = ({ filters, onFilterChange }) => {
  const { data: categories } = useQuery(
    'categories',
    () => categoryAPI.getCategories(),
    { select: data => data.data }
  )

  const handleInputChange = (field, value) => {
    onFilterChange({ [field]: value })
  }

  const clearFilters = () => {
    onFilterChange({
      category: '',
      startDate: '',
      endDate: '',
      sortBy: 'date',
      sortOrder: 'desc'
    })
  }

  const hasActiveFilters = filters.category || filters.startDate || filters.endDate

  const sortOptions = [
    { value: 'date', label: 'Date' },
    { value: 'amount', label: 'Amount' },
    { value: 'description', label: 'Description' },
    { value: 'category', label: 'Category' },
    { value: 'merchant', label: 'Merchant' }
  ]

  return (
    <div className="bg-white border border-notion-border rounded-lg p-4 space-y-4">
      {/* Filters Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-notion-text mb-1">
            Category
          </label>
          <select
            value={filters.category}
            onChange={(e) => handleInputChange('category', e.target.value)}
            className="notion-select"
          >
            <option value="">All Categories</option>
            {categories?.map((category) => (
              <option key={category._id} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-notion-text mb-1">
            Start Date
          </label>
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => handleInputChange('startDate', e.target.value)}
            className="notion-input"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-notion-text mb-1">
            End Date
          </label>
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => handleInputChange('endDate', e.target.value)}
            className="notion-input"
          />
        </div>

        <div className="flex items-end">
          <button
            onClick={clearFilters}
            disabled={!hasActiveFilters}
            className="notion-button-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Sorting Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-notion-border">
        <div>
          <label className="block text-sm font-medium text-notion-text mb-1">
            Sort By
          </label>
          <select
            value={filters.sortBy || 'date'}
            onChange={(e) => handleInputChange('sortBy', e.target.value)}
            className="notion-select"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-notion-text mb-1">
            Order
          </label>
          <select
            value={filters.sortOrder || 'desc'}
            onChange={(e) => handleInputChange('sortOrder', e.target.value)}
            className="notion-select"
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </div>

        <div className="flex items-end">
          <div className="text-sm text-notion-muted">
            Sort by {sortOptions.find(o => o.value === (filters.sortBy || 'date'))?.label.toLowerCase()} ({filters.sortOrder === 'asc' ? 'A-Z, oldest first' : 'Z-A, newest first'})
          </div>
        </div>
      </div>
    </div>
  )
}

export default ExpenseFilter