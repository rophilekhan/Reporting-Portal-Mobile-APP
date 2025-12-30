import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_BASE_URL, ENDPOINTS } from '../services/apiConfig';

export const loginUser = async (username, password) => {
  try {
    const response = await axios.post(`${API_BASE_URL}${ENDPOINTS.LOGIN}`, {
      UserName: username,
      Password: password
    });

    if (response.data && response.data.success) {
      // 1. Save Full Response
      await AsyncStorage.setItem('fullAuthData', JSON.stringify(response.data));
      
      // 2. Extract Critical Info
      const user = response.data.user || {};
      await AsyncStorage.setItem('userId', user.UserID?.toString() || '');
      await AsyncStorage.setItem('userName', user.UserName || '');
      await AsyncStorage.setItem('companyBranchId', user.CompanyBranchID?.toString() || '1'); // Default to 1 if missing

      return response.data;
    } else {
      throw new Error(response.data.message || 'Login failed');
    }
  } catch (error) {
    console.error("Login Error:", error);
    throw error;
  }
};