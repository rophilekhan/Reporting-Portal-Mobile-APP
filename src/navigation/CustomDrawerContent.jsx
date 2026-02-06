import React, { useState, useEffect } from 'react';
import { 
  View, Text, TouchableOpacity, ScrollView, StyleSheet, Image, 
  StatusBar, useWindowDimensions 
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../config/theme';
import { logoutUser } from '../services/authService';

const MenuSection = ({ title, icon, children, isOpen, onPress }) => (
  <View style={styles.sectionContainer}>
    <TouchableOpacity 
      activeOpacity={0.7} 
      style={[styles.menuItem, isOpen && styles.menuItemActive]} 
      onPress={onPress}
    >
      <View style={styles.menuLabel}>
        <View style={[styles.iconBox, isOpen && styles.iconBoxActive]}>
           <Ionicons name={icon} size={18} color={isOpen ? COLORS.secondary : 'white'} />
        </View>
        <Text style={[styles.menuText, isOpen && styles.menuTextActive]}>{title}</Text>
      </View>
      <Ionicons 
        name={isOpen ? "chevron-up-outline" : "chevron-down-outline"} 
        size={16} 
        color={isOpen ? COLORS.secondary : 'rgba(255,255,255,0.6)'} 
      />
    </TouchableOpacity>
    {isOpen && <View style={styles.subMenu}>{children}</View>}
  </View>
);

const CustomDrawerContent = ({ navigation }) => {
  const [openSection, setOpenSection] = useState(null);
  const [userData, setUserData] = useState({ name: 'Rophile Ahmed', initials: 'R' });

  // --- STATIC MENU DATA (Mapped to your Reports) ---
  const staticMenus = [
    {
      title: 'Accounts',
      icon: 'wallet-outline',
      items: [
        { title: 'Account Payables Report' },
        { title: 'Account Recievable Report' },
        { title: 'Account Payment Summary' },
        { title: 'Account Receiving Summary' },
        { title: 'Petty Cash Summary' },
        { title: 'Expense Payment Summary' },
        { title: 'Income Statement' },
        { title: 'Balance Sheet' },
        { title: 'Trial Balance' },
      ]
    },
    {
      title: 'Purchase',
      icon: 'cart-outline',
      items: [
        { title: 'Purchase Summary' },
        { title: 'Good Recieving Summary' },
      ]
    },
    {
      title: 'Sales',
      icon: 'trending-up-outline',
      items: [
        { title: 'Sales Summary' },
      ]
    },
    {
      title: 'Inventory',
      icon: 'layers-outline',
      items: [
        { title: 'Product Ledger' },
        { title: 'Product Running Stock' },
      ]
    }
  ];

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const jsonValue = await AsyncStorage.getItem('userInfo');
        const user = jsonValue != null ? JSON.parse(jsonValue) : null;
        if (user) {
          setUserData({ 
            name: user.UserName || 'Admin', 
            initials: (user.UserName || 'A').charAt(0).toUpperCase() 
          });
        }
      } catch (e) { console.log(e); }
    };
    loadUserData();
  }, []);

  const handleNavigation = (reportTitle) => {
    // Navigation matches your DashboardStackNavigator setup
    navigation.navigate('DashboardTabs', {
      screen: 'HomeStack',
      params: { 
        screen: reportTitle, 
        params: { routeName: reportTitle } 
      }
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <LinearGradient colors={['#003892', '#0055c8', '#e98a57']} style={styles.container}>
        <View style={styles.contentWrapper}>
          
          {/* BRAND HEADER */}
          <View style={styles.brandHeader}>
            <View style={styles.logoCircle}>
              <Image source={require('../assets/reporting-portal-logo.png')} style={styles.logoImage} resizeMode="contain" />
            </View>
            <Text style={styles.brandText}>Codesphinx <Text style={{color: '#e98a57'}}>Portal</Text></Text>
          </View>

          {/* PROFILE SECTION */}
          <View style={styles.profileCard}>
            <View style={styles.avatarContainer}><Text style={styles.avatarText}>{userData.initials}</Text></View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{userData.name}</Text>
              <Text style={styles.profileRole}>Portal Administrator</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <ScrollView style={styles.menuScroll} showsVerticalScrollIndicator={false}>
            {/* DASHBOARD LINK */}
            <TouchableOpacity 
              style={styles.menuItem} 
              onPress={() => navigation.navigate('DashboardTabs', { screen: 'HomeStack', params: { screen: 'DashboardMain' }})}
            >
              <View style={styles.menuLabel}>
                <View style={styles.iconBox}><Ionicons name="grid-outline" size={18} color="white"/></View>
                <Text style={styles.menuText}>Dashboard</Text>
              </View>
            </TouchableOpacity>

            {/* DYNAMIC SECTIONS */}
            {staticMenus.map((section, index) => (
              <MenuSection 
                key={index}
                title={section.title} 
                icon={section.icon} 
                isOpen={openSection === section.title} 
                onPress={() => setOpenSection(openSection === section.title ? null : section.title)}
              >
                {section.items.map((sub, subIndex) => (
                  <TouchableOpacity 
                    key={subIndex} 
                    style={styles.subMenuItem} 
                    onPress={() => handleNavigation(sub.title)}
                  >
                    <View style={styles.bulletPoint} />
                    <Text style={styles.subMenuText}>{sub.title}</Text>
                  </TouchableOpacity>
                ))}
              </MenuSection>
            ))}
          </ScrollView>

          {/* FOOTER */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.logoutBtn} onPress={async () => { await logoutUser(); navigation.replace('Login'); }}>
              <View style={styles.logoutIconBox}><Ionicons name="log-out-outline" size={18} color="#fff" /></View>
              <Text style={styles.logoutText}>Sign Out from Portal</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#003892' },
  container: { flex: 1 },
  contentWrapper: { flex: 1 },
  brandHeader: { flexDirection: 'row', alignItems: 'center', padding: 20 },
  logoCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  logoImage: { width: 22, height: 22 },
  brandText: { fontWeight: 'bold', color: 'white', fontSize: 18 },
  profileCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', padding: 10, borderRadius: 12, marginHorizontal: 15, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  avatarContainer: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarText: { color: '#003892', fontWeight: 'bold' },
  profileInfo: { flex: 1 },
  profileName: { color: 'white', fontWeight: 'bold', fontSize: 14 },
  profileRole: { color: '#e98a57', fontSize: 10 },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginVertical: 12, marginHorizontal: 20 },
  menuScroll: { flex: 1 },
  sectionContainer: { marginBottom: 4 },
  menuItem: { paddingVertical: 10, paddingHorizontal: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  menuItemActive: { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 10 },
  menuLabel: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { width: 30, height: 30, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  iconBoxActive: { backgroundColor: 'white' },
  menuText: { color: 'white', fontSize: 14 },
  menuTextActive: { fontWeight: 'bold' },
  subMenu: { paddingLeft: 10, paddingBottom: 5, backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: 10, marginHorizontal: 10 },
  subMenuItem: { paddingVertical: 10, paddingLeft: 35, flexDirection: 'row', alignItems: 'center' },
  bulletPoint: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#e98a57', marginRight: 10 },
  subMenuText: { color: 'rgba(255,255,255,0.8)', fontSize: 13 },
  footer: { padding: 20 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.15)', padding: 12, borderRadius: 12 },
  logoutIconBox: { marginRight: 10, backgroundColor: 'rgba(255,107,107,0.2)', padding: 5, borderRadius: 6 },
  logoutText: { color: '#fff', fontWeight: '600' }
});

export default CustomDrawerContent;