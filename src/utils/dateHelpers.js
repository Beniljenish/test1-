// Date utility functions

export const formatDate = (date) => {
  if (!date) return '';

  const options = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };

  return new Date(date).toLocaleDateString('en-US', options);
};

export const formatTime = (date) => {
  if (!date) return '';

  const options = {
    hour: '2-digit',
    minute: '2-digit'
  };

  return new Date(date).toLocaleTimeString('en-US', options);
};

export const isToday = (date) => {
  const today = new Date();
  const compareDate = new Date(date);

  return today.toDateString() === compareDate.toDateString();
};

export const isTomorrow = (date) => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const compareDate = new Date(date);

  return tomorrow.toDateString() === compareDate.toDateString();
};

export const getDaysInMonth = (year, month) => {
  return new Date(year, month + 1, 0).getDate();
};

export const getFirstDayOfMonth = (year, month) => {
  return new Date(year, month, 1).getDay();
};

export const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const addMonths = (date, months) => {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
};