import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';

import { useReportLogic } from '../../hooks/useReportLogic';
import DataGrid from '../../components/organisms/DataGrid';
import BusinessDatePicker from '../../components/atoms/BusinessDatePicker';
import CustomDropdown from '../../components/atoms/CustomDropdown';
import { COLORS } from '../../config/theme';

const GenericReportScreen = ({ route, navigation }) => {
  const { name } = route;
  
  const { 
    data, 
    columns, 
    config, 
    filters, 
    isLoading, 
    updateFilter, 
    loadReportData 
  } = useReportLogic(name);

  const [isSidebarOpen, setSidebarOpen] = useState(true);

  // Handle Button Clicks
  const handleButtonClick = (action) => {
    if (action === 'show') {
      // 1. Show Data in Grid
      loadReportData();
      // Optional: Close sidebar on mobile after clicking show
      // setSidebarOpen(false); 
    } else if (action === 'print') {
      // 2. Handle Print Logic
      Alert.alert('Print', 'Print functionality coming soon (Linking to ReportViewer URL)');
      // Here you would use Linking.openURL(...) with the same params
    }
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.toggleDrawer()} style={{ marginRight: 15 }}>
            <Ionicons name="menu-outline" size={28} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{name}</Text>
        </View>
        <TouchableOpacity onPress={() => setSidebarOpen(!isSidebarOpen)}>
          <Ionicons name={isSidebarOpen ? "chevron-forward-outline" : "options-outline"} size={24} color="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.body}>
        {/* SIDEBAR FILTERS */}
        {isSidebarOpen && (
          <View style={styles.sidebar}>
            <ScrollView contentContainerStyle={{ padding: 15 }}>
              <Text style={styles.filterTitle}>Filters</Text>

              {config.filters.map((filter, index) => {
                // DATE FILTERS
                if (filter.key === 'dateRange') {
                  return (
                    <View key={`date-${index}`}>
                      <BusinessDatePicker
                        label="From Date"
                        date={filters.fromDate}
                        onDateChange={(d) => updateFilter('fromDate', d)}
                      />
                      <BusinessDatePicker
                        label="To Date"
                        date={filters.toDate}
                        onDateChange={(d) => updateFilter('toDate', d)}
                      />
                    </View>
                  );
                }

                // DATE (Single - for Balance Sheet)
                if (filter.key === 'toDateOnly') {
                  return (
                    <BusinessDatePicker
                      key={`date-single-${index}`}
                      label="As of Date"
                      date={filters.toDate}
                      onDateChange={(d) => updateFilter('toDate', d)}
                    />
                  );
                }

                // DROPDOWNS
                if (filter.type === 'dropdown') {
                  return (
                    <CustomDropdown
                      key={filter.key}
                      label={filter.label}
                      apiEndpoint={filter.api}
                      valueField={filter.valueField}
                      labelField={filter.labelField}
                      value={filters[filter.key]}
                      onChange={(val) => updateFilter(filter.key, val)}
                    />
                  );
                }

                // BUTTONS (Show / Print)
                if (filter.type === 'button') {
                  return (
                    <TouchableOpacity
                      key={`btn-${index}`}
                      style={[styles.actionBtn, { backgroundColor: filter.color || COLORS.secondary }]}
                      onPress={() => handleButtonClick(filter.action)}
                    >
                      <Ionicons name={filter.icon} size={18} color="white" style={{ marginRight: 8 }} />
                      <Text style={styles.btnText}>{filter.label}</Text>
                    </TouchableOpacity>
                  );
                }
              })}
            </ScrollView>
          </View>
        )}

        {/* MAIN GRID CONTENT */}
        <View style={styles.content}>
          {isLoading ? (
            <ActivityIndicator size="large" color={COLORS.secondary} style={{ marginTop: 50 }} />
          ) : data.length > 0 ? (
            <DataGrid data={data} columns={columns} />
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="bar-chart-outline" size={60} color="#DDD" />
              <Text style={styles.emptyText}>
                Select filters and click "Show" to view data.
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: {
    height: 60,
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    elevation: 4,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  headerTitle: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  body: { flex: 1, flexDirection: 'row' },
  sidebar: { width: 280, backgroundColor: 'white', borderRightWidth: 1, borderColor: '#DDD', elevation: 2 },
  content: { flex: 1, padding: 10 },
  filterTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.primary, marginBottom: 15 },
  actionBtn: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    elevation: 2,
  },
  btnText: { color: 'white', fontWeight: 'bold', fontSize: 14 },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: '#999', marginTop: 10, fontSize: 16 },
});

export default GenericReportScreen;