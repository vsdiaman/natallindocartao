import React, { useMemo, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  ImageBackground,
  TouchableOpacity,
  Platform,
  Share,
  Alert,
  PermissionsAndroid,
} from 'react-native';
import { RouteProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ViewShot from 'react-native-view-shot';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';

import Loader from '../components/Loader';
import DraggableText from '../components/DraggableText';
import FontPickerModal from '../components/FontPickerModal';
import { AVAILABLE_FONTS, FontOption } from '../generated/fonts';
import { RootStackParamList } from '../routes/Router';

type EditorRouteProp = RouteProp<RootStackParamList, 'Editor'>;
type NavProp = NativeStackNavigationProp<RootStackParamList>;

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

const QUICK_COLORS = [
  '#FFFFFF',
  '#FFCCD5',
  '#FFE29A',
  '#C7F9CC',
  '#CFE8FF',
  '#000000',
  '#FF0000',
  '#00FF00',
  '#0000FF',
] as const;

export default function EditorScreen({ route }: { route: EditorRouteProp }) {
  const navigation = useNavigation<NavProp>();
  const insets = useSafeAreaInsets();

  const template = route?.params?.template;
  const shotRef = useRef<ViewShot | null>(null);

  const [title, setTitle] = useState('Feliz Natal!');
  const [message, setMessage] = useState('Muita paz, saúde e alegria.');
  const [size, setSize] = useState({ w: 0, h: 0 });

  const [activeTarget, setActiveTarget] = useState<'title' | 'message'>(
    'title',
  );
  const [titleColor, setTitleColor] = useState<string>('#FFFFFF');
  const [messageColor, setMessageColor] = useState<string>('#FFFFFF');

  const MIN_SIZE = 10;
  const MAX_SIZE = 64;

  const [titleSize, setTitleSize] = useState<number>(28);
  const [messageSize, setMessageSize] = useState<number>(16);

  const [titleFont, setTitleFont] = useState<string>(
    AVAILABLE_FONTS[0].postscriptName,
  );
  const [messageFont, setMessageFont] = useState<string>(
    AVAILABLE_FONTS[0].postscriptName,
  );

  const [isFontModalVisible, setFontModalVisible] = useState(false);

  const [working, setWorking] = useState(false);

  const topSafe = useMemo(() => {
    const androidTop =
      Platform.OS === 'android' ? StatusBar.currentHeight ?? 0 : 0;
    return Math.max(insets.top, androidTop);
  }, [insets.top]);

  const imgSource = useMemo(() => {
    if (!template?.image) return undefined;
    return typeof template.image === 'string'
      ? { uri: template.image }
      : template.image;
  }, [template?.image]);

  const titlePos = useMemo(
    () => ({ x: size.w * 0.5 - 100, y: size.h * 0.15 }),
    [size.h, size.w],
  );
  const msgPos = useMemo(
    () => ({ x: size.w * 0.5 - 130, y: size.h * 0.3 }),
    [size.h, size.w],
  );

  const selectedSize = activeTarget === 'title' ? titleSize : messageSize;
  const selectedColor = activeTarget === 'title' ? titleColor : messageColor;
  const selectedFont = activeTarget === 'title' ? titleFont : messageFont;

  const selectedFontName = useMemo(() => {
    return (
      AVAILABLE_FONTS.find(f => f.postscriptName === selectedFont)?.name ??
      'Padrão'
    );
  }, [selectedFont]);

  const setSelectedSize = useCallback(
    (value: number) => {
      const clamped = Math.max(MIN_SIZE, Math.min(MAX_SIZE, value));
      if (activeTarget === 'title') setTitleSize(clamped);
      else setMessageSize(clamped);
    },
    [activeTarget],
  );

  const applyQuickColor = useCallback(
    (color: string) => {
      if (activeTarget === 'title') setTitleColor(color);
      else setMessageColor(color);
    },
    [activeTarget],
  );

  const applyFont = useCallback(
    (font: FontOption) => {
      if (activeTarget === 'title') setTitleFont(font.postscriptName);
      else setMessageFont(font.postscriptName);
      setFontModalVisible(false);
    },
    [activeTarget],
  );

  const wait = (ms: number) => new Promise(r => setTimeout(r, ms));

  const withLoader = useCallback(async (task: () => Promise<void>) => {
    try {
      setWorking(true);
      await task();
    } catch (err) {
      console.error(err);
      const msg = err instanceof Error ? err.message : 'Tente novamente.';
      Alert.alert('Ops!', msg);
    } finally {
      setWorking(false);
    }
  }, []);

  const ensureSavePermission = useCallback(async () => {
    if (Platform.OS !== 'android') return true;

    const sdk = Number(Platform.Version);
    let permission: string;

    if (sdk >= 33)
      permission = PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES;
    else if (sdk >= 29)
      permission = PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;
    else permission = PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE;

    const status = await PermissionsAndroid.request(permission, {
      title: 'Permissão para salvar imagens',
      message: 'Precisamos de acesso ao armazenamento para salvar seu cartão.',
      buttonPositive: 'Permitir',
      buttonNegative: 'Cancelar',
    });

    return status === PermissionsAndroid.RESULTS.GRANTED;
  }, []);

  const captureCard = useCallback(async () => {
    await wait(80);
    const uri = await shotRef.current?.capture?.();
    if (!uri) throw new Error('Não foi possível gerar a imagem do cartão.');
    return uri;
  }, []);

  const onSave = useCallback(() => {
    withLoader(async () => {
      const hasPermission = await ensureSavePermission();
      if (!hasPermission) {
        Alert.alert(
          'Ops!',
          'Permissão negada. Vá em Configurações > Apps > Natal Lindo Cartão > Permissões e permita acesso a Fotos/Armazenamento.',
        );
        return;
      }
      const uri = await captureCard();
      await CameraRoll.save(uri, { type: 'photo' });
      Alert.alert('Pronto!', 'Cartão salvo na galeria com sucesso.');
    });
  }, [captureCard, ensureSavePermission, withLoader]);

  const onShare = useCallback(() => {
    withLoader(async () => {
      const uri = await captureCard();
      await Share.share({
        url: uri,
        message:
          'Criei este cartão no app Natal Lindo Cartão. Compartilhe o seu também!',
      });
    });
  }, [captureCard, withLoader]);

  if (!template) {
    return (
      <SafeAreaView
        style={[s.safe, { alignItems: 'center', justifyContent: 'center' }]}
      >
        <Text style={{ color: COLORS.text, fontWeight: '800' }}>
          Template inválido.
        </Text>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ marginTop: 12 }}
        >
          <Text style={{ color: COLORS.muted, fontWeight: '700' }}>Voltar</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />

      {/* Header */}
      <View style={[s.header, { paddingTop: topSafe + 8 }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          activeOpacity={0.9}
          style={s.backBtn}
        >
          <Text style={s.backText}>←</Text>
        </TouchableOpacity>

        <Text style={s.headerTitle}>Editor</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          padding: 16,
          paddingBottom: insets.bottom + 130,
        }}
      >
        {/* Preview */}
        <ViewShot ref={shotRef} options={{ format: 'png', quality: 1 }}>
          <ImageBackground
            source={imgSource}
            style={s.preview}
            imageStyle={s.previewImage}
            onLayout={e =>
              setSize({
                w: e.nativeEvent.layout.width,
                h: e.nativeEvent.layout.height,
              })
            }
          >
            <View style={s.overlay} />

            {size.w > 0 && (
              <>
                <DraggableText
                  key={`t-${size.w}`}
                  initialX={titlePos.x}
                  initialY={titlePos.y}
                  style={[
                    s.previewTitle,
                    {
                      color: titleColor,
                      fontSize: titleSize,
                      lineHeight: titleSize * 1.15,
                      fontFamily: titleFont,
                    },
                  ]}
                >
                  {title}
                </DraggableText>

                <DraggableText
                  key={`m-${size.w}`}
                  initialX={msgPos.x}
                  initialY={msgPos.y}
                  style={[
                    s.previewMessage,
                    {
                      color: messageColor,
                      fontSize: messageSize,
                      lineHeight: messageSize * 1.2,
                      fontFamily: messageFont,
                    },
                  ]}
                >
                  {message}
                </DraggableText>
              </>
            )}
          </ImageBackground>
        </ViewShot>

        {/* Ferramentas (visual) */}
        <View style={s.toolsCard}>
          <Text style={s.sectionTitle}>Ferramentas</Text>
          <View style={s.toolsRow}>
            <View style={s.tool}>
              <Text style={s.toolIcon}>T</Text>
              <Text style={s.toolText}>Texto</Text>
            </View>
            <View style={s.tool}>
              <Text style={s.toolIcon}>☺</Text>
              <Text style={s.toolText}>Figurinhas</Text>
            </View>
            <View style={s.tool}>
              <Text style={s.toolIcon}>▢</Text>
              <Text style={s.toolText}>Molduras</Text>
            </View>
            <View style={s.tool}>
              <Text style={s.toolIcon}>◼</Text>
              <Text style={s.toolText}>Fundo</Text>
            </View>
          </View>
        </View>

        {/* Form */}
        <View style={s.panel}>
          <Text style={s.label}>Título</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Ex.: Feliz Natal!"
            placeholderTextColor={COLORS.muted}
            style={s.input}
          />

          <Text style={s.label}>Mensagem</Text>
          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder="Escreva sua mensagem"
            placeholderTextColor={COLORS.muted}
            style={[s.input, { height: 96 }]}
            multiline
          />

          <View style={s.targetRow}>
            <TouchableOpacity
              onPress={() => setActiveTarget('title')}
              style={[s.segment, activeTarget === 'title' && s.segmentActive]}
              activeOpacity={0.9}
            >
              <Text
                style={[
                  s.segmentText,
                  activeTarget === 'title' && s.segmentTextActive,
                ]}
              >
                Título
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setActiveTarget('message')}
              style={[s.segment, activeTarget === 'message' && s.segmentActive]}
              activeOpacity={0.9}
            >
              <Text
                style={[
                  s.segmentText,
                  activeTarget === 'message' && s.segmentTextActive,
                ]}
              >
                Mensagem
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={s.label}>Cores rápidas</Text>
          <View style={s.colorsRow}>
            {QUICK_COLORS.map(color => {
              const isSelected =
                selectedColor.toLowerCase() === color.toLowerCase();
              return (
                <TouchableOpacity
                  key={color}
                  onPress={() => applyQuickColor(color)}
                  activeOpacity={0.9}
                  style={[
                    s.colorDot,
                    { backgroundColor: color },
                    isSelected && s.colorDotSelected,
                  ]}
                />
              );
            })}
          </View>

          <Text style={s.label}>Fonte</Text>
          <TouchableOpacity
            style={s.fontPickerButton}
            onPress={() => setFontModalVisible(true)}
            activeOpacity={0.9}
          >
            <Text
              style={[s.fontPickerButtonText, { fontFamily: selectedFont }]}
              numberOfLines={1}
            >
              {selectedFontName}
            </Text>
            <Text style={s.fontPickerButtonChevron}>▼</Text>
          </TouchableOpacity>

          <Text style={s.label}>Tamanho</Text>
          <View style={s.sizeRow}>
            <TouchableOpacity
              onPress={() => setSelectedSize(selectedSize - 2)}
              style={s.sizeBtn}
              activeOpacity={0.9}
            >
              <Text style={s.sizeBtnText}>A-</Text>
            </TouchableOpacity>

            <Text style={s.sizeValue}>{Math.round(selectedSize)}</Text>

            <TouchableOpacity
              onPress={() => setSelectedSize(selectedSize + 2)}
              style={s.sizeBtn}
              activeOpacity={0.9}
            >
              <Text style={s.sizeBtnText}>A+</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Bottom actions */}
      <View style={[s.bottomBar, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={onSave}
          disabled={working}
          style={[s.actionGhost, working && { opacity: 0.6 }]}
        >
          <Text style={s.actionGhostText}>Salvar</Text>
        </TouchableOpacity>

        {/* <TouchableOpacity
          activeOpacity={0.9}
          onPress={onShare}
          disabled={working}
          style={[s.actionPrimary, working && { opacity: 0.6 }]}
        >
          <Text style={s.actionPrimaryText}>Compartilhar</Text>
        </TouchableOpacity> */}
      </View>

      <FontPickerModal
        visible={isFontModalVisible}
        fonts={AVAILABLE_FONTS}
        currentFont={selectedFont}
        onSelectFont={applyFont}
        onClose={() => setFontModalVisible(false)}
      />

      <Loader visible={working} text="Processando..." />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },

  header: {
    paddingHorizontal: 16,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: { color: COLORS.text, fontSize: 20, fontWeight: '900' },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '900',
  },

  previewCard: {
    backgroundColor: COLORS.card,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
  },
  preview: { aspectRatio: 3 / 4 },
  previewImage: { resizeMode: 'cover' },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  previewTitle: { textAlign: 'center' },
  previewMessage: { textAlign: 'center' },

  toolsCard: {
    marginTop: 12,
    backgroundColor: COLORS.card,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
  },
  sectionTitle: { color: COLORS.text, fontSize: 14, fontWeight: '900' },
  toolsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  tool: {
    width: '23%',
    height: 86,
    borderRadius: 18,
    backgroundColor: '#EEF1F6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  toolIcon: { color: COLORS.text, fontSize: 22, fontWeight: '900' },
  toolText: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: '800',
    marginTop: 6,
  },

  panel: {
    marginTop: 12,
    backgroundColor: COLORS.card,
    borderRadius: 22,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  label: {
    color: COLORS.text,
    marginBottom: 6,
    fontSize: 12,
    fontWeight: '900',
  },

  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.border,
    color: COLORS.text,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },

  targetRow: { flexDirection: 'row', gap: 10, marginTop: 2, marginBottom: 12 },
  segment: {
    flex: 1,
    height: 40,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  segmentActive: { borderColor: COLORS.primary, backgroundColor: '#EEF1F6' },
  segmentText: { color: COLORS.text, fontSize: 12, fontWeight: '900' },
  segmentTextActive: { color: COLORS.primary },

  colorsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 12,
  },
  colorDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  colorDotSelected: {
    borderWidth: 2,
    borderColor: COLORS.primary,
    transform: [{ scale: 1.05 }],
  },

  fontPickerButton: {
    height: 48,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    paddingHorizontal: 12,
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  fontPickerButtonText: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '800',
    flex: 1,
    paddingRight: 10,
  },
  fontPickerButtonChevron: {
    fontSize: 12,
    color: COLORS.muted,
    fontWeight: '900',
  },

  sizeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 4,
  },
  sizeBtn: {
    height: 40,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  sizeBtnText: { color: COLORS.text, fontSize: 14, fontWeight: '900' },
  sizeValue: {
    minWidth: 36,
    textAlign: 'center',
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '900',
  },

  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingTop: 10,
    flexDirection: 'row',
    gap: 12,
    backgroundColor: COLORS.bg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  actionGhost: {
    flex: 1,
    height: 54,
    borderRadius: 16,
    backgroundColor: COLORS.redDark,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionGhostText: { color: COLORS.bg, fontSize: 16, fontWeight: '900' },
  actionPrimary: {
    flex: 1,
    height: 54,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionPrimaryText: {
    color: COLORS.primaryText,
    fontSize: 16,
    fontWeight: '900',
  },
});
