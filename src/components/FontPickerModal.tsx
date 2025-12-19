import React, { useCallback } from 'react';
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

const COLORS = {
  bg: '#F5F6F8',
  card: '#FFFFFF',
  text: '#111827',
  muted: '#6B7280',
  border: '#E5E7EB',
  primary: '#141419',
};

export default function FontPickerModal({
  visible,
  fonts,
  currentFont,
  onSelectFont,
  onClose,
}: FontPickerModalProps) {
  const renderFontItem = useCallback(
    ({ item }: { item: FontOption }) => {
      const selected = currentFont === item.postscriptName;

      return (
        <TouchableOpacity
          style={[s.item, selected && s.itemSelected]}
          onPress={() => onSelectFont(item)}
          activeOpacity={0.9}
        >
          <Text
            style={[
              s.itemText,
              { fontFamily: item.postscriptName },
              selected && s.itemTextSelected,
            ]}
            numberOfLines={1}
          >
            {item.name}
          </Text>
          {selected && <Text style={s.check}>✓</Text>}
        </TouchableOpacity>
      );
    },
    [currentFont, onSelectFont],
  );

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={visible}
      onRequestClose={onClose}
    >
      <SafeAreaView style={s.safe}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />

        <View style={s.header}>
          <TouchableOpacity
            onPress={onClose}
            style={s.headerBtn}
            activeOpacity={0.9}
          >
            <Text style={s.headerBtnText}>←</Text>
          </TouchableOpacity>

          <Text style={s.headerTitle}>Escolha uma fonte</Text>
          <View style={{ width: 44 }} />
        </View>

        <FlatList
          data={fonts}
          renderItem={renderFontItem}
          keyExtractor={item => item.postscriptName}
          contentContainerStyle={{ padding: 16, gap: 10 }}
          showsVerticalScrollIndicator={false}
        />
      </SafeAreaView>
    </Modal>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },

  header: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerBtnText: { color: COLORS.text, fontSize: 18, fontWeight: '900' },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '900',
  },

  item: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemSelected: { borderColor: COLORS.primary, borderWidth: 2 },
  itemText: {
    fontSize: 18,
    color: COLORS.text,
    fontWeight: '800',
    flex: 1,
    paddingRight: 12,
  },
  itemTextSelected: { color: COLORS.primary },
  check: { fontSize: 18, color: COLORS.primary, fontWeight: '900' },
});
