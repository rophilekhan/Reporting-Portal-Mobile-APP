import React, { useState, useRef, useEffect } from 'react';
import { 
  View, Text, TouchableOpacity, ScrollView, ActivityIndicator, 
  StyleSheet, Alert, StatusBar, Linking, 
  Animated, Easing, Platform, useWindowDimensions 
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DrawerActions } from '@react-navigation/native'; 

import { useReportLogic } from '../../hooks/useReportLogic';
import DataGrid from '../../components/organisms/DataGrid';
import BusinessDatePicker from '../../components/atoms/BusinessDatePicker';
import CustomDropdown from '../../components/atoms/CustomDropdown';
import { COLORS } from '../../config/theme';

const BASE_URL = "https://erp.hassoftsolutions.com/";

const GenericReportScreen = ({ route, navigation }) => {
  const { name } = route;
  const insets = useSafeAreaInsets();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  
  const isLandscape = screenWidth > screenHeight;
  const isTablet = screenWidth >= 768;
  const isSmallScreen = screenWidth < 360;
  
  const SIDEBAR_MAX_WIDTH = isTablet 
    ? (isLandscape ? 280 : 320) 
    : (isLandscape ? 240 : screenWidth * 0.50);

  const { 
    data, columns, config, filters, isLoading, 
    updateFilter, loadReportData, activeType, setActiveType 
  } = useReportLogic(name);

  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const slideAnim = useRef(new Animated.Value(1)).current;

  const ICONS = {
    date: "calendar-outline",
    dropdown: "list-outline",
    filter: "filter-outline",
    options: "options-outline",
    menu: "menu-outline",
    arrow: "chevron-back-outline"
  };

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: isSidebarOpen ? 1 : 0,
      duration: 250,
      useNativeDriver: false,
      easing: Easing.out(Easing.quad),
    }).start();
  }, [isSidebarOpen]);

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

  const animatedWidth = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, SIDEBAR_MAX_WIDTH],
  });

  const contentOpacity = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.5],
  });

  const openMenu = () => navigation.dispatch(DrawerActions.openDrawer());

  // --- STATIC ACTION HANDLER ---
  const handleButtonClick = async (action) => {
    if (action === 'show') {
      if (isSidebarOpen) {
        setSidebarOpen(false);
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      // loadReportData call hogi, useReportLogic hook static data return karega
      loadReportData(); 
    } 
    else if (action === 'print') {
      // Print functionality ko filhal demo alert par rakh diya hai
      Alert.alert("Print Demo", `${name} report printing is simulated in static mode.`);
      
      /* // API WALA KAAM COMMIT
      const { reportName } = config.sidebarPrintConfig;
      // ... baki logic
      Linking.openURL(url);
      */
    }
  };

  const handleRowPrint = async (item) => {
    Alert.alert("Row Print", `Printing details for ID: ${item[config.pk || 'ID']} (Static Mode)`);
    
    /* // API WALA KAAM COMMIT
    const { reportName, idParam, pk } = config.rowPrintConfig;
    // ... logic
    Linking.openURL(url);
    */
  };

  const iconSize = isTablet ? 30 : 26;

  return (
    <SafeAreaView style={styles.rootContainer} edges={['left' ,'right']}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      
      <View style={[styles.header, { paddingTop: Platform.OS === 'ios' ? insets.top : 22 }]}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={openMenu} style={styles.menuButton}>
            <Ionicons name={ICONS.menu} size={iconSize} color="white" />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { fontSize: isTablet ? 19 : 16 }]} numberOfLines={2}>
            {name}
          </Text>
        </View>

        <TouchableOpacity onPress={toggleSidebar} style={styles.optionButton}>
          <Ionicons 
            name={isSidebarOpen ? ICONS.arrow : ICONS.options} 
            size={iconSize - 2} 
            color="white" 
          />
        </TouchableOpacity>
      </View>

      <View style={styles.body}>
        <Animated.View style={[styles.sidebar, { width: animatedWidth }]}>
          <View style={{ width: SIDEBAR_MAX_WIDTH }}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.sidebarContent}>
              
              {config?.isSpecial && config?.specialTypes && (
                <View style={styles.tabContainer}>
                  {config.specialTypes.map((type) => (
                    <TouchableOpacity 
                      key={type.label}
                      style={[styles.tabButton, activeType?.label === type.label && styles.tabButtonActive]}
                      onPress={() => setActiveType(type)}
                    >
                      <Text style={[styles.tabText, activeType?.label === type.label && styles.tabTextActive]} numberOfLines={1}>
                        {type.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              <Text style={styles.filterTitle}>FILTERS</Text>

              {config?.filters?.map((filter, index) => {
                if (filter.key === 'dateRange') {
                  return (
                    <View key={`date-${index}`} style={styles.filterGap}>
                      <View style={styles.labelWithIcon}>
                        <Ionicons name={ICONS.date} size={16} color={COLORS.primary} style={{ marginRight: 5 }} />
                        <Text style={styles.filterLabel}>Select Range</Text>
                      </View>
                      <BusinessDatePicker label="From Date" date={filters.fromDate} onDateChange={(d) => updateFilter('fromDate', d)} />
                      <View style={{ height: 10 }} />
                      <BusinessDatePicker label="To Date" date={filters.toDate} onDateChange={(d) => updateFilter('toDate', d)} />
                    </View>
                  );
                }
                
                if (filter.key === 'toDateOnly') {
                  return (
                    <View key={`date-single-${index}`} style={styles.filterGap}>
                      <View style={styles.labelWithIcon}>
                        <Ionicons name={ICONS.date} size={16} color={COLORS.primary} style={{ marginRight: 5 }} />
                        <Text style={styles.filterLabel}>As of Date</Text>
                      </View>
                      <BusinessDatePicker label="As of Date" date={filters.toDate} onDateChange={(d) => updateFilter('toDate', d)} />
                    </View>
                  );
                }

                if (filter.type === 'dropdown') {
                  return (
                    <View key={filter.key} style={styles.filterGap}>
                      <View style={styles.labelWithIcon}>
                        <Ionicons name={ICONS.dropdown} size={16} color={COLORS.primary} style={{ marginRight: 5 }} />
                        <Text style={styles.filterLabel}>{filter.label}</Text>
                      </View>
                      {/* Note: CustomDropdown should also handle static data inside it */}
                      <CustomDropdown 
                        label={filter.label} 
                        apiEndpoint={filter.api} 
                        valueField={filter.valueField} 
                        labelField={filter.labelField} 
                        value={filters[filter.key]} 
                        onChange={(val) => updateFilter(filter.key, val)} 
                      />
                    </View>
                  );
                }

                if (filter.type === 'button') {
                  return (
                    <TouchableOpacity 
                      key={`btn-${index}`} 
                      style={[styles.actionBtn, { backgroundColor: filter.color || COLORS.secondary }]} 
                      onPress={() => handleButtonClick(filter.action)}
                    >
                      <Ionicons name={filter.action === 'show' ? 'search-outline' : 'print-outline'} size={18} color="white" style={{ marginRight: 8 }} />
                      <Text style={styles.btnText}>{filter.label}</Text>
                    </TouchableOpacity>
                  );
                }
                return null;
              })}
            </ScrollView>
          </View>
        </Animated.View>

        <Animated.View style={[styles.content, { opacity: isTablet ? 1 : contentOpacity }]}>
          {isLoading ? (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={COLORS.secondary} />
                <Text style={styles.loadingText}>Loading static data...</Text>
            </View>
          ) : data.length > 0 ? (
            <DataGrid 
              data={data} 
              columns={columns} 
              isGrouped={config.isGrouped} 
              groupBy={config.groupBy}
              hasSubGrid={config.hasSubGrid || !!activeType?.subApi}
              subApi={activeType?.subApi || config.subApi}
              subGridKey={config.subGridKey || `${name}_Sub`}
              pk={activeType?.pk || config.pk || 'ID'} 
              filters={filters} 
              onPrintRow={handleRowPrint}
            />
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="bar-chart-outline" size={50} color="#DDD" />
              <Text style={styles.emptyText}>Apply filters to view the report.</Text>
            </View>
          )}
        </Animated.View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  rootContainer: { flex: 1, backgroundColor: '#F4F7FE' },
  header: { backgroundColor: COLORS.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 8, borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  menuButton: { padding: 8 , marginTop:10},
  headerTitle: { color: 'white', fontSize: 20, fontWeight: 'bold', marginLeft: 8 , marginTop:10, flex: 1 },
  body: { flex: 1, flexDirection: 'row' },
  sidebar: { backgroundColor: 'white', borderRightWidth: 1, borderColor: '#EEE', overflow: 'hidden' },
  sidebarContent: { padding: 12, paddingBottom: 40 },
  content: { flex: 1, backgroundColor: '#FFF' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, color: '#666', fontWeight: '500' },
  filterTitle: { fontWeight: 'bold', color: COLORS.primary, marginBottom: 12, fontSize: 13, textTransform: 'uppercase' },
  filterGap: { marginBottom: 15 },
  labelWithIcon: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  filterLabel: { fontWeight: 'bold', color: '#555', fontSize: 12 },
  tabContainer: { flexDirection: 'row', marginBottom: 20, backgroundColor: '#F5F5F5', borderRadius: 8, padding: 3 },
  tabButton: { flex: 1, alignItems: 'center', borderRadius: 6, paddingVertical: 8 },
  tabButtonActive: { backgroundColor: 'white', elevation: 2 },
  tabText: { color: '#888', fontWeight: '600', fontSize: 11 },
  tabTextActive: { color: COLORS.primary, fontWeight: 'bold' },
  actionBtn: { flexDirection: 'row', borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginTop: 10, paddingVertical: 12 },
  btnText: { color: 'white', fontWeight: 'bold', fontSize: 14 },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  emptyText: { color: '#AAA', textAlign: 'center', marginTop: 15 },
  optionButton: { padding: 8, marginTop: 10 , marginLeft:-30}
});

export default GenericReportScreen;