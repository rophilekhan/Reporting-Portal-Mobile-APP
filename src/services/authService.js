import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from './apiConfig'; 

export const loginUser = async (username, password) => {
  try {
    // ✅ API WALA KAAM COMMIT (COMMENTED)
    /*
    const response = await axios.post(`${API_BASE_URL}/login`, { username, password });
    if (response.data && response.data.success) {
       // ... handling logic
    }
    */

    // --- STATIC AUTH LOGIC START ---
    // Fake networking delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Demo Credentials Check
    if (username.toLowerCase() === 'admin' && password === '123456') {
      const mockResponse = {
        success: true,
        message: "Login Successful",
        user: {
          UserID: 1,
          UserName: "Admin User",
          userRole: "Administrator",
          CompanyBranchID: 1
        },
        menus: [
          { id: 1, title: 'Dashboard', icon: 'home' },
          { id: 2, title: 'Reports', icon: 'bar-chart' },
          { id: 3, title: 'Settings', icon: 'settings' }
        ]
      };

      const { user, menus } = mockResponse;

      // 2. Save Static Data to Storage
      await AsyncStorage.setItem('userInfo', JSON.stringify(user));
      await AsyncStorage.setItem('userMenus', JSON.stringify(menus));
      await AsyncStorage.setItem('companyBranchId', user.CompanyBranchID.toString());
      await AsyncStorage.setItem('userID', user.UserID.toString());
      await AsyncStorage.setItem('username', user.UserName); 

      return mockResponse;
    } else {
      throw new Error("Invalid username or password (Use admin / 123456)");
    }
    // --- STATIC AUTH LOGIC END ---

  } catch (error) {
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    // Clear Session Data
    await AsyncStorage.multiRemove(['userInfo', 'userMenus', 'companyBranchId', 'userID']);
    // 'username' & 'password' ko save rakhte hain Login pre-fill ke liye
    console.log("User logged out (Static Session Cleared)");
  } catch (e) {
    console.error(e);
  }
};