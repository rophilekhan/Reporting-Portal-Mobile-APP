import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Dimensions } from 'react-native';
import { Camera, useCameraDevice, useCodeScanner } from 'react-native-vision-camera';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from '@react-native-vector-icons/ionicons';
import axios from 'axios';

const { width } = Dimensions.get('window');

const QRScannerScreen = ({ navigation }) => {
  const [hasPermission, setHasPermission] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const device = useCameraDevice('back');

  // 1. Permission Logic (Har mobile version ke liye)
  useEffect(() => {
    (async () => {
      const status = await Camera.requestCameraPermission();
      setHasPermission(status === 'granted');
      if (status !== 'granted') {
        Alert.alert("Permission Denied", "Camera access is required to scan company QR code.");
      }
    })();
  }, []);

  // 2. Barcode Scanner Logic
  const codeScanner = useCodeScanner({
    codeTypes: ['qr', 'ean-13'],
    onCodeScanned: async (codes) => {
      if (codes.length > 0 && !loading && isActive) {
        const qrValue = codes[0].value;
        await handleQRSuccess(qrValue);
      }
    }
  });

  const handleQRSuccess = async (qrKey) => {
    setIsActive(false); // Camera pause kar dein
    setLoading(true);
    try {
      // Yahan aapki API call
      const response = await axios.post('https://your-api.com/v1/get-branch', { key: qrKey });
      const branchId = response.data.companyBranchId;

      if (branchId) {
        await AsyncStorage.setItem('companyBranchId', branchId.toString());
        navigation.replace('Login');
      } else {
        Alert.alert("Invalid QR", "This QR code is not recognized.");
        setIsActive(true);
      }
    } catch (error) {
      Alert.alert("API Error", "Could not connect to server.");
      setIsActive(true);
    } finally {
      setLoading(false);
    }
  };

  if (!hasPermission) return <View style={styles.container}><ActivityIndicator size="large" /></View>;
  if (!device) return <View style={styles.container}><Text>No Camera Device Found</Text></View>;

  return (
    <View style={styles.container}>
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={isActive}
        codeScanner={codeScanner}
      />

      {/* QR Overlay UI */}
      <View style={styles.overlay}>
        <View style={styles.unfocusedContainer}></View>
        <View style={styles.focusedRow}>
          <View style={styles.unfocusedContainer}></View>
          <View style={styles.focusedContainer}>
             {/* Border Corners */}
             <View style={[styles.corner, styles.topLeft]} />
             <View style={[styles.corner, styles.topRight]} />
             <View style={[styles.corner, styles.bottomLeft]} />
             <View style={[styles.corner, styles.bottomRight]} />
          </View>
          <View style={styles.unfocusedContainer}></View>
        </View>
        <View style={styles.unfocusedContainer}>
            <Text style={styles.instructionText}>Position QR Code inside the box</Text>
        </View>
      </View>

      {/* Loading Indicator */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#e98a57" />
          <Text style={styles.loadingText}>Fetching Branch Details...</Text>
        </View>
      )}

      {/* Header with Title */}
      <LinearGradient colors={['#003892', 'transparent']} style={styles.header}>
        <Text style={styles.headerTitle}>Setup Company</Text>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'black' },
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  unfocusedContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  focusedRow: { flexDirection: 'row', height: 250 },
  focusedContainer: { width: 250, position: 'relative' },
  corner: { position: 'absolute', width: 40, height: 40, borderColor: '#e98a57', borderWidth: 4 },
  topLeft: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0 },
  topRight: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0 },
  bottomLeft: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0 },
  bottomRight: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0 },
  instructionText: { color: 'white', marginTop: 20, fontSize: 16, fontWeight: '500' },
  header: { position: 'absolute', top: 0, left: 0, right: 0, padding: 50, alignItems: 'center' },
  headerTitle: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  loadingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: 'white', marginTop: 10 }
});

export default QRScannerScreen;