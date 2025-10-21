// src/screens/EditorScreen.tsx
import React, { useState } from 'react';
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
} from 'react-native';
import { RouteProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Loader from '../components/Loader';
import DraggableText from '../components/DraggableText';
import LinearGradient from 'react-native-linear-gradient';
import { RootStackParamList } from '../routes/Router';
import FontPickerModal from '../components/FontPickerModal';
import { AVAILABLE_FONTS, FontOption } from '../generated/fonts'; // Usando a lista gerada

type EditorRouteProp = RouteProp<RootStackParamList, 'Editor'>;
type NavProp = NativeStackNavigationProp<RootStackParamList>;

const RED = '#C00021',
  RED_DARK = '#920018',
  WHITE = '#FFFFFF';
const GRAY_BORDER = '#E5E7EB',
  GRAY_TEXT = '#6B7280';

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
  const template = route?.params?.template;

  const [title, setTitle] = useState('Feliz Natal!');
  const [message, setMessage] = useState('Muita paz, saúde e alegria.');
  const [size, setSize] = useState({ w: 0, h: 0 });

  const [activeTarget, setActiveTarget] = useState<'title' | 'message'>(
    'title',
  );
  const [titleColor, setTitleColor] = useState<string>(WHITE);
  const [messageColor, setMessageColor] = useState<string>(WHITE);

  const TITLE_SIZE_DEFAULT = 28;
  const MESSAGE_SIZE_DEFAULT = 16;
  const MIN_SIZE = 10;
  const MAX_SIZE = 64;

  const [titleSize, setTitleSize] = useState<number>(TITLE_SIZE_DEFAULT);
  const [messageSize, setMessageSize] = useState<number>(MESSAGE_SIZE_DEFAULT);

  const [titleFont, setTitleFont] = useState<string>(
    AVAILABLE_FONTS[0].postscriptName,
  );
  const [messageFont, setMessageFont] = useState<string>(
    AVAILABLE_FONTS[0].postscriptName,
  );

  // --- MODIFICADO: Estado para controlar o modal de fontes ---
  const [isFontModalVisible, setFontModalVisible] = useState(false);

  const selectedSize = activeTarget === 'title' ? titleSize : messageSize;
  function setSelectedSize(v: number) {
    const clamped = Math.max(MIN_SIZE, Math.min(MAX_SIZE, v));
    if (activeTarget === 'title') setTitleSize(clamped);
    else setMessageSize(clamped);
  }
  const incSize = () => setSelectedSize(selectedSize + 2);
  const decSize = () => setSelectedSize(selectedSize - 2);

  const [working, setWorking] = useState(false);
  const wait = (ms: number) => new Promise(r => setTimeout(r, ms));
  async function withLoader(task: () => Promise<void>) {
    try {
      setWorking(true);
      await task();
    } finally {
      setWorking(false);
    }
  }
  function onSave() {
    withLoader(async () => {
      /* persistir */ await wait(700);
    });
  }
  function onShare() {
    withLoader(async () => {
      /* gerar/compartilhar */ await wait(700);
    });
  }

  const imgSource =
    typeof template?.image === 'string'
      ? { uri: template.image }
      : template?.image;

  const titlePos = { x: size.w * 0.5 - 100, y: size.h * 0.15 };
  const msgPos = { x: size.w * 0.5 - 130, y: size.h * 0.3 };

  function applyQuickColor(color: string) {
    if (activeTarget === 'title') setTitleColor(color);
    else setMessageColor(color);
  }
  const selectedColor = activeTarget === 'title' ? titleColor : messageColor;

  // --- MODIFICADO: Lógica para aplicar a fonte vinda do modal ---
  const selectedFont = activeTarget === 'title' ? titleFont : messageFont;
  function applyFont(font: FontOption) {
    if (activeTarget === 'title') {
      setTitleFont(font.postscriptName);
    } else {
      setMessageFont(font.postscriptName);
    }
    setFontModalVisible(false); // Fecha o modal
  }
  // Pega o nome amigável da fonte para exibir no botão
  const selectedFontName =
    AVAILABLE_FONTS.find(f => f.postscriptName === selectedFont)?.name ||
    'Padrão';

  const insets = useSafeAreaInsets();
  const topSafe = Math.max(
    insets.top,
    Platform.OS === 'android' ? StatusBar.currentHeight ?? 0 : 0,
  );

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      {/* Header */}
      <View style={[s.header, { paddingTop: topSafe + 8 }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Text style={s.back}>{'←'}</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>Editar Cartão</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={[
          s.scroll,
          { paddingBottom: insets.bottom + 12 },
        ]}
      >
        {/* Preview */}
        <LinearGradient colors={[RED, RED_DARK]} style={s.previewWrap}>
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
                      fontFamily: titleFont, // Aplica a fonte do título
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
                      fontFamily: messageFont, // Aplica a fonte da mensagem
                    },
                  ]}
                >
                  {message}
                </DraggableText>
              </>
            )}
          </ImageBackground>
        </LinearGradient>

        {/* Form UI */}
        <View style={s.panel}>
          {/* ... Título, Mensagem, Segmento ... */}
          <Text style={s.label}>Título</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Ex.: Feliz Natal!"
            placeholderTextColor={GRAY_TEXT}
            style={s.input}
          />

          <Text style={s.label}>Mensagem</Text>
          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder="Escreva sua mensagem"
            placeholderTextColor={GRAY_TEXT}
            style={[s.input, { height: 96 }]}
            multiline
          />

          <View style={s.targetRow}>
            <TouchableOpacity
              onPress={() => setActiveTarget('title')}
              style={[s.segment, activeTarget === 'title' && s.segmentActive]}
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

          {/* Paleta rápida */}
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

          {/* --- MODIFICADO: Botão para abrir o modal de fontes --- */}
          <Text style={s.label}>Fonte</Text>
          <TouchableOpacity
            style={s.fontPickerButton}
            onPress={() => setFontModalVisible(true)}
          >
            <Text
              style={[s.fontPickerButtonText, { fontFamily: selectedFont }]}
            >
              {selectedFontName}
            </Text>
            <Text style={s.fontPickerButtonChevron}>▼</Text>
          </TouchableOpacity>

          {/* Tamanho */}
          <Text style={s.label}>Tamanho</Text>
          <View style={s.sizeRow}>
            <TouchableOpacity
              onPress={decSize}
              style={s.sizeBtn}
              activeOpacity={0.9}
            >
              <Text style={s.sizeBtnText}>A-</Text>
            </TouchableOpacity>
            <Text style={s.sizeValue}>{Math.round(selectedSize)}</Text>
            <TouchableOpacity
              onPress={incSize}
              style={s.sizeBtn}
              activeOpacity={0.9}
            >
              <Text style={s.sizeBtnText}>A+</Text>
            </TouchableOpacity>
          </View>

          <View style={s.actions}>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={onSave}
              disabled={working}
              style={[s.btn, working && { opacity: 0.6 }]}
            >
              <LinearGradient colors={[RED, RED_DARK]} style={s.btnInner}>
                <Text style={s.btnText}>Salvar</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={onShare}
              disabled={working}
              style={[s.btnGhost, working && { opacity: 0.6 }]}
            >
              <Text style={s.btnGhostText}>Compartilhar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* --- ADICIONADO: Renderiza o Modal --- */}
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
  // ... (Todos os seus estilos existentes, como safe, header, etc.)
  safe: { flex: 1, backgroundColor: WHITE },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: RED,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: RED_DARK,
  },
  back: { color: WHITE, fontSize: 20, width: 24, textAlign: 'left' },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: WHITE,
    fontSize: 20,
    fontWeight: '700',
  },
  scroll: { padding: 16 },
  previewWrap: { borderRadius: 16, padding: 8 },
  preview: { aspectRatio: 3 / 4, borderRadius: 12, overflow: 'hidden' },
  previewImage: { resizeMode: 'cover', borderRadius: 12 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  previewTitle: { textAlign: 'center' },
  previewMessage: { textAlign: 'center' },

  panel: {
    marginTop: 16,
    backgroundColor: WHITE,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: GRAY_BORDER,
  },
  label: { color: RED, marginBottom: 6, fontSize: 12, fontWeight: '700' },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: GRAY_BORDER,
    color: '#111827',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  targetRow: { flexDirection: 'row', gap: 8, marginTop: 4, marginBottom: 10 },
  segment: {
    flex: 1,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: GRAY_BORDER,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  segmentActive: { borderColor: RED, backgroundColor: '#FFE5EA' },
  segmentText: { color: '#111827', fontSize: 12, fontWeight: '700' },
  segmentTextActive: { color: RED },

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
    borderColor: GRAY_BORDER,
  },
  colorDotSelected: {
    borderWidth: 2,
    borderColor: RED,
    transform: [{ scale: 1.05 }],
  },

  // --- MODIFICADO: Estilos para o novo botão de fonte ---
  fontPickerButton: {
    height: 48,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: GRAY_BORDER,
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  fontPickerButtonText: {
    fontSize: 18,
    color: '#111827',
  },
  fontPickerButtonChevron: {
    fontSize: 12,
    color: GRAY_TEXT,
  },

  // tamanho
  sizeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  sizeBtn: {
    height: 36,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: GRAY_BORDER,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  sizeBtnText: { color: '#111827', fontSize: 14, fontWeight: '800' },
  sizeValue: {
    minWidth: 36,
    textAlign: 'center',
    color: '#111827',
    fontSize: 14,
    fontWeight: '700',
  },

  actions: { flexDirection: 'row', gap: 12, marginTop: 8 },
  btn: { flex: 1 },
  btnInner: {
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: { color: WHITE, fontSize: 16, fontWeight: '800' },
  btnGhost: {
    height: 48,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: RED,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnGhostText: { color: RED, fontSize: 16, fontWeight: '800' },
});
