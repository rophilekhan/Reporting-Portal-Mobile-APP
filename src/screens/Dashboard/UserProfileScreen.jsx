import React, { useEffect, useState, useContext } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions, StatusBar, Modal, FlatList,
  Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from '@react-native-vector-icons/ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context'; // ✅ Safe Area

import { COLORS } from '../../config/theme';
import { logoutUser } from '../../services/authService';
import { BranchContext } from '../../context/BranchContext';

const { width, height } = Dimensions.get('window');
const scale = (size) => (width / 375) * size;

const InfoRow = ({ icon, label, value }) => (
  <View style={styles.infoRow}>
    <View style={styles.iconBox}>
      <Ionicons name={icon} size={scale(20)} color={COLORS.primary} />
    </View>
    <View style={styles.infoTextContainer}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue} numberOfLines={1}>{value || 'N/A'}</Text>
    </View>
  </View>
);

const UserProfileScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets(); // ✅ Safe Area Hook
  const { companyBranchId, branchName, updateBranch, loadBranchFromStorage } = useContext(BranchContext);
  
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [branches, setBranches] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [loadingBranches, setLoadingBranches] = useState(false);

  useEffect(() => {
    // 1. Reload global context data to ensure we have latest login info
    loadBranchFromStorage();

    const loadUserAndBranches = async () => {
      try {
        const jsonValue = await AsyncStorage.getItem('userInfo');
        const user = jsonValue != null ? JSON.parse(jsonValue) : null;
        setUserData(user);

        if (user?.UserID) {
          fetchBranches(user.UserID, user.CompanyBranchID);
        }
      } catch (e) {
        console.error(e);
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
      const text = await response.text(); 
      try {
        const data = JSON.parse(text);
        if (Array.isArray(data)) {
          setBranches(data);
          
          // ✅ AUTO-SELECT NAME LOGIC:
          // If we have an ID (either global or user default) but no friendly Name in context, find it now.
          const targetId = companyBranchId || userDefaultBranchId;
          
          if (targetId) {
               const current = data.find(b => b.ID === targetId);
               // Only update if the name is generic "Select Branch" or null
               if(current && (branchName === 'Select Branch' || !branchName)) {
                   updateBranch(current.ID, current.Name);
               }
          }
        }
      } catch (jsonError) {
        console.error("API Error: Invalid JSON", text);
      }
    } catch (error) {
      console.error("Network Error:", error);
    } finally {
      setLoadingBranches(false);
    }
  };

  const handleBranchSelect = (item) => {
    updateBranch(item.ID, item.Name);
    setModalVisible(false);
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

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} translucent={true} />
      
      <ScrollView 
        contentContainerStyle={{ paddingBottom: Math.max(insets.bottom + 20, scale(40)) }} 
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Header - Safe Area Applied via Padding */}
        <LinearGradient
          colors={['#003892', '#0055c8', '#e98a57']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={[styles.header, { paddingTop: insets.top + scale(20) }]} 
        >
          <Text style={styles.headerTitle}>My Profile</Text>
        </LinearGradient>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {userData?.UserName ? userData.UserName.charAt(0).toUpperCase() : 'U'}
            </Text>
          </View>
          <Text style={styles.userName}>{userData?.UserName || 'Guest User'}</Text>
          <Text style={styles.userRole}>{userData?.userRole || 'User'}</Text>
          <View style={styles.statusBadge}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Active</Text>
          </View>
        </View>

        <View style={styles.scrollContent}>
          
          {/* Branch Selection */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Company Branch</Text>
            
            <TouchableOpacity 
                style={styles.dropdownButton} 
                onPress={() => setModalVisible(true)}
            >
                <View style={{flexDirection:'row', alignItems:'center'}}>
                    <View style={[styles.iconBox, { backgroundColor: '#E3F2FD' }]}>
                        <Ionicons name="business" size={scale(20)} color="#1565C0" />
                    </View>
                    <View>
                        <Text style={styles.dropdownLabel}>Selected Branch</Text>
                        <Text style={styles.dropdownValue}>
                             {branches.find(b => b.ID === companyBranchId)?.Name || branchName || companyBranchId || "Select Branch"}
                        </Text>
                    </View>
                </View>
                <Ionicons name="chevron-down" size={scale(20)} color="#666" />
            </TouchableOpacity>

            <Text style={styles.helperText}>
                * Changing this updates data across the entire app.
            </Text>
          </View>

          {/* Account Details */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Account Details</Text>
            <InfoRow icon="id-card-outline" label="User ID" value={userData?.UserID?.toString()} />
            <View style={styles.divider} />
            <InfoRow icon="key-outline" label="Current Branch ID" value={companyBranchId?.toString()} />
            <View style={styles.divider} />
            <InfoRow icon="shield-checkmark-outline" label="Access Level" value={userData?.userRole} />
          </View>

          {/* App Info */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Application Info</Text>
            <InfoRow icon="layers-outline" label="Version" value="1.0.0 (Beta)" />
            <View style={styles.divider} />
            <InfoRow icon="server-outline" label="Server Environment" value="Production" />
            <View style={styles.divider} />
            <InfoRow icon="calendar-outline" label="Last Updated" value="Dec 2025" />
          </View>

          {/* Logout */}
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={scale(20)} color="#D32F2F" style={{ marginRight: 10 }} />
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>

          <Text style={styles.footerText}>Xinacle ERP © 2026</Text>
        </View>
      </ScrollView>

      {/* Modal - Same as before */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
                <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Select Branch</Text>
                    <TouchableOpacity onPress={() => setModalVisible(false)}>
                        <Ionicons name="close" size={24} color="#333" />
                    </TouchableOpacity>
                </View>

                {loadingBranches ? (
                    <ActivityIndicator size="large" color={COLORS.primary} style={{margin: 20}} />
                ) : (
                    <FlatList
                        data={branches}
                        keyExtractor={(item) => item.ID.toString()}
                        renderItem={({ item }) => (
                            <TouchableOpacity 
                                style={[
                                    styles.branchItem, 
                                    item.ID === companyBranchId && styles.selectedBranchItem
                                ]}
                                onPress={() => handleBranchSelect(item)}
                            >
                                <Text style={[
                                    styles.branchText,
                                    item.ID === companyBranchId && styles.selectedBranchText
                                ]}>
                                    {item.Name}
                                </Text>
                                {item.ID === companyBranchId && (
                                    <Ionicons name="checkmark-circle" size={22} color={COLORS.secondary} />
                                )}
                            </TouchableOpacity>
                        )}
                        style={{ maxHeight: height * 0.5 }}
                        ListEmptyComponent={<Text style={{textAlign:'center', padding:20, color:'#999'}}>No branches found.</Text>}
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
  
  // Header with fixed height logic adjusted for safe area in the component
  header: {
    // Height is dynamic based on content + padding
    paddingBottom: scale(40), 
    paddingHorizontal: scale(20),
    borderBottomLeftRadius: scale(30),
    borderBottomRightRadius: scale(30),
    alignItems: 'center',
  },
  headerTitle: { color: 'white', fontSize: scale(22), fontWeight: 'bold' },

  profileCard: {
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: -scale(30), // Pulled up over header
    width: '90%',
    backgroundColor: 'white',
    borderRadius: scale(20),
    paddingVertical: scale(25),
    paddingHorizontal: scale(20),
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    marginBottom: scale(20),
  },
  avatarContainer: {
    width: scale(80), height: scale(80), borderRadius: scale(40),
    backgroundColor: '#F0F4FF', justifyContent: 'center', alignItems: 'center',
    marginBottom: scale(15), borderWidth: 3, borderColor: '#e98a57',
  },
  avatarText: { fontSize: scale(36), fontWeight: 'bold', color: COLORS.primary },
  userName: { fontSize: scale(22), fontWeight: 'bold', color: '#333', marginBottom: scale(5) },
  userRole: { fontSize: scale(14), color: '#666', marginBottom: scale(15), textTransform: 'uppercase' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E8F5E9', padding: scale(6), borderRadius: scale(20) },
  statusDot: { width: scale(8), height: scale(8), borderRadius: scale(4), backgroundColor: '#4CAF50', marginRight: scale(6) },
  statusText: { color: '#4CAF50', fontSize: scale(12), fontWeight: '600' },

  scrollContent: { paddingHorizontal: scale(20) },
  
  sectionCard: {
    backgroundColor: 'white', borderRadius: scale(15), padding: scale(20), marginBottom: scale(20),
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05,
  },
  sectionTitle: { fontSize: scale(16), fontWeight: 'bold', color: '#333', marginBottom: scale(15) },

  infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: scale(8) },
  iconBox: {
    width: scale(40), height: scale(40), borderRadius: scale(10),
    backgroundColor: '#F5F7FA', justifyContent: 'center', alignItems: 'center', marginRight: scale(15),
  },
  infoTextContainer: { flex: 1 },
  infoLabel: { fontSize: scale(12), color: '#999', marginBottom: scale(2) },
  infoValue: { fontSize: scale(15), color: '#333', fontWeight: '500' },
  divider: { height: 1, backgroundColor: '#F0F0F0', marginVertical: scale(5), marginLeft: scale(55) },

  dropdownButton: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#F8F9FA', padding: scale(10), borderRadius: scale(12),
    borderWidth: 1, borderColor: '#E0E0E0'
  },
  dropdownLabel: { fontSize: scale(11), color: '#888' },
  dropdownValue: { fontSize: scale(14), color: '#333', fontWeight: 'bold' },
  helperText: { fontSize: scale(11), color: '#999', marginTop: scale(8), fontStyle: 'italic' },

  logoutButton: {
    flexDirection: 'row', backgroundColor: '#FFEBEE', paddingVertical: scale(15),
    borderRadius: scale(15), justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#FFCDD2',
  },
  logoutText: { color: '#D32F2F', fontSize: scale(16), fontWeight: 'bold' },
  footerText: { textAlign: 'center', marginTop: scale(20), color: '#BBB', fontSize: scale(12) },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContainer: { backgroundColor: 'white', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: height * 0.7 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  branchItem: { 
      paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#F0F0F0', 
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' 
  },
  selectedBranchItem: { backgroundColor: '#FFF3E0', paddingHorizontal: 10, borderRadius: 8, borderBottomWidth: 0 },
  branchText: { fontSize: 16, color: '#333' },
  selectedBranchText: { color: COLORS.secondary, fontWeight: 'bold' },
});

export default UserProfileScreen;