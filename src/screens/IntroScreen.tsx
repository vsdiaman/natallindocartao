// src/screens/IntroScreen.tsx
import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  FlatList,
  Animated,
  useWindowDimensions,
  Platform,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';

const COLORS = {
  card: 'rgb(255,255,255)',
  text: 'rgb(17,24,39)',
  muted: 'rgb(107,114,128)',
  border: 'rgb(229,231,235)',
  primary: 'rgb(20,20,25)',
  primaryText: 'rgb(255,255,255)',
};

type Step = {
  title: string;
  subtitle: string;
  icon: string;
};

const STEPS: Step[] = [
  {
    title: 'Modelos prontos',
    subtitle: 'Escolha um cartão e comece rápido, sem complicação.',
    icon: '🎁',
  },
  {
    title: 'Personalize',
    subtitle: 'Edite texto, cor, fonte e arraste do seu jeito.',
    icon: '✨',
  },
  {
    title: 'Salve e compartilhe',
    subtitle: 'Baixe em JPEG e compartilhe onde quiser.',
    icon: '📤',
  },
];

export default function IntroScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();

  const listRef = useRef<FlatList<Step> | null>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const [index, setIndex] = useState(0);

  const topInset = useMemo(() => {
    const androidTop =
      Platform.OS === 'android' ? StatusBar.currentHeight ?? 0 : 0;
    return Math.max(insets.top, androidTop);
  }, [insets.top]);

  const cardHeight = useMemo(() => {
    // responsivo: não estoura em telas menores
    const h = Math.round(height * 0.58);
    return Math.max(420, Math.min(620, h));
  }, [height]);

  const goHome = useCallback(() => {
    navigation.replace('Home');
  }, [navigation]);

  const goNext = useCallback(() => {
    if (index >= STEPS.length - 1) {
      goHome();
      return;
    }
    const next = index + 1;
    listRef.current?.scrollToIndex({ index: next, animated: true });
    setIndex(next);
  }, [goHome, index]);

  const onMomentumEnd = useCallback(
    (e: any) => {
      const newIndex = Math.round(e.nativeEvent.contentOffset.x / width);
      setIndex(Math.max(0, Math.min(STEPS.length - 1, newIndex)));
    },
    [width],
  );

  const getItemLayout = useCallback(
    (_: any, i: number) => ({ length: width, offset: width * i, index: i }),
    [width],
  );

  // gradiente “anda” junto do swipe
  const gradientTranslateX = Animated.multiply(scrollX, -1);

  const renderItem = useCallback(
    ({ item }: { item: Step }) => {
      return (
        <View style={[s.page, { width }]}>
          <View style={[s.card, { height: cardHeight }]}>
            <View style={s.illustration}>
              <View style={s.illusCircle}>
                <Text style={s.illusIcon}>{item.icon}</Text>
              </View>

              {/* “linhas”/desenho simples estilo onboarding */}
              <View style={s.illusLines}>
                <View style={[s.illusLine, { width: '78%' }]} />
                <View style={[s.illusLine, { width: '64%' }]} />
                <View style={[s.illusLine, { width: '70%' }]} />
              </View>
            </View>

            <Text style={s.title}>{item.title}</Text>
            <Text style={s.subtitle}>{item.subtitle}</Text>
          </View>
        </View>
      );
    },
    [cardHeight, width],
  );

  const buttonText = index === STEPS.length - 1 ? 'Começar' : 'Próximo';

  return (
    <SafeAreaView style={s.safe} edges={['left', 'right', 'bottom']}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="dark-content"
      />

      {/* fundo */}
      <Animated.View
        pointerEvents="none"
        style={[
          s.bg,
          {
            width: width * STEPS.length,
            transform: [{ translateX: gradientTranslateX }],
          },
        ]}
      >
        <LinearGradient
          // estilo da imagem: azul/roxo suave
          colors={[
            'rgb(164, 224, 255)',
            'rgb(153, 201, 255)',
            'rgb(154, 178, 255)',
            'rgb(191, 170, 255)',
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={s.bgFill}
        />
      </Animated.View>

      {/* header */}
      <View style={[s.header, { paddingTop: topInset + 10 }]}>
        <View style={{ width: 64 }} />
        <Text style={s.brand}>Natal Lindo Cartão</Text>
        <TouchableOpacity onPress={goHome} hitSlop={10} style={s.skipBtn}>
          <Text style={s.skip}>Pular</Text>
        </TouchableOpacity>
      </View>

      {/* pages */}
      <Animated.FlatList
        ref={r => (listRef.current = r)}
        data={STEPS}
        keyExtractor={(_, i) => String(i)}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onMomentumEnd}
        getItemLayout={getItemLayout}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: true },
        )}
        scrollEventThrottle={16}
      />

      {/* footer */}
      <View style={[s.footer, { paddingBottom: insets.bottom + 16 }]}>
        <View style={s.dots}>
          {STEPS.map((_, i) => (
            <View key={String(i)} style={[s.dot, i === index && s.dotActive]} />
          ))}
        </View>

        <TouchableOpacity activeOpacity={0.92} onPress={goNext} style={s.cta}>
          <Text style={s.ctaText}>{buttonText}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: 'rgb(245,246,248)' },
  bg: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
  },
  bgFill: { flex: 1 },

  header: {
    paddingHorizontal: 20,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: { color: COLORS.text, fontSize: 16, fontWeight: '900' },
  skipBtn: { width: 64, alignItems: 'flex-end' },
  skip: { color: COLORS.muted, fontSize: 14, fontWeight: '800' },

  page: {
    flex: 1,
    paddingHorizontal: 22,
    paddingTop: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },

  card: {
    width: '100%',
    borderRadius: 26,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 18,
    paddingVertical: 18,

    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },

  illustration: {
    height: 320,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: 'rgb(250,251,252)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  illusCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgb(238, 241, 246)',
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  illusIcon: { fontSize: 44 },

  illusLines: { marginTop: 18, alignItems: 'center', gap: 10 },
  illusLine: {
    height: 12,
    borderRadius: 10,
    backgroundColor: 'rgb(238, 241, 246)',
  },

  title: {
    marginTop: 16,
    color: COLORS.text,
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 8,
    color: COLORS.muted,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    textAlign: 'center',
    paddingHorizontal: 10,
  },

  footer: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  dots: {
    height: 26,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 14,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255,255,255,0.55)',
  },
  dotActive: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
  },

  cta: {
    height: 54,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: { color: COLORS.primaryText, fontSize: 16, fontWeight: '900' },
});
