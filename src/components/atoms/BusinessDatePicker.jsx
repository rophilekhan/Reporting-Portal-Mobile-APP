import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import DatePicker from 'react-native-date-picker';
import Ionicons from '@react-native-vector-icons/ionicons';
import { COLORS } from '../../config/theme';

const BusinessDatePicker = ({ label, date, onDateChange }) => {
  const [open, setOpen] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity style={styles.input} onPress={() => setOpen(true)}>
        <Text style={styles.dateText}>
          {date ? date.toDateString() : 'Select Date'}
        </Text>
        {/* Using Primary color for the icon to match your theme */}
        <Ionicons name="calendar-outline" size={20} color={COLORS.secondary} />
      </TouchableOpacity>
      
      <DatePicker
        modal
        open={open}
        date={date || new Date()}
        mode="date"
        // --- Theme based selection design ---
        title={`Select ${label}`}
        confirmText="Confirm"
        cancelText="Cancel"
        buttonColor={COLORS.secondary} // Matches the Confirm button to your primary theme color
        theme="light" // Ensures the picker background is white for better readability
        onConfirm={(selectedDate) => {
          setOpen(false);
          onDateChange(selectedDate);
        }}
        onCancel={() => setOpen(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: 15 },
  label: { fontSize: 12, color: '#666', marginBottom: 5, fontWeight: '600' },
  input: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#FFF'
  },
  dateText: { color: '#333' }
});

export default BusinessDatePicker;