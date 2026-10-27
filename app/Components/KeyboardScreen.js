import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Keyboard } from 'react-native';

export const useKeyboardVisible = () => {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () => setVisible(true));
    const hide = Keyboard.addListener('keyboardDidHide', () => setVisible(false));
    return () => { show.remove(); hide.remove(); };
  }, []);
  return visible;
};

export default function KeyboardScreen({ children, style, offset = 0 }) {
  return (
    <KeyboardAvoidingView
      style={[{ flex: 1 }, style]}
      behavior="padding"            // "padding" on BOTH platforms (edge-to-edge Android)
      keyboardVerticalOffset={offset}
    >
      {children}
    </KeyboardAvoidingView>
  );
}