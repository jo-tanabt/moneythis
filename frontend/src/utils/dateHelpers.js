export const formatDate = (date) => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(new Date(date))
}

export const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(amount)
}

export const getTimeRangeOptions = () => [
  { value: 'past_week', label: 'Past Week' },
  { value: 'past_2_weeks', label: 'Past 2 Weeks' },
  { value: 'past_month', label: 'Past Month' },
  { value: 'past_3_months', label: 'Past 3 Months' },
  { value: 'past_6_months', label: 'Past 6 Months' },
  { value: 'past_year', label: 'Past Year' },
]