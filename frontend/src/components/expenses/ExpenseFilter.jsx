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
      endDate: ''
    })
  }

  const hasActiveFilters = filters.category || filters.startDate || filters.endDate

  return (
    <div className="bg-white border border-notion-border rounded-lg p-4">
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
    </div>
  )
}

export default ExpenseFilter