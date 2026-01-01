import { useState, useMemo } from 'react';
import { Alert } from 'react-native';
import { getReportConfig } from '../config/reportConfig';
import { getReportColumns } from '../config/columnConfig';
import { fetchReport } from '../services/reportService';

export const useReportLogic = (reportName) => {
  const config = getReportConfig(reportName);

  // 1. Handle Special Types
  const [activeType, setActiveType] = useState(
    config.isSpecial && config.specialTypes ? config.specialTypes[0] : null
  );

  // 2. Get Columns
  const columns = useMemo(() => {
    if (config.isSpecial && activeType) {
      return getReportColumns(reportName, activeType.label);
    }
    return getReportColumns(reportName);
  }, [reportName, config.isSpecial, activeType]);

  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState([]);

  // 3. Initialize Filters
  const [filters, setFilters] = useState(() => {
    const defaults = {
      fromDate: new Date(new Date().setMonth(new Date().getMonth() - 1)), 
      toDate: new Date(),
    };
    if (config.filters) {
      config.filters.forEach(f => {
        if (f.type === 'dropdown' || f.type === 'text') {
          defaults[f.key] = ''; 
        }
      });
    }
    return defaults;
  });

  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  // 4. Load Data (WITH VALIDATION)
  const loadReportData = async () => {
    
    // ✅ VALIDATION CHECK
    if (config.filters) {
      for (const filter of config.filters) {
        // If filter is marked 'required' AND the value is empty/null
        if (filter.required && (!filters[filter.key] || filters[filter.key] === '')) {
          Alert.alert('Missing Input', `Please select a ${filter.label} to proceed.`);
          return; // Stop execution
        }
      }
    }

    // Determine API
    const apiEndpoint = (config.isSpecial && activeType) ? activeType.api : config.api;

    if (!apiEndpoint) {
       Alert.alert('Configuration Error', `No API defined for ${reportName}`);
       return;
    }

    setIsLoading(true);
    try {
      const rawData = await fetchReport(apiEndpoint, filters);
      setData(rawData); 
    } catch (error) {
      console.error("Report Fetch Error:", error);
      setData([]);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    data, columns, config, filters, isLoading, 
    updateFilter, loadReportData, 
    activeType, setActiveType 
  };
};