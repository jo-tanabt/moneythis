import { useQuery } from 'react-query'
import NotionCard from '../common/NotionCard'
import LoadingSpinner from '../common/LoadingSpinner'
import { dashboardAPI } from '../../services/api'

const MetricCard = ({ title, value, subtitle, color = 'blue' }) => {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-50',
    green: 'text-green-600 bg-green-50',
    purple: 'text-purple-600 bg-purple-50',
    gray: 'text-gray-600 bg-gray-50'
  }

  return (
    <div className={`p-4 rounded-lg ${colorClasses[color]}`}>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-sm font-medium">{title}</p>
      <p className="text-xs opacity-75">{subtitle}</p>
    </div>
  )
}

const ParsingAnalytics = ({ timeRange }) => {
  const { data: analyticsData, isLoading } = useQuery(
    ['parsing-analytics', timeRange],
    () => dashboardAPI.getParsingAnalytics({ timeRange }),
    { select: data => data.data }
  )

  if (isLoading) {
    return (
      <NotionCard>
        <LoadingSpinner size="medium" />
      </NotionCard>
    )
  }

  const analytics = analyticsData || {
    totalExpenses: 0,
    emailParsed: 0,
    nlpParsed: 0,
    manualEntries: 0,
    timeSaved: 0,
    automationRate: 0
  }

  return (
    <NotionCard>
      <h3 className="text-lg font-semibold mb-6 text-notion-text">Automation Value</h3>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard 
          title="Email Parsed"
          value={analytics.emailParsed}
          subtitle="expenses"
          color="blue"
        />
        <MetricCard 
          title="Automation Rate"
          value={`${analytics.automationRate}%`}
          subtitle="of total expenses"
          color="green"
        />
        <MetricCard 
          title="Time Saved"
          value={analytics.timeSaved}
          subtitle="minutes"
          color="purple"
        />
        <MetricCard 
          title="Manual Entries"
          value={analytics.manualEntries}
          subtitle="expenses"
          color="gray"
        />
      </div>

      <div className="space-y-4">
        <div className="flex justify-between text-sm">
          <span className="text-notion-text">Email Parsing</span>
          <span className="text-notion-muted">{analytics.emailParsed} expenses</span>
        </div>
        <div className="w-full bg-notion-secondary rounded-full h-2">
          <div 
            className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
            style={{ 
              width: analytics.totalExpenses > 0 
                ? `${(analytics.emailParsed / analytics.totalExpenses) * 100}%` 
                : '0%' 
            }}
          />
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-notion-text">Natural Language</span>
          <span className="text-notion-muted">{analytics.nlpParsed} expenses</span>
        </div>
        <div className="w-full bg-notion-secondary rounded-full h-2">
          <div 
            className="bg-purple-500 h-2 rounded-full transition-all duration-300" 
            style={{ 
              width: analytics.totalExpenses > 0 
                ? `${(analytics.nlpParsed / analytics.totalExpenses) * 100}%` 
                : '0%' 
            }}
          />
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-notion-text">Manual Entries</span>
          <span className="text-notion-muted">{analytics.manualEntries} expenses</span>
        </div>
        <div className="w-full bg-notion-secondary rounded-full h-2">
          <div 
            className="bg-gray-500 h-2 rounded-full transition-all duration-300" 
            style={{ 
              width: analytics.totalExpenses > 0 
                ? `${(analytics.manualEntries / analytics.totalExpenses) * 100}%` 
                : '0%' 
            }}
          />
        </div>
      </div>

      {analytics.totalExpenses === 0 && (
        <div className="text-center py-8">
          <p className="text-notion-muted">No expenses found for this period</p>
          <p className="text-sm text-notion-muted mt-2">Start adding expenses to see automation insights</p>
        </div>
      )}
    </NotionCard>
  )
}

export default ParsingAnalytics