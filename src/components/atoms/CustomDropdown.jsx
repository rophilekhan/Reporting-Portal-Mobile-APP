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

  // 1. Optimize: Memoize the fetch logic to prevent stale closures and reduce overhead
  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      if (!apiEndpoint) return;

      try {
        const storedBranchID = await AsyncStorage.getItem('companyBranchId');
        const branchID = storedBranchID || '1';

        const payload = {
          companyBranchID: branchID
        };

        // console.log(`[Dropdown POST] ${label}: ...`); // Commented out for performance

        const response = await axios.post(`${API_BASE_URL}${apiEndpoint}`, payload);

        if (isMounted) {
          const rawData = Array.isArray(response.data) 
            ? response.data 
            : (response.data.Data || []);
            
          setData(rawData);

          // ✅ AUTO-SELECT LOGIC (Unchanged)
          if (rawData.length > 0) {
             const firstItemValue = rawData[0][valueField];
             
             if (value === undefined || value === null || value === '') {
                 onChange(firstItemValue);
             }
          }
        }
      } catch (err) {
        console.error(`[Dropdown Error] ${label}:`, err.message);
      }
    };

    fetchData();

    return () => { isMounted = false; };
  }, [apiEndpoint]); // Keep dependencies minimal

  // 2. Optimize: Prevent new function creation on every render
  const handleDropdownChange = useCallback((item) => {
    onChange(item[valueField]);
    setIsFocus(false);
  }, [onChange, valueField]);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
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
        onChange={handleDropdownChange} // Use memoized handler
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: 15 },
  label: { fontSize: 12, color: '#666', marginBottom: 5, fontWeight: '600' },
  dropdown: {
    height: 50,
    borderColor: '#DDD',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    backgroundColor: '#FFF'
  },
  placeholderStyle: { fontSize: 14, color: '#999' },
  selectedTextStyle: { fontSize: 14, color: '#333' },
  inputSearchStyle: { height: 40, fontSize: 14 },
});

// 3. Optimize: Prevent re-renders if props haven't changed
export default memo(CustomDropdown);