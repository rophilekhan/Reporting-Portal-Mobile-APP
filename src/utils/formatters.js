export const formatCurrency = (amount, currencySymbol = '$') => {
  if (amount === null || amount === undefined) return '-';
  const num = Number(amount);
  if (isNaN(num)) return amount;
  return `${currencySymbol} ${num.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`;
};

export const formatDate = (dateString) => {
  if (!dateString) return '-';
  // Handle /Date(123456)/ format from older .NET APIs
  if (typeof dateString === 'string' && dateString.includes('/Date(')) {
    const timestamp = parseInt(dateString.match(/\d+/)[0], 10);
    return new Date(timestamp).toLocaleDateString();
  }
  return new Date(dateString).toLocaleDateString(); // Standard YYYY-MM-DD
};

export const capitalize = (str) => {
  if (!str) return '';
  return str.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase()).trim();
};