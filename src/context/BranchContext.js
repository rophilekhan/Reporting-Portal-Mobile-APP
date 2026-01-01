import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const BranchContext = createContext();

export const BranchProvider = ({ children }) => {
  // Global state
  const [companyBranchId, setCompanyBranchId] = useState(null);
  const [branchName, setBranchName] = useState('Select Branch');
  const [isBranchLoading, setIsBranchLoading] = useState(true); // Added loading state

  // Function to load branch info (Reusable)
  const loadBranchFromStorage = async () => {
    setIsBranchLoading(true);
    try {
      const jsonValue = await AsyncStorage.getItem('userInfo');
      if (jsonValue != null) {
        const user = JSON.parse(jsonValue);
        
        // 1. Check if we have a manually selected branch override
        const storedBranchID = await AsyncStorage.getItem('selectedBranchID');
        
        if (storedBranchID) {
           setCompanyBranchId(parseInt(storedBranchID));
           // Try to get name if stored, otherwise default
           const storedName = await AsyncStorage.getItem('selectedBranchName');
           if(storedName) setBranchName(storedName);
        } 
        // 2. Fallback to User's default branch from Login
        else if (user.CompanyBranchID) {
          setCompanyBranchId(user.CompanyBranchID);
        }
      }
    } catch (e) {
      console.error("Failed to load branch info", e);
    } finally {
      setIsBranchLoading(false);
    }
  };

  // Load on mount
  useEffect(() => {
    loadBranchFromStorage();
  }, []);

  // Update function
  const updateBranch = async (id, name) => {
    setCompanyBranchId(id);
    setBranchName(name);
    try {
      await AsyncStorage.setItem('selectedBranchID', id.toString());
      await AsyncStorage.setItem('selectedBranchName', name || '');
    } catch(e) { console.error(e); }
  };

  return (
    <BranchContext.Provider value={{ 
        companyBranchId, 
        branchName, 
        updateBranch, 
        loadBranchFromStorage, // Expose this function
        isBranchLoading 
    }}>
      {children}
    </BranchContext.Provider>
  );
};