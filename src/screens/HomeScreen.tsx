// src/screens/HomeScreen.tsx
import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  StatusBar,
  FlatList,
  useWindowDimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { TEMPLATES, Template } from '../data/templates.local';
import Loader from '../components/Loader';
import { RootStackParamList } from '../routes/Router';

const COLORS = {
  // base
  bg: '#F5F6F8',
  text: '#111827',
  muted: '#6B7280',
  border: '#E5E7EB',
  primary: '#141419',
  primaryText: '#FFFFFF',
  imageBg: '#EEF1F6',

  // extras (15+)
  red: '#EF4444',
  redDark: '#B91C1C',
  yellow: '#F59E0B',
  yellowSoft: '#FDE68A',
  blue: '#3B82F6',
  blueDark: '#1D4ED8',
  green: '#22C55E',
  emerald: '#10B981',
  beige: '#F5E6D3',
  sand: '#E7D3B0',
  brown: '#8B5E34',
  brownDark: '#5A3E2B',
  wine: '#7F1D1D',
  purple: '#8B5CF6',
  pink: '#EC4899',
  cyan: '#06B6D4',
  orange: '#F97316',
  graySoft: '#F3F4F6',
};

const PAGE = 18;

export default function HomeScreen() {
  const { navigate } =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const [items, setItems] = useState<Template[]>(TEMPLATES.slice(0, PAGE));
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [opening, setOpening] = useState(false);

  const selectedTemplate = useMemo(() => {
    if (!selectedId) return null;
    return (
      items.find(t => t.id === selectedId) ??
      TEMPLATES.find(t => t.id === selectedId) ??
      null
    );
  }, [items, selectedId]);

  const gap = 12;
  const contentPadding = 16;

  const cardSize = useMemo(() => {
    const available = width - contentPadding * 2 - gap * 2;
    return Math.floor(available / 3);
  }, [width]);

  const topSafe = useMemo(() => {
    const androidTop = StatusBar.currentHeight ?? 0;
    return Math.max(insets.top, androidTop);
  }, [insets.top]);

  const loadMore = useCallback(() => {
    if (loadingMore) return;

    const next = items.length;
    if (next >= TEMPLATES.length) return;

    setLoadingMore(true);
    setTimeout(() => {
      setItems(prev => [...prev, ...TEMPLATES.slice(next, next + PAGE)]);
      setLoadingMore(false);
    }, 180);
  }, [items.length, loadingMore]);

  const goEditor = useCallback(() => {
    if (!selectedTemplate) return;

    setOpening(true);
    setTimeout(() => {
      navigate('Editor', { template: selectedTemplate });
      setOpening(false);
    }, 80);
  }, [navigate, selectedTemplate]);

  const renderItem = useCallback(
    ({ item }: { item: Template }) => {
      const selected = item.id === selectedId;

      return (
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => setSelectedId(item.id)}
          style={[
            s.thumb,
            { width: cardSize, height: cardSize },
            selected && s.thumbSelected,
          ]}
        >
          <Image
            source={item.image}
            style={s.thumbImg}
            resizeMode="cover" // se não quiser cortar, troca para "contain"
          />

          {selected && (
            <View style={s.check}>
              <Text style={s.checkText}>✓</Text>
            </View>
          )}
        </TouchableOpacity>
      );
    },
    [cardSize, selectedId],
  );

  return (
    <SafeAreaView style={s.safe} edges={['left', 'right', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />

      <View style={[s.header, { paddingTop: topSafe + 12 }]}>
        <Text style={s.title}>Escolha um modelo</Text>
        <Text style={s.subtitle}>Divirta-se • toque para selecionar</Text>
      </View>

      <FlatList
        data={items}
        keyExtractor={it => String(it.id)}
        numColumns={3}
        renderItem={renderItem}
        columnWrapperStyle={{
          justifyContent: 'space-between',
          marginBottom: gap,
        }}
        contentContainerStyle={{
          paddingHorizontal: contentPadding,
          paddingTop: 8,
          paddingBottom: insets.bottom + 120,
        }}
        onEndReached={loadMore}
        onEndReachedThreshold={0.4}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={
          <View style={{ paddingVertical: 10, alignItems: 'center' }}>
            <Loader
              visible={loadingMore}
              text="Carregando"
              fullscreen={false}
            />
          </View>
        }
      />

      <View style={[s.bottomBar, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity
          activeOpacity={0.92}
          onPress={goEditor}
          disabled={!selectedTemplate || opening}
          style={[s.cta, (!selectedTemplate || opening) && s.ctaDisabled]}
        >
          <Text style={s.ctaText}>Começar a criar</Text>
        </TouchableOpacity>
      </View>

      <Loader visible={opening} text="Abrindo..." />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },

  header: { paddingHorizontal: 16, paddingBottom: 8, alignItems: 'center' },
  title: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
  },
  subtitle: {
    color: COLORS.muted,
    fontSize: 14,
    marginTop: 6,
    fontWeight: '600',
    textAlign: 'center',
  },

  // só imagem (sem card/sem footer)
  thumb: {
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: COLORS.imageBg,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  thumbSelected: {
    borderColor: COLORS.red,
  },
  thumbImg: { width: '100%', height: '100%' },

  check: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkText: { color: COLORS.primaryText, fontWeight: '900' },

  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingTop: 10,
    backgroundColor: COLORS.bg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  cta: {
    height: 54,
    borderRadius: 16,
    backgroundColor: COLORS.redDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaDisabled: { opacity: 0.5 },
  ctaText: { color: COLORS.primaryText, fontSize: 16, fontWeight: '900' },
});
