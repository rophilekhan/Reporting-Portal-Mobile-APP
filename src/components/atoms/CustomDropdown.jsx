import React, { useState, useEffect, useCallback, memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../../services/apiConfig';
import { COLORS } from '../../config/theme';

const CustomDropdown = ({ 
  label, 
  apiEndpoint, 
  value, 
  onChange, 
  valueField = 'ID', 
  labelField = 'Name' 
}) => {
  const [data, setData] = useState([]);
  const [isFocus, setIsFocus] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      if (!apiEndpoint) return;

      try {
        // ✅ API WALA KAAM COMMIT (COMMENTED)
        /*
        const storedBranchID = await AsyncStorage.getItem('companyBranchId');
        const branchID = storedBranchID || '1';
        const payload = { companyBranchID: branchID };
        const response = await axios.post(`${API_BASE_URL}${apiEndpoint}`, payload);
        */

        // --- STATIC MOCK LOGIC START ---
        // Fake delay for dropdown loading feel
        await new Promise(resolve => setTimeout(resolve, 300));

        let staticData = [];
        
        // Label ke hisab se relevant static options
        if (label.toLowerCase().includes('account')) {
          staticData = [
            { ID: '1001', Name: 'Cash Account' },
            { ID: '1002', Name: 'Bank Alfalah' },
            { ID: '1003', Name: 'Petty Cash' },
          ];
        } else if (label.toLowerCase().includes('supplier')) {
          staticData = [
            { ID: '1', Name: 'Global Logistics' },
            { ID: '2', Name: 'Vertex Solutions' },
            { ID: '3', Name: 'Prime Traders' },
          ];
        } else if (label.toLowerCase().includes('customer')) {
          staticData = [
            { ID: '101', Name: 'Walk-in Customer' },
            { ID: '102', Name: 'Alpha Corporation' },
            { ID: '103', Name: 'Zeta Industries' },
          ];
        } else if (label.toLowerCase().includes('product')) {
          staticData = [
            { ID: 'P1', Name: 'Cement Bag 50kg' },
            { ID: 'P2', Name: 'Steel Rod 12mm' },
            { ID: 'P3', Name: 'Bricks (Red)' },
          ];
        } else {
          // Generic options for other dropdowns
          staticData = [
            { ID: '1', Name: `Mock ${label} 1` },
            { ID: '2', Name: `Mock ${label} 2` },
          ];
        }

        if (isMounted) {
          setData(staticData);

          // ✅ AUTO-SELECT LOGIC (Same as original)
          if (staticData.length > 0) {
             const firstItemValue = staticData[0][valueField];
             if (value === undefined || value === null || value === '') {
                 onChange(firstItemValue);
             }
          }
        }
        // --- STATIC MOCK LOGIC END ---

      } catch (err) {
        console.error(`[Dropdown Error] ${label}:`, err.message);
      }
    };

    fetchData();

    return () => { isMounted = false; };
  }, [apiEndpoint, label]); 

  const handleDropdownChange = useCallback((item) => {
    onChange(item[valueField]);
    setIsFocus(false);
  }, [onChange, valueField]);

  return (
    <View style={styles.container}>
      <Dropdown
        style={[styles.dropdown, isFocus && { borderColor: COLORS.secondary }]}
        placeholderStyle={styles.placeholderStyle}
        selectedTextStyle={styles.selectedTextStyle}
        inputSearchStyle={styles.inputSearchStyle}
        data={data}
        search
        maxHeight={300}
        labelField={labelField}
        valueField={valueField}
        placeholder={!isFocus ? `Select ${label}` : '...'}
        searchPlaceholder="Search..."
        value={value}
        onFocus={() => setIsFocus(true)}
        onBlur={() => setIsFocus(false)}
        onChange={handleDropdownChange}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: 15 },
  dropdown: {
    height: 50,
    borderColor: '#DDD',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#FFF'
  },
  placeholderStyle: { fontSize: 14, color: '#999' },
  selectedTextStyle: { fontSize: 14, color: '#333' },
  inputSearchStyle: { height: 40, fontSize: 14 },
});

export default memo(CustomDropdown);