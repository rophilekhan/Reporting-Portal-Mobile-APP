import { formatCurrency, formatDate } from './formatters';

// Transform raw API data into Display Data based on column config
export const processReportData = (rawData, columnConfig) => {
  if (!Array.isArray(rawData)) return [];

  return rawData.map((row) => {
    const processedRow = { ...row }; // Copy original data
    
    // Format specific fields if config dictates
    columnConfig.forEach((col) => {
      if (col.type === 'money') {
        processedRow[col.key] = formatCurrency(row[col.key]);
      } else if (col.type === 'date') {
        processedRow[col.key] = formatDate(row[col.key]);
      }
    });

    return processedRow;
  });
};