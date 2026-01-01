import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_BASE_URL } from './apiConfig';

export const fetchReport = async (endpoint, filters) => {
  // ... (Keep your existing fetchReport code exactly as is) ...
  // I am re-pasting fetchReport here for context, but you only need to CHANGE fetchSubGrid
  try {
    const storedBranchID = await AsyncStorage.getItem('companyBranchId');
    const branchID = storedBranchID || '1';
    const params = { companyBranchID: branchID };

    if (filters.fromDate) {
       const d = new Date(filters.fromDate);
       params.fromDate = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
    }
    if (filters.toDate) {
       const d = new Date(filters.toDate);
       params.toDate = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
    }
    if (filters.toDateOnly) {
       const d = new Date(filters.toDateOnly);
       params.toDate = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
    }

    Object.keys(filters).forEach(key => {
        if (key !== 'fromDate' && key !== 'toDate' && key !== 'toDateOnly' && key !== 'dateRange') {
            params[key] = filters[key];
        }
    });

    console.log(`[MAIN REPORT] Requesting: ${endpoint}`, params);
    const response = await axios.get(`${API_BASE_URL}${endpoint}`, { params });

    if (Array.isArray(response.data)) {
        return response.data;
    } else if (response.data && Array.isArray(response.data.Data)) {
        return response.data.Data;
    } else {
        console.warn("[API Warning] Unexpected response format:", response.data);
        return [];
    }
  } catch (error) {
    if (error.response) console.error(`[Server Error] ${endpoint}:`, error.response.status);
    throw error;
  }
};

// ✅ UPGRADED SUB-GRID FUNCTION
export const fetchSubGrid = async (endpoint, parentId, paramName = 'ID', filters = {}) => {
   try {
     const storedBranchID = await AsyncStorage.getItem('companyBranchId');
     const branchID = storedBranchID || '1';

     // 1. Initialize Params with ID and Branch
     const params = { 
        [paramName]: parentId,
        companyBranchID: branchID
     };

     // 2. Inject Dates from Filters (if they exist)
     if (filters.fromDate) {
        const d = new Date(filters.fromDate);
        params.fromDate = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
     }
     
     if (filters.toDate) {
        const d = new Date(filters.toDate);
        params.toDate = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
     }
     
     console.log(`[SUBGRID] Requesting: ${endpoint}`, params);
     
     const response = await axios.get(`${API_BASE_URL}${endpoint}`, { params });
     
     if (Array.isArray(response.data)) return response.data;
     if (response.data && Array.isArray(response.data.Data)) return response.data.Data;
     return [];

   } catch (error) {
     console.error("Subgrid Error:", error);
     return [];
   }
};