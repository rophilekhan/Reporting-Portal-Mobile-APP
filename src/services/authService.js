import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from './apiConfig'; 

export const loginUser = async (username, password) => {
  try {
    // 1. API Call
    const response = await axios.post(`${API_BASE_URL}/login`, { username, password });
    
    // 2. Handle Success based on your JSON structure
    if (response.data && response.data.success) {
      const { user, menus } = response.data;

      // Save the WHOLE user object (UserID, UserName, userRole, CompanyBranchID)
      await AsyncStorage.setItem('userInfo', JSON.stringify(user));
      
      // Save Menus
      await AsyncStorage.setItem('userMenus', JSON.stringify(menus));

      // Save individual keys for easier access if needed
      await AsyncStorage.setItem('companyBranchId', user.CompanyBranchID.toString());
      await AsyncStorage.setItem('userID', user.UserID.toString());
      await AsyncStorage.setItem('username', user.UserName); // For Login Screen pre-fill

      return response.data;
    } else {
      throw new Error(response.data.message || "Login failed");
    }
  } catch (error) {
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    // Clear Session Data
    await AsyncStorage.multiRemove(['userInfo', 'userMenus', 'companyBranchId', 'userID']);
    // We keep 'username' & 'password' & 'rememberMe' for the Login screen logic
  } catch (e) {
    console.error(e);
  }
};