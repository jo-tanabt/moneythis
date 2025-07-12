import { useState } from 'react'
import { useQuery } from 'react-query'
import NotionCard from '../components/common/NotionCard'
import LoadingSpinner from '../components/common/LoadingSpinner'
import CategoryDashboard from '../components/dashboard/CategoryDashboard'
import ComparisonDashboard from '../components/dashboard/ComparisonDashboard'
import ParsingAnalytics from '../components/dashboard/ParsingAnalytics'
import { dashboardAPI } from '../services/api'

const DashboardPage = () => {
  const [timeRange, setTimeRange] = useState('past_month')

  const { data: summary, isLoading: summaryLoading } = useQuery(
    ['dashboard-summary', timeRange],
    () => dashboardAPI.getSummary({ timeRange }),
    { select: data => data.data }
  )

  const { data: comparison, isLoading: comparisonLoading } = useQuery(
    'dashboard-comparison',
    () => dashboardAPI.getComparison(),
    { select: data => data.data }
  )

  if (summaryLoading || comparisonLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-notion-text">Dashboard</h1>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="notion-select"
        >
          <option value="past_week">Past Week</option>
          <option value="past_2_weeks">Past 2 Weeks</option>
          <option value="past_month">Past Month</option>
          <option value="past_3_months">Past 3 Months</option>
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <NotionCard>
          <div className="text-center">
            <p className="text-2xl font-bold text-notion-text">
              ${summary?.totalSpent?.toFixed(2) || '0.00'}
            </p>
            <p className="text-sm text-notion-muted">Total Spent</p>
          </div>
        </NotionCard>
        
        <NotionCard>
          <div className="text-center">
            <p className="text-2xl font-bold text-notion-text">
              {summary?.totalExpenses || 0}
            </p>
            <p className="text-sm text-notion-muted">Expenses</p>
          </div>
        </NotionCard>
        
        <NotionCard>
          <div className="text-center">
            <p className="text-2xl font-bold text-notion-text">
              ${summary?.averageExpense?.toFixed(2) || '0.00'}
            </p>
            <p className="text-sm text-notion-muted">Average Expense</p>
          </div>
        </NotionCard>
        
        <NotionCard>
          <div className="text-center">
            <p className="text-2xl font-bold text-notion-text">
              {summary?.categoriesUsed || 0}
            </p>
            <p className="text-sm text-notion-muted">Categories Used</p>
          </div>
        </NotionCard>
      </div>

      {/* Category Dashboard */}
      <CategoryDashboard timeRange={timeRange} />

      {/* Comparison Dashboard */}
      <ComparisonDashboard data={comparison} />

      {/* Parsing Analytics */}
      <ParsingAnalytics timeRange={timeRange} />
    </div>
  )
}

export default DashboardPage