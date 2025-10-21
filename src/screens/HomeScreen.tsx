// src/screens/HomeScreen.tsx
import React, { useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  FlatList,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TEMPLATES, Template } from '../data/templates.local';
import Loader from '../components/Loader';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../routes/Router';

const RED = '#C00021';
const RED_DARK = '#920018';
const WHITE = '#FFFFFF';
const PAGE = 12;

export default function HomeScreen() {
  const { navigate } =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();

  const [items, setItems] = useState<Template[]>(TEMPLATES.slice(0, PAGE));
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // loaders
  const [opening, setOpening] = useState(false); // overlay ao abrir editor
  const [loadingMore, setLoadingMore] = useState(false); // rodapé da lista

  const selectedTemplate = useMemo(
    () =>
      selectedId
        ? items.find(t => t.id === selectedId) ??
          TEMPLATES.find(t => t.id === selectedId)
        : null,
    [items, selectedId],
  );

  const loadMore = useCallback(() => {
    if (loadingMore) return;
    const next = items.length;
    if (next < TEMPLATES.length) {
      setLoadingMore(true);
      // se fosse API, faria await aqui; como é local, só marca e atualiza
      setItems(prev => [...prev, ...TEMPLATES.slice(next, next + PAGE)]);
      setLoadingMore(false);
    }
  }, [items.length, loadingMore]);

  const goEditor = useCallback(() => {
    if (!selectedTemplate) return;
    setOpening(true);
    // se houver preparação assíncrona, faça-a aqui e só depois navegue
    navigate('Editor', { template: selectedTemplate });
    setOpening(false);
  }, [navigate, selectedTemplate]);

  const topSafe = Math.max(
    insets.top,
    Platform.OS === 'android' ? StatusBar.currentHeight ?? 0 : 0,
  );

  const renderItem = ({ item }: { item: Template }) => {
    const selected = item.id === selectedId;
    return (
      <TouchableOpacity
        onPress={() => setSelectedId(item.id)}
        activeOpacity={0.9}
        style={[s.card, selected && s.cardSelected]}
      >
        <Image source={item.image} style={s.cardImg} />
        <View style={s.cardFooter}>
          <Text style={s.cardTitle}>{item.title}</Text>
        </View>
        {selected && (
          <View style={s.check}>
            <Text style={s.checkText}>✓</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />
      <LinearGradient
        colors={[RED, RED_DARK]}
        style={[s.header, { paddingTop: topSafe + 12 }]}
      >
        <Text style={s.appTitle}>Natal Lindo Cartão</Text>
        <TouchableOpacity
          onPress={goEditor}
          disabled={!selectedTemplate}
          activeOpacity={0.9}
          style={[s.cta, !selectedTemplate && s.ctaDisabled]}
        >
          <Text style={s.ctaText}>Começar a Criar</Text>
        </TouchableOpacity>
      </LinearGradient>

      <View style={s.body}>
        <FlatList
          data={items}
          keyExtractor={it => String(it.id)}
          numColumns={2}
          renderItem={renderItem}
          columnWrapperStyle={{ gap: 12 }}
          contentContainerStyle={{
            padding: 16,
            gap: 12,
            paddingBottom: insets.bottom + 8,
          }}
          onEndReached={loadMore}
          onEndReachedThreshold={0.4}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={
            <View style={{ paddingVertical: 12, alignItems: 'center' }}>
              <Loader
                visible={loadingMore}
                text="Carregando"
                fullscreen={false}
              />
            </View>
          }
        />
      </View>

      {/* Overlay global */}
      <Loader visible={opening} text="Abrindo..." />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: WHITE },
  header: { paddingHorizontal: 16, paddingBottom: 12, alignItems: 'center' },
  appTitle: {
    color: WHITE,
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
  },
  cta: {
    backgroundColor: WHITE,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 24,
  },
  ctaDisabled: { opacity: 0.5 },
  ctaText: { color: '#B0001C', fontWeight: '800' },
  body: { flex: 1, backgroundColor: WHITE },
  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#eee',
    position: 'relative',
  },
  cardSelected: {
    borderColor: '#FF002E',
    shadowColor: '#FF405C',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  cardImg: { width: '100%', height: 180, backgroundColor: '#fff' },
  cardFooter: { padding: 8, backgroundColor: '#fff' },
  cardTitle: { color: '#111', fontSize: 14, fontWeight: '700' },
  check: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FF1738',
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkText: { color: WHITE, fontWeight: '900' },
});
