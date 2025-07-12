const calculateDateRange = (timeRange, startDate, endDate) => {
  const now = new Date();
  
  if (startDate && endDate) {
    return {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  switch (timeRange) {
    case 'past_week':
      return {
        $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      };
    
    case 'past_2_weeks':
      return {
        $gte: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)
      };
    
    case 'past_month':
      return {
        $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      };
    
    case 'past_3_months':
      return {
        $gte: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
      };
    
    case 'past_6_months':
      return {
        $gte: new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000)
      };
    
    case 'past_year':
      return {
        $gte: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
      };
    
    case 'this_week':
      const thisWeekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
      return {
        $gte: thisWeekStart
      };
    
    case 'this_month':
      const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      return {
        $gte: thisMonthStart
      };
    
    case 'this_year':
      const thisYearStart = new Date(now.getFullYear(), 0, 1);
      return {
        $gte: thisYearStart
      };
    
    default:
      // Default to past month
      return {
        $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      };
  }
};

const formatDateRange = (timeRange) => {
  const now = new Date();
  
  switch (timeRange) {
    case 'past_week':
      return 'Past 7 days';
    case 'past_2_weeks':
      return 'Past 2 weeks';
    case 'past_month':
      return 'Past 30 days';
    case 'past_3_months':
      return 'Past 3 months';
    case 'past_6_months':
      return 'Past 6 months';
    case 'past_year':
      return 'Past year';
    case 'this_week':
      return 'This week';
    case 'this_month':
      return 'This month';
    case 'this_year':
      return 'This year';
    default:
      return 'Past 30 days';
  }
};

const getWeekStartEnd = (date = new Date()) => {
  const start = new Date(date);
  start.setDate(date.getDate() - date.getDay());
  start.setHours(0, 0, 0, 0);
  
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  
  return { start, end };
};

const getMonthStartEnd = (date = new Date()) => {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  end.setHours(23, 59, 59, 999);
  
  return { start, end };
};

module.exports = {
  calculateDateRange,
  formatDateRange,
  getWeekStartEnd,
  getMonthStartEnd
};