import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Text, Image, Dimensions, StatusBar } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage
import { COLORS } from '../../config/theme';

const { width, height } = Dimensions.get('window');

const SplashScreen = ({ navigation }) => {
  // Animation Values
  const scaleAnim = useRef(new Animated.Value(0)).current;  // For Logo Pop
  const fadeAnim = useRef(new Animated.Value(0)).current;   // For Text Fade
  const moveAnim = useRef(new Animated.Value(0)).current;   // For slight upward movement

  useEffect(() => {
    // 1. Start Animation Sequence
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(moveAnim, {
          toValue: -20, // Move up 20 pixels
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // 2. Check Login Status Logic
    const determineNavigation = async () => {
      try {
        // Retrieve the session data saved in authService.js
        const userInfo = await AsyncStorage.getItem('userInfo');

        // Wait a minimum amount of time (e.g., 3 seconds) so the user sees the Splash animation
        setTimeout(() => {
          if (userInfo !== null) {
            // Data exists, user is logged in -> Go to Dashboard
            navigation.replace('DrawerRoot');
          } else {
            // No data, user is logged out -> Go to Login
            navigation.replace('Login');
          }
        }, 3000); // 3 Seconds delay

      } catch (error) {
        console.error("Splash Screen Auth Check Error:", error);
        // Fallback to login on error
        navigation.replace('Login');
      }
    };

    determineNavigation();

  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#003892" />
      
      {/* Full Screen Gradient Background */}
      <LinearGradient
        colors={['#003892', '#0055c8', '#e98a57']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBackground}
      >
        {/* Decorative Circles */}
        <View style={styles.decorativeCircle1} />
        <View style={styles.decorativeCircle2} />
        <View style={styles.decorativeCircle3} />
        <View style={styles.decorativeCircle4} />

        {/* Animated Logo Container with Glow */}
        <Animated.View style={[styles.logoContainerOuter, { transform: [{ scale: scaleAnim }] }]}>
          <View style={styles.logoContainerInner}>
            <Image 
              source={require('../../assets/xinacle-logo.png')} 
              style={styles.logoImage} 
              resizeMode="contain" 
            />
          </View>
        </Animated.View>

        {/* Animated Text */}
        <Animated.View style={[styles.textContainer, { opacity: fadeAnim, transform: [{ translateY: moveAnim }] }]}>
          <Text style={styles.title}>Xinacle <Text style={styles.highlight}>ERP</Text></Text>
          <Text style={styles.subtitle}>Simplifying Business Processes</Text>
        </Animated.View>

        {/* Powered By Footer */}
        <View style={styles.poweredByContainer}>
          <Text style={styles.poweredByText}>Powered by</Text>
          <Text style={styles.poweredByLink}>Hassoft Solutions</Text>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
  },
  gradientBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  decorativeCircle1: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.08)',
    top: -40,
    left: -30,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  decorativeCircle2: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(233,138,87,0.15)',
    top: height * 0.3,
    right: 30,
    borderWidth: 2,
    borderColor: 'rgba(233,138,87,0.2)',
  },
  decorativeCircle3: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.12)',
    bottom: height * 0.4,
    left: 50,
  },
  decorativeCircle4: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(233,138,87,0.2)',
    top: height * 0.25,
    right: width * 0.25,
  },
  logoContainerOuter: {
    marginBottom: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 10,
  },
  logoContainerInner: {
    width: width * 0.45, 
    height: width * 0.45,
    backgroundColor: 'white',
    borderRadius: (width * 0.45) / 2, 
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logoImage: {
    width: '80%',
    height: '80%',
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  title: { 
    fontSize: 36, 
    color: 'white', 
    fontWeight: '800', 
    textAlign: 'center',
    letterSpacing: 1,
    marginBottom: 10,
  },
  highlight: {
    color: '#e98a57', 
    fontWeight: '800',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 16,
    textAlign: 'center',
    letterSpacing: 0.5,
    fontWeight: '500',
  },
  poweredByContainer: {
    position: 'absolute',
    bottom: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  poweredByText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 20,
    marginRight: 4,
  },
  poweredByLink: {
    color: '#e98a57', 
    fontSize: 20,
    fontWeight: '600',
  },
});

export default SplashScreen;