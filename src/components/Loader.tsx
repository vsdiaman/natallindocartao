// src/components/Loader.tsx
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  StyleSheet,
  Text,
  View,
} from 'react-native';

type LoaderProps = {
  visible: boolean;
  text?: string;
  fullscreen?: boolean; // overlay absoluto
  dimOpacity?: number; // 0..1 (fundo escurecido)
  spinnerColor?: string; // cor do ActivityIndicator
  blockTouch?: boolean; // bloqueia toques no overlay
  testID?: string;
};

export default function Loader({
  visible,
  text,
  fullscreen = true,
  dimOpacity = 0.25,
  spinnerColor,
  blockTouch = true,
  testID = 'loader',
}: LoaderProps) {
  const fade = useRef(new Animated.Value(visible ? 1 : 0)).current;
  const [rendered, setRendered] = useState(visible);

  useEffect(() => {
    if (visible) setRendered(true);
    Animated.timing(fade, {
      toValue: visible ? 1 : 0,
      duration: 180,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start(() => {
      if (!visible) setRendered(false);
    });
  }, [visible, fade]);

  if (!rendered) return null;

  const color = spinnerColor ?? (fullscreen ? '#FFFFFF' : '#C00021');

  if (!fullscreen) {
    return (
      <View style={s.inline} testID={testID}>
        <ActivityIndicator size="small" color={color} />
        {text ? <Text style={s.inlineText}>{text}</Text> : null}
      </View>
    );
  }

  return (
    <Animated.View
      testID={testID}
      pointerEvents={blockTouch ? 'auto' : 'none'}
      style={[s.overlay, { opacity: fade }]}
    >
      <View style={[s.dim, { opacity: dimOpacity }]} />
      <View style={s.box}>
        <ActivityIndicator size="large" color={color} />
        {text ? <Text style={s.boxText}>{text}</Text> : null}
      </View>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  // overlay
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
  },
  box: {
    minWidth: 140,
    minHeight: 120,
    padding: 16,
    borderRadius: 14,
    backgroundColor: 'rgba(20,20,20,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxText: { color: '#fff', marginTop: 8, fontSize: 14, fontWeight: '600' },

  // inline
  inline: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  inlineText: { fontSize: 14, color: '#111827' },
});
