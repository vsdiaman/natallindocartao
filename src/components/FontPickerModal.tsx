// src/components/FontPickerModal.tsx
import React from 'react';
import {
  Modal,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';

// Definindo os tipos das fontes que o componente espera
export interface FontOption {
  name: string;
  postscriptName: string;
}

interface FontPickerModalProps {
  visible: boolean;
  fonts: FontOption[];
  currentFont: string;
  onSelectFont: (font: FontOption) => void;
  onClose: () => void;
}

const RED = '#C00021';
const WHITE = '#FFFFFF';
const GRAY_BORDER = '#E5E7EB';

export default function FontPickerModal({
  visible,
  fonts,
  currentFont,
  onSelectFont,
  onClose,
}: FontPickerModalProps) {
  // Função para renderizar cada item da lista
  const renderFontItem = ({ item }: { item: FontOption }) => {
    const isSelected = currentFont === item.postscriptName;

    return (
      <TouchableOpacity
        style={s.itemContainer}
        onPress={() => onSelectFont(item)}
      >
        <Text
          style={[
            s.itemText,
            { fontFamily: item.postscriptName }, // Aplica a fonte para preview
            isSelected && s.itemTextSelected,
          ]}
        >
          {item.name}
        </Text>
        {isSelected && <Text style={s.checkMark}>✓</Text>}
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={visible}
      onRequestClose={onClose}
    >
      <SafeAreaView style={s.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor={WHITE} />
        {/* Header do Modal */}
        <View style={s.header}>
          <Text style={s.headerTitle}>Escolha uma Fonte</Text>
          <TouchableOpacity onPress={onClose} style={s.closeButton}>
            <Text style={s.closeButtonText}>Fechar</Text>
          </TouchableOpacity>
        </View>

        {/* Lista de Fontes */}
        <FlatList
          data={fonts}
          renderItem={renderFontItem}
          keyExtractor={item => item.postscriptName}
          contentContainerStyle={s.listContainer}
        />
      </SafeAreaView>
    </Modal>
  );
}

const s = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: WHITE,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: GRAY_BORDER,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  closeButton: {
    position: 'absolute',
    right: 16,
  },
  closeButtonText: {
    fontSize: 16,
    color: RED,
    fontWeight: '600',
  },
  listContainer: {
    paddingVertical: 8,
  },
  itemContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: GRAY_BORDER,
  },
  itemText: {
    fontSize: 22,
    color: '#374151',
  },
  itemTextSelected: {
    color: RED,
    fontWeight: '700',
  },
  checkMark: {
    fontSize: 20,
    color: RED,
  },
});
