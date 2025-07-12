import NotionCard from '../common/NotionCard'

const ComparisonCard = ({ current, previous, type }) => {
  const percentChange = previous > 0 ? (((current - previous) / previous) * 100).toFixed(1) : 0
  const isIncrease = percentChange > 0
  const isDecrease = percentChange < 0

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <span className="text-notion-muted">Current {type}</span>
        <span className="font-semibold text-lg">${current?.toFixed(2) || '0.00'}</span>
      </div>
      
      <div className="flex justify-between items-center">
        <span className="text-notion-muted">Previous {type}</span>
        <span className="text-notion-muted">${previous?.toFixed(2) || '0.00'}</span>
      </div>
      
      <div className={`flex items-center justify-between p-3 rounded-md ${
        isIncrease ? 'bg-red-50' : isDecrease ? 'bg-green-50' : 'bg-notion-secondary'
      }`}>
        <div className="flex items-center space-x-2">
          {isIncrease && <span className="text-red-600">↗️</span>}
          {isDecrease && <span className="text-green-600">↘️</span>}
          {!isIncrease && !isDecrease && <span className="text-notion-muted">➡️</span>}
          <span className={`font-medium ${
            isIncrease ? 'text-red-700' : isDecrease ? 'text-green-700' : 'text-notion-text'
          }`}>
            {Math.abs(percentChange)}%
          </span>
        </div>
        <span className="text-sm text-notion-muted">
          {isIncrease ? 'increase' : isDecrease ? 'decrease' : 'no change'} from last {type}
        </span>
      </div>
    </div>
  )
}

const ComparisonDashboard = ({ data }) => {
  if (!data) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <NotionCard>
          <div className="animate-pulse">
            <div className="h-4 bg-notion-secondary rounded mb-4"></div>
            <div className="space-y-3">
              <div className="h-3 bg-notion-secondary rounded"></div>
              <div className="h-3 bg-notion-secondary rounded"></div>
            </div>
          </div>
        </NotionCard>
        <NotionCard>
          <div className="animate-pulse">
            <div className="h-4 bg-notion-secondary rounded mb-4"></div>
            <div className="space-y-3">
              <div className="h-3 bg-notion-secondary rounded"></div>
              <div className="h-3 bg-notion-secondary rounded"></div>
            </div>
          </div>
        </NotionCard>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <NotionCard>
        <h3 className="text-lg font-semibold mb-4 text-notion-text">Week over Week</h3>
        <ComparisonCard 
          current={data.weekOverWeek?.current}
          previous={data.weekOverWeek?.previous}
          type="week"
        />
      </NotionCard>
      
      <NotionCard>
        <h3 className="text-lg font-semibold mb-4 text-notion-text">Month over Month</h3>
        <ComparisonCard 
          current={data.monthOverMonth?.current}
          previous={data.monthOverMonth?.previous}
          type="month"
        />
      </NotionCard>
    </div>
  )
}

export default ComparisonDashboard