import { useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
export const paper = '#faf6ed', ink = '#172b4d', amber = '#ad5a00';
export function Button({ label, accessibilityLabel = label, onPress, disabled = false, primary = false }: { label: string; accessibilityLabel?: string; onPress: () => void; disabled?: boolean; primary?: boolean }) {
  const [focused, setFocused] = useState(false);
  return <Pressable accessibilityRole="button" accessibilityLabel={accessibilityLabel} accessibilityState={{ disabled }} disabled={disabled}
    onPress={onPress} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
    style={({ pressed }) => [styles.button, primary && styles.primary, disabled && styles.disabled, focused && styles.focused, pressed && { opacity: 0.8 }]}>
    <Text style={[styles.text, primary && { color: paper }]}>{label}</Text>
  </Pressable>;
}
const styles = StyleSheet.create({
  button: { minHeight: 48, maxWidth: '100%', flexShrink: 1, paddingHorizontal: 16, paddingVertical: 12, borderWidth: 1, borderColor: ink, borderRadius: 4, justifyContent: 'center' },
  text: { color: ink, fontSize: 16, fontWeight: '600', flexShrink: 1 },
  primary: { backgroundColor: amber, borderColor: amber }, disabled: { opacity: 0.45 }, focused: { borderWidth: 3, paddingHorizontal: 14, paddingVertical: 10 },
});
