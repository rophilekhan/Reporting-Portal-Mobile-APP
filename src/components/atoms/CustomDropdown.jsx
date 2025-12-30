import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import axios from 'axios';
import { API_BASE_URL } from '../../services/apiConfig';

const CustomDropdown = ({ 
  label, 
  apiEndpoint, 
  value, 
  onChange, 
  valueField = 'ID', // Default defaults
  labelField = 'Name' 
}) => {
  const [data, setData] = useState([]);
  const [isFocus, setIsFocus] = useState(false);

  useEffect(() => {
    if (apiEndpoint) {
      axios.get(`${API_BASE_URL}${apiEndpoint}`)
        .then(response => {
          // Ensure data is array
          const rawData = Array.isArray(response.data) ? response.data : [];
          setData(rawData);
        })
        .catch(err => console.error(`Dropdown Error (${label}):`, err));
    }
  }, [apiEndpoint]);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <Dropdown
        style={[styles.dropdown, isFocus && { borderColor: '#009BA9' }]}
        placeholderStyle={styles.placeholderStyle}
        selectedTextStyle={styles.selectedTextStyle}
        inputSearchStyle={styles.inputSearchStyle}
        data={data}
        search
        maxHeight={300}
        labelField={labelField} // Dynamic Label (e.g., AccountTitle)
        valueField={valueField} // Dynamic Value (e.g., AccountCode)
        placeholder={!isFocus ? `Select ${label}` : '...'}
        searchPlaceholder="Search..."
        value={value}
        onFocus={() => setIsFocus(true)}
        onBlur={() => setIsFocus(false)}
        onChange={item => {
          onChange(item[valueField]);
          setIsFocus(false);
        }}
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

export default CustomDropdown;