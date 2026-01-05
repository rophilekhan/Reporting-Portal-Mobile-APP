import React, { useEffect, useRef } from 'react';
import { 
  View, Animated, StyleSheet, Text, Image, StatusBar, 
  useWindowDimensions, Platform 
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../../config/theme';

const SplashScreen = ({ navigation }) => {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  
  const isLandscape = screenWidth > screenHeight;
  const minDimension = Math.min(screenWidth, screenHeight);
  // Adaptive scale: smaller on landscape to fit everything, larger on portrait
  const scale = isLandscape ? (screenHeight / 480) : (screenWidth / 375);

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animation Sequence
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start();

    const determineNavigation = async () => {
      try {
        const userInfo = await AsyncStorage.getItem('userInfo');
        // Reduced delay to 2.5 seconds for better UX
        setTimeout(() => {
          navigation.replace(userInfo ? 'DrawerRoot' : 'Login');
        }, 3000); 
      } catch (error) {
        navigation.replace('Login');
      }
    };
    determineNavigation();
  }, []);

  // Responsive Sizes
  const logoSize = (isLandscape ? screenHeight * 0.25 : screenWidth * 0.4) * Math.min(scale, 1.2);
  const containerSize = logoSize + 40 * scale;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <LinearGradient
        colors={['#003892', '#0055c8', '#e98a57']}
        style={StyleSheet.absoluteFill}
      >
        {/* Decorative Background Layer */}
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
            <View style={[styles.circle, styles.circle1, { width: 200 * scale, height: 200 * scale }]} />
            <View style={[styles.circle, styles.circle2, { width: 120 * scale, height: 120 * scale }]} />
        </View>

        {/* Center Content Layer */}
        <View style={styles.centerWrapper}>
          <Animated.View style={[
            styles.logoWrapper,
            { transform: [{ scale: scaleAnim }] }
          ]}>
            <View style={[styles.logoContainer, { width: containerSize, height: containerSize, borderRadius: containerSize / 2 }]}>
              <Image 
                source={require('../../assets/xinacle-logo.png')} 
                style={{ width: logoSize, height: logoSize }}
                resizeMode="contain" 
              />
            </View>
          </Animated.View>

          <Animated.View style={{ opacity: fadeAnim, alignItems: 'center' }}>
            <Text style={[styles.title, { fontSize: 36 * scale }]}>
              Xinacle <Text style={styles.highlight}>ERP</Text>
            </Text>
            <Text style={[styles.subtitle, { fontSize: 16 * scale }]}>
              Simplifying Business Processes
            </Text>
          </Animated.View>
        </View>

        {/* Footer Layer */}
        <View style={[styles.footer, { bottom: insets.bottom + 30 }]}>
       <Text style={[styles.footerText, { fontSize: 18 * scale }]}>
  Powered by <Text style={[styles.footerLink, { fontSize: 20 * scale }]} >Hassoft Solutions</Text>
</Text>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  logoWrapper: {
    marginBottom: 30,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
      },
      android: { elevation: 15 },
    }),
  },
  logoContainer: {
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: 'white',
    fontWeight: '900',
    textAlign: 'center',
  },
  highlight: {
    color: '#e98a57',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.8)',
    marginTop: 5,
    fontWeight: '500',
  },
  footer: {
  position: 'absolute',
  left: 0,
  right: 0,
  alignItems: 'center',
},

footerText: {
  color: 'rgba(255,255,255,0.6)',
    fontWeight: 'bold',     
},

footerLink: {
  color: '#e98746ff',
  fontWeight: 'bold',
  textShadowColor: 'rgba(0,0,0,0.8)',    // strong dark shadow
  textShadowOffset: { width: 1, height: 1 },
  textShadowRadius: 4,                   // larger blur for glow effect
},

  circle: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  circle1: {
    top: -50,
    left: -50,
  },
  circle2: {
    bottom: '20%',
    right: -30,
    backgroundColor: 'rgba(233,138,87,0.1)',
  }
});

export default SplashScreen;