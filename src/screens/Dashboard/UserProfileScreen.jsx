import React, { useEffect, useState, useContext } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, 
  StatusBar, Modal, FlatList, Platform, useWindowDimensions 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from '@react-native-vector-icons/ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { COLORS } from '../../config/theme';
import { logoutUser } from '../../services/authService';
import { BranchContext } from '../../context/BranchContext';

const InfoRow = ({ icon, label, value, isSmallScreen }) => (
  <View style={styles.infoRow}>
    <View style={styles.iconBox}>
      <Ionicons name={icon} size={isSmallScreen ? 18 : 22} color={COLORS.primary} />
    </View>
    <View style={styles.infoTextContainer}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue} numberOfLines={1}>{value || 'N/A'}</Text>
    </View>
  </View>
);

const UserProfileScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const { companyBranchId, branchName, updateBranch, loadBranchFromStorage } = useContext(BranchContext);
  
  const isLandscape = width > height;
  const isTablet = width > 768;
  const isSmallScreen = width < 360;

  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [branches, setBranches] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [loadingBranches, setLoadingBranches] = useState(false);
const currentYear = new Date().getFullYear();
  useEffect(() => {
    loadBranchFromStorage();
    const loadUserAndBranches = async () => {
      try {
        const jsonValue = await AsyncStorage.getItem('userInfo');
        const user = jsonValue != null ? JSON.parse(jsonValue) : null;
        setUserData(user);
        // Corrected property access to match typical API casing (UserID)
        if (user?.UserID) fetchBranches(user.UserID, user.CompanyBranchID);
      } catch (e) {
        console.error("Storage Error:", e);
      } finally {
        setLoading(false);
      }
    };
    loadUserAndBranches();
  }, []);

  const fetchBranches = async (userId, userDefaultBranchId) => {
    setLoadingBranches(true);
    const url = `https://erp.hassoftsolutions.com/MobileReportsAPI/GetCompanyBranches?userID=${userId}`;
    try {
      const response = await fetch(url);
      const data = await response.json(); // Cleaned up JSON parsing
      if (Array.isArray(data)) {
        setBranches(data);
        const targetId = companyBranchId || userDefaultBranchId;
        if (targetId) {
          const current = data.find(b => b.ID === targetId);
          if (current && (branchName === 'Select Branch' || !branchName)) {
            updateBranch(current.ID, current.Name);
          }
        }
      }
    } catch (error) {
      console.error("Fetch Error:", error);
    } finally {
      setLoadingBranches(false);
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    navigation.replace('Login');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const cardWidth = isTablet ? 550 : isLandscape ? '80%' : '92%';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <ScrollView 
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }} 
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <LinearGradient
          colors={['#003892', '#0055c8', '#e98a57']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={[styles.header, { paddingTop: insets.top + 20, height: isLandscape ? 130 : 180 }]} 
        >
          <Text style={styles.headerTitle}>My Profile</Text>
        </LinearGradient>

        {/* Fixed property: user?.UserName instead of userName */}
        <View style={[styles.profileCard, { width: cardWidth, marginTop: isLandscape ? -30 : -50 }]}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {userData?.UserName ? userData.UserName.charAt(0).toUpperCase() : 'U'}
            </Text>
          </View>
          <Text style={styles.userName}>{userData?.UserName || 'Guest User'}</Text>
          <Text style={styles.userRole}>{userData?.userRole || 'Administrator'}</Text>
          <View style={styles.statusBadge}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Active</Text>
          </View>
        </View>

        <View style={[styles.scrollContent, { width: cardWidth, alignSelf: 'center' }]}>
          
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Company Branch</Text>
            <TouchableOpacity 
              style={styles.dropdownButton} 
              onPress={() => setModalVisible(true)}
            >
              <View style={styles.dropdownInner}>
                <View style={[styles.iconBox, { backgroundColor: '#E3F2FD' }]}>
                  <Ionicons name="business" size={20} color="#1565C0" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.dropdownLabel}>Selected Branch</Text>
                  <Text style={styles.dropdownValue} numberOfLines={1}>
                    {branches.find(b => b.ID === companyBranchId)?.Name || branchName || "Select Branch"}
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>
            <Text style={styles.helperText}>* Updating branch syncs data app-wide.</Text>
          </View>

          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Account Details</Text>
            {/* Fixed property: userData?.UserName */}
            {/* <InfoRow icon="person-outline" label="Full Name" value={userData?.UserName} isSmallScreen={isSmallScreen} /> */}
            <View style={styles.divider} />
            <InfoRow icon="key-outline" label="Current Company Branch ID" value={companyBranchId?.toString()} isSmallScreen={isSmallScreen} />
            <View style={styles.divider} />
            <InfoRow icon="shield-checkmark-outline" label="Access Level" value={userData?.userRole} isSmallScreen={isSmallScreen} />
          </View>

          {/* <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Application Info</Text>
            <InfoRow icon="layers-outline" label="Version" value="1.0.0 (Beta)" isSmallScreen={isSmallScreen} />
            <View style={styles.divider} />
            <InfoRow icon="server-outline" label="Environment" value="Production" isSmallScreen={isSmallScreen} />
          </View> */}
 <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Application Info</Text>
            <InfoRow icon="layers-outline" label="Version" value="1.0.0 (Beta)" />
            <View style={styles.divider} />
            <InfoRow icon="server-outline" label="Server Environment" value="Production" />
            <View style={styles.divider} />
            <InfoRow icon="calendar-outline" label="Last Updated" value="Jan 2026" />
          </View>

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color="#D32F2F" style={{ marginRight: 10 }} />
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>

          <Text style={styles.footerText}>Xinacle ERP © {currentYear}</Text>
        </View>
      </ScrollView>

      <Modal animationType="slide" transparent visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { width: isTablet ? 500 : '100%', paddingBottom: insets.bottom + 20 }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Branch</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                <Ionicons name="close" size={26} color="#333" />
              </TouchableOpacity>
            </View>

            {loadingBranches ? (
              <ActivityIndicator size="large" color={COLORS.primary} style={{ margin: 30 }} />
            ) : (
              <FlatList
                data={branches}
                keyExtractor={(item) => item.ID.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    style={[styles.branchItem, item.ID === companyBranchId && styles.selectedBranchItem]}
                    onPress={() => {
                      updateBranch(item.ID, item.Name);
                      setModalVisible(false);
                    }}
                  >
                    <Text style={[styles.branchText, item.ID === companyBranchId && styles.selectedBranchText]}>
                      {item.Name}
                    </Text>
                    {item.ID === companyBranchId && <Ionicons name="checkmark-circle" size={22} color={COLORS.secondary} />}
                  </TouchableOpacity>
                )}
                style={{ maxHeight: height * 0.6 }}
                ListEmptyComponent={<Text style={styles.emptyListText}>No branches available.</Text>}
              />
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    paddingHorizontal: 25,
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
    alignItems: 'center',
    width: '100%',
  },
  headerTitle: { color: 'white', fontSize: 24, fontWeight: 'bold' },
  profileCard: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: 'white',
    borderRadius: 20,
    paddingVertical: 25,
    paddingHorizontal: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  avatarContainer: {
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: '#F0F4FF', justifyContent: 'center', alignItems: 'center',
    marginBottom: 15, borderWidth: 3, borderColor: '#e98a57',
  },
  avatarText: { fontSize: 38, fontWeight: 'bold', color: COLORS.primary },
  userName: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 5 },
  userRole: { fontSize: 13, color: '#666', marginBottom: 15, textTransform: 'uppercase', letterSpacing: 1 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E8F5E9', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20 },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#4CAF50', marginRight: 8 },
  statusText: { color: '#4CAF50', fontSize: 12, fontWeight: 'bold' },
  scrollContent: { marginTop: 20, paddingHorizontal: 15 },
  sectionCard: {
    backgroundColor: 'white', borderRadius: 18, padding: 18, marginBottom: 15,
    elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5,
  },
  sectionTitle: { fontSize: 15, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 15 },
  infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  iconBox: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: '#F5F7FA', justifyContent: 'center', alignItems: 'center', marginRight: 15,
  },
  infoTextContainer: { flex: 1 },
  infoLabel: { fontSize: 11, color: '#999', marginBottom: 2, textTransform: 'uppercase' },
  infoValue: { fontSize: 15, color: '#333', fontWeight: '600' },
  divider: { height: 1, backgroundColor: '#F0F0F0', marginVertical: 5, marginLeft: 55 },
  dropdownButton: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#F8F9FA', padding: 12, borderRadius: 14,
    borderWidth: 1, borderColor: '#EEE'
  },
  dropdownInner: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  dropdownLabel: { fontSize: 11, color: '#888' },
  dropdownValue: { fontSize: 14, color: '#333', fontWeight: 'bold' },
  helperText: { fontSize: 11, color: '#999', marginTop: 10, fontStyle: 'italic' },
  logoutButton: {
    flexDirection: 'row', backgroundColor: '#FFF0F0', paddingVertical: 16,
    borderRadius: 18, justifyContent: 'center', alignItems: 'center', 
    borderWidth: 1, borderColor: '#FFE0E0', marginTop: 10
  },
  logoutText: { color: '#D32F2F', fontSize: 16, fontWeight: 'bold' },
  footerText: { textAlign: 'center', marginTop: 25, color: '#BBB', fontSize: 12, letterSpacing: 0.5 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end', alignItems: 'center' },
  modalContainer: { backgroundColor: 'white', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  closeBtn: { padding: 5 },
  branchItem: { 
    paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: '#F5F5F5', 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' 
  },
  selectedBranchItem: { backgroundColor: '#F0F7FF', paddingHorizontal: 15, borderRadius: 12, borderBottomWidth: 0 },
  branchText: { fontSize: 16, color: '#444', flex: 1 },
  selectedBranchText: { color: '#0055c8', fontWeight: 'bold' },
  emptyListText: { textAlign: 'center', padding: 30, color: '#999' }
});

export default UserProfileScreen;