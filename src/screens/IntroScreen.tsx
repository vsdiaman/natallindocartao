// src/screens/IntroScreen.tsx
import React, { useEffect, useRef, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Animated,
  Easing,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Loader from '../components/Loader';

const RED = '#C00021';
const RED_DARK = '#920018';
const WHITE = '#FFFFFF';

export default function IntroScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();

  const [working, setWorking] = useState(false);
  const wait = (ms: number) => new Promise(r => setTimeout(r, ms));

  const fade = useRef(new Animated.Value(0)).current;
  const up = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(up, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  }, [fade, up]);

  const onStart = async () => {
    if (working) return;
    setWorking(true);
    try {
      await wait(500); // mostra o loader um instante
      navigation.replace('Home'); // some em fade (definido no Router)
    } finally {
      // a tela será desmontada após replace
    }
  };

  const topSafe = Math.max(
    insets.top,
    Platform.OS === 'android' ? StatusBar.currentHeight ?? 0 : 0,
  );
  const bottomSafe = insets.bottom;

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      <LinearGradient colors={[RED, RED_DARK]} style={s.bg}>
        <View style={{ height: topSafe }} />

        <Animated.View
          style={[s.center, { opacity: fade, transform: [{ translateY: up }] }]}
        >
          <View style={s.logoWrap}>
            <Text style={s.logoText}>🎄</Text>
          </View>
          <Text style={s.title}>Natal Lindo Cartão</Text>
          <Text style={s.subtitle}>Crie cartões bonitos em segundos</Text>
        </Animated.View>

        <View style={[s.footer, { paddingBottom: bottomSafe + 16 }]}>
          <TouchableOpacity
            activeOpacity={0.92}
            onPress={onStart}
            disabled={working}
            style={[s.cta, working && { opacity: 0.6 }]}
          >
            <Text style={s.ctaText}>Começar</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <Loader visible={working} text="Carregando..." />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#000' },
  bg: { flex: 1 },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  logoWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  logoText: { fontSize: 42, color: WHITE },
  title: { color: WHITE, fontSize: 24, fontWeight: '900', textAlign: 'center' },
  subtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    marginTop: 6,
    textAlign: 'center',
  },
  footer: { alignItems: 'center', paddingHorizontal: 24 },
  cta: {
    backgroundColor: WHITE,
    height: 48,
    borderRadius: 28,
    paddingHorizontal: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: { color: '#B0001C', fontSize: 16, fontWeight: '800' },
});
