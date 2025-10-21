// src/components/DraggableText.tsx
import React from 'react';
import { Text, TextStyle, StyleProp } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

type Props = {
  children: string;
  initialX: number;
  initialY: number;
  style: StyleProp<TextStyle>; // <- aceita array
};

export default function DraggableText({
  children,
  initialX,
  initialY,
  style,
}: Props) {
  const x = useSharedValue(initialX);
  const y = useSharedValue(initialY);
  const sx = useSharedValue(0);
  const sy = useSharedValue(0);

  const pan = Gesture.Pan()
    .onStart(() => {
      sx.value = x.value;
      sy.value = y.value;
    })
    .onUpdate(e => {
      x.value = sx.value + e.translationX;
      y.value = sy.value + e.translationY;
    })
    .onEnd(() => {
      x.value = withSpring(x.value, { damping: 15 });
      y.value = withSpring(y.value, { damping: 15 });
    });

  const aStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }, { translateY: y.value }],
  }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[{ position: 'absolute' }, aStyle]}>
        <Text style={style}>{children}</Text>
      </Animated.View>
    </GestureDetector>
  );
}
