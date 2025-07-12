import { useQuery } from 'react-query'
import { Pie } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js'
import NotionCard from '../common/NotionCard'
import LoadingSpinner from '../common/LoadingSpinner'
import { dashboardAPI } from '../../services/api'

ChartJS.register(ArcElement, Tooltip, Legend)

const CategoryDashboard = ({ timeRange }) => {
  const { data: categoryData, isLoading } = useQuery(
    ['category-breakdown', timeRange],
    () => dashboardAPI.getCategoryBreakdown({ timeRange }),
    { select: data => data.data }
  )

  if (isLoading) {
    return (
      <NotionCard>
        <LoadingSpinner size="medium" />
      </NotionCard>
    )
  }

  const categories = categoryData?.categories || []
  const totalSpent = categoryData?.totalSpent || 0

  const chartData = {
    labels: categories.map(cat => cat._id),
    datasets: [
      {
        data: categories.map(cat => cat.total),
        backgroundColor: [
          '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
          '#F97316', '#06B6D4', '#84CC16', '#EC4899', '#6B7280'
        ],
        borderWidth: 0,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            family: '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto',
          }
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const value = context.parsed
            const percentage = ((value / totalSpent) * 100).toFixed(1)
            return `${context.label}: $${value.toFixed(2)} (${percentage}%)`
          }
        }
      }
    }
  }

  return (
    <NotionCard>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-notion-text">Spending by Category</h2>
        <span className="text-sm text-notion-muted">
          Total: ${totalSpent.toFixed(2)}
        </span>
      </div>
      
      {categories.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-64">
            <Pie data={chartData} options={chartOptions} />
          </div>
          
          <div className="space-y-3">
            {categories.map((category, index) => (
              <div key={category._id} className="flex items-center justify-between p-3 bg-notion-secondary rounded-md">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: chartData.datasets[0].backgroundColor[index] }}
                  />
                  <span className="font-medium text-notion-text">{category._id}</span>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-notion-text">${category.total.toFixed(2)}</p>
                  <p className="text-sm text-notion-muted">{category.count} expenses</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-notion-muted">No expenses found for this period</p>
        </div>
      )}
    </NotionCard>
  )
}

export default CategoryDashboard