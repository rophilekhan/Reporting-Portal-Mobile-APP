
import { API_BASE_URL } from '../services/apiConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

export const fetchReport = async (endpoint, filters) => {
  try {
    // 1. Params object banayein
    const params = {};

    // 2. Date Formatting (Strictly YYYY-MM-DD match karne ke liye)
    if (filters.fromDate) {
       // Ensure it's a date object before calling methods
       const d = new Date(filters.fromDate);
       params.fromDate = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
    }
    
    if (filters.toDate) {
       const d = new Date(filters.toDate);
       params.toDate = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
    }

    // 3. Handle Balance Sheet single date
    if (filters.toDateOnly) {
       const d = new Date(filters.toDateOnly);
       params.toDate = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
    }

    // 4. Baki filters (Dropdowns etc) add karein
    Object.keys(filters).forEach(key => {
        if (key !== 'fromDate' && key !== 'toDate' && key !== 'toDateOnly' && key !== 'dateRange') {
            params[key] = filters[key];
        }
    });

    // DEBUG: Console mein check karein ke URL wahi ban raha hai jo aap chahte hain
    console.log(`REQUESTING: ${API_BASE_URL}${endpoint}`, params);

    const response = await axios.get(`${API_BASE_URL}${endpoint}`, { params });
    return response.data;

  } catch (error) {
    if (error.response) {
      console.error("Server Error 500:", error.response.data);
    } else {
      console.error("Network Error:", error.message);
    }
    throw error;
  }
};

export const fetchSubGrid = async (endpoint, parentId, paramName = 'ID') => {
   try {
     const params = { [paramName]: parentId };
     const response = await axios.get(`${API_BASE_URL}${endpoint}`, { params });
     return response.data;
   } catch (error) {
     return [];
   }
};