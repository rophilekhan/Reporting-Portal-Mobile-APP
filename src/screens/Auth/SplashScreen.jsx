import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Text, Image, Dimensions, StatusBar } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS } from '../../config/theme'; // Adjust path if necessary

const { width, height } = Dimensions.get('window');

const SplashScreen = ({ navigation }) => {
  // Animation Values
  const scaleAnim = useRef(new Animated.Value(0)).current;  // For Logo Pop
  const fadeAnim = useRef(new Animated.Value(0)).current;   // For Text Fade
  const moveAnim = useRef(new Animated.Value(0)).current;   // For slight upward movement

  useEffect(() => {
    // Animation Sequence
    Animated.sequence([
      // 1. Spring the logo in
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }),
      // 2. Fade in text and move it up slightly
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

    // Navigate after 3 seconds total (adjust as needed)
    const timer = setTimeout(() => {
      navigation.replace('Login'); // Replace 'Login' with the actual name of your login screen route
    }, 5000);

    return () => clearTimeout(timer);
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
        {/* Decorative Circles - Matching Login Screen */}
        <View style={styles.decorativeCircle1} />
        <View style={styles.decorativeCircle2} />
        <View style={styles.decorativeCircle3} />
        <View style={styles.decorativeCircle4} />

        {/* Animated Logo Container with Glow - Matching Login Screen */}
        <Animated.View style={[styles.logoContainerOuter, { transform: [{ scale: scaleAnim }] }]}>
          <View style={styles.logoContainerInner}>
            <Image 
              source={require('../../assets/xinacle-logo.png')} 
              style={styles.logoImage} 
              resizeMode="contain" 
            />
          </View>
        </Animated.View>

        {/* Animated Text - Matching Login Screen */}
        <Animated.View style={[styles.textContainer, { opacity: fadeAnim, transform: [{ translateY: moveAnim }] }]}>
          <Text style={styles.title}>Xinacle <Text style={styles.highlight}>ERP</Text></Text>
          <Text style={styles.subtitle}>Simplifying Business Processes</Text>
        </Animated.View>

        {/* Powered By Footer - Matching Login Footer Style */}
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
  // Decorative Circles - Matching Login
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
    width: width * 0.45, // Responsive width
    height: width * 0.45,
    backgroundColor: 'white',
    borderRadius: (width * 0.45) / 2, // Make it a perfect circle
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
    color: '#e98a57', // Secondary color matching login
    fontWeight: '800',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 16,
    textAlign: 'center',
    letterSpacing: 0.5,
    fontWeight: '500',
  },
  // Powered By Footer - Matching Login Footer
  poweredByContainer: {
    position: 'absolute',
    bottom: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  poweredByText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    marginRight: 4,
  },
  poweredByLink: {
    color: '#e98a57', // Secondary color
    fontSize: 12,
    fontWeight: '600',
  },
});

export default SplashScreen;