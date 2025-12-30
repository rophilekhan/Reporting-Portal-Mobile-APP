import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Image } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { COLORS } from '../config/theme';

const MenuSection = ({ title, icon, children, isOpen, onPress }) => (
  <View>
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Ionicons name={icon} size={20} color={COLORS.white} style={{ marginRight: 10 }} />
        <Text style={styles.menuText}>{title}</Text>
      </View>
      <Ionicons name={isOpen ? "expand-less" : "expand-more"} size={20} color={COLORS.white} />
    </TouchableOpacity>
    {isOpen && <View style={styles.subMenu}>{children}</View>}
  </View>
);

const SubMenuLink = ({ title, navigation, routeName }) => (
  <TouchableOpacity 
    style={styles.subMenuItem} 
    onPress={() => navigation.navigate(routeName)}
  >
    <Ionicons name="fiber-manual-record" size={8} color={COLORS.secondary} style={{marginRight: 8}}/>
    <Text style={styles.subMenuText}>{title}</Text>
  </TouchableOpacity>
);

const CustomDrawerContent = ({ navigation }) => {
  const [sections, setSections] = useState({
    accounts: false,
    purchase: false,
    sales: false,
    inventory: false
  });

  const toggleSection = (key) => {
    setSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <View style={styles.container}>
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Text style={{fontSize: 24, fontWeight: 'bold', color: COLORS.primary}}>A</Text>
        </View>
        <Text style={styles.profileName}>Admin User</Text>
        <Text style={styles.profileRole}>NAH Stones</Text>
      </View>

      <ScrollView style={{flex: 1}}>
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Dashboard')}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
             <Ionicons name="dashboard" size={20} color="white" style={{marginRight: 10}}/>
             <Text style={styles.menuText}>Dashboard</Text>
          </View>
        </TouchableOpacity>

        <MenuSection 
          title="Accounts" 
          icon="account-balance" 
          isOpen={sections.accounts} 
          onPress={() => toggleSection('accounts')}
        >
          <SubMenuLink title="Account Payables" navigation={navigation} routeName="Account Payables Report" />
          <SubMenuLink title="Account Receivables" navigation={navigation} routeName="Account Recievable Report" />
          <SubMenuLink title="Payment Summary" navigation={navigation} routeName="Account Payment Summary" />
          <SubMenuLink title="Petty Cash" navigation={navigation} routeName="Petty Cash Summary" />
          <SubMenuLink title="Income Statement" navigation={navigation} routeName="Income Statement" />
          <SubMenuLink title="Balance Sheet" navigation={navigation} routeName="Balance Sheet" />
        </MenuSection>

        <MenuSection title="Purchase" icon="shopping-cart" isOpen={sections.purchase} onPress={() => toggleSection('purchase')}>
          <SubMenuLink title="Purchase Summary" navigation={navigation} routeName="Purchase Summary" />
          <SubMenuLink title="Goods Receiving" navigation={navigation} routeName="Good Recieving Summary" />
        </MenuSection>

        <MenuSection title="Sales" icon="trending-up" isOpen={sections.sales} onPress={() => toggleSection('sales')}>
          <SubMenuLink title="Sales Summary" navigation={navigation} routeName="Sales Summary" />
        </MenuSection>

        <MenuSection title="Inventory" icon="inventory" isOpen={sections.inventory} onPress={() => toggleSection('inventory')}>
          <SubMenuLink title="Product Ledger" navigation={navigation} routeName="Product Ledger" />
          <SubMenuLink title="Running Stock" navigation={navigation} routeName="Product Running Stock" />
        </MenuSection>
      </ScrollView>
      
      <TouchableOpacity style={styles.logoutBtn} onPress={() => navigation.replace('Login')}>
        <Ionicons name="logout" size={20} color="white" />
        <Text style={styles.menuText}> Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.primary },
  profileHeader: { padding: 20, backgroundColor: COLORS.secondary, marginBottom: 10 },
  avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  profileName: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  profileRole: { color: '#e0e0e0', fontSize: 12 },
  menuItem: { padding: 15, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  menuText: { color: 'white', fontSize: 14, fontWeight: '500' },
  subMenu: { backgroundColor: 'rgba(0,0,0,0.2)' },
  subMenuItem: { padding: 12, paddingLeft: 40, flexDirection: 'row', alignItems: 'center' },
  subMenuText: { color: '#e0e0e0', fontSize: 13 },
  logoutBtn: { flexDirection: 'row', padding: 20, alignItems: 'center', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)' }
});

export default CustomDrawerContent;