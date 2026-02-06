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
      <TouchableOpacity 
        style={styles.input} 
        onPress={() => setOpen(true)}
        activeOpacity={0.7}
      >
        <Text style={styles.dateText}>
          {date
            ? date.toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })
            : 'Select Date'}
        </Text>
        {/* Secondary color icon matches your 'Reporting Portal' theme */}
        <Ionicons name="calendar-outline" size={18} color={COLORS.secondary} />
      </TouchableOpacity>
      
      <DatePicker
        modal
        open={open}
        date={date || new Date()}
        mode="date"
        // --- Static Portal Theme Design ---
        title={`Select ${label}`}
        confirmText="Confirm"
        cancelText="Cancel"
        buttonColor={COLORS.secondary}
        dividerColor={COLORS.primary}
        theme="light" 
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
  container: { 
    marginBottom: 15,
    flex: 1 // Added flex for side-by-side date pickers in dashboard
  },
  label: { 
    fontSize: 11, 
    color: '#888', 
    marginBottom: 6, 
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  input: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: '#FFF',
    // Subtle shadow for modern look
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  dateText: { 
    color: '#333',
    fontSize: 14,
    fontWeight: '500'
  }
});

export default BusinessDatePicker;