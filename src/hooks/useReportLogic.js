import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { getReportConfig } from '../config/reportConfig';
import { getReportColumns } from '../config/columnConfig';
import { fetchReport } from '../services/reportService';
import { processReportData } from '../utils/dataHandler'; // Assuming you have this

export const useReportLogic = (reportName) => {
  const config = getReportConfig(reportName);
  const columns = getReportColumns(reportName);

  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState([]);
  
  // --- UPDATED DATE LOGIC HERE ---
  const [filters, setFilters] = useState({
    // Initialize fromDate to 1 month ago
    fromDate: new Date(new Date().setMonth(new Date().getMonth() - 1)), 
    // Initialize toDate to Today
    toDate: new Date(), 
  });
  // -------------------------------

  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const loadReportData = async () => {
    // ... existing logic ...
    if (!config.api) {
       // Only alert if it's not a special report (like Income Statement which opens a popup)
       if(!config.isSpecial) Alert.alert('Configuration Missing', `No API defined for ${reportName}`);
       return;
    }

    setIsLoading(true);
    try {
      // Use the service to fetch data
      const rawData = await fetchReport(config.api, filters);
      
     // --- ADD THIS DEBUGGING BLOCK ---
  console.log("========================================");
  console.log("REPORT: ", reportName);
  console.log("DATA COUNT: ", rawData.length);
  if (rawData.length > 0) {
    console.log("FIRST ROW KEYS:", Object.keys(rawData[0])); // Shows the column names
    console.log("FIRST ROW DATA:", rawData[0]); // Shows the actual data
  }
  // ========================================
      setData(rawData); 
    } catch (error) {
      console.error("Report Fetch Error:", error);
      // Optional: don't alert on empty 404s if API behaves that way
      setData([]);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    data,
    columns,
    config,
    filters,
    isLoading,
    updateFilter,
    loadReportData
  };
};