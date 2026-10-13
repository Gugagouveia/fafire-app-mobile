import React from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
export const colors = {
  bg: '#F5F6FA',
  ink: '#17233B',
  muted: '#5E6A80',
  primary: '#4055D8',
  light: '#EEF0FF',
  border: '#DDE2EF',
  green: '#23734F',
  red: '#B3263C',
};
export const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.bg },
  content: {
    width: '100%',
    maxWidth: 760,
    alignSelf: 'center',
    padding: 22,
    paddingBottom: 36,
    gap: 18,
  },
  title: { fontSize: 29, fontWeight: '800', color: colors.ink, letterSpacing: -0.6 },
  subtitle: { fontSize: 15, lineHeight: 23, color: colors.muted },
  label: { fontSize: 14, fontWeight: '600', color: colors.ink },
  card: {
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, flexWrap: 'wrap' },
  section: { fontSize: 19, fontWeight: '700', color: colors.ink },
  input: {
    minHeight: 50,
    backgroundColor: '#FFF',
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.ink,
  },
  button: {
    minHeight: 50,
    paddingHorizontal: 18,
    paddingVertical: 13,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    backgroundColor: colors.primary,
  },
  buttonText: { color: '#FFF', fontWeight: '700', fontSize: 15 },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    minHeight: 44,
    borderRadius: 24,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: colors.border,
  },
  error: { backgroundColor: '#FCECEF', borderRadius: 12, padding: 14 },
  errorText: { color: colors.red, lineHeight: 22 },
});
export function Page({ children, scroll = true }: { children: React.ReactNode; scroll?: boolean }) {
  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.page}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {scroll ? (
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
            {children}
          </ScrollView>
        ) : (
          <View style={[styles.content, { flex: 1 }]}>{children}</View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
export function Heading({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <View style={{ gap: 7 }}>
      <Text accessibilityRole="header" style={styles.title}>
        {title}
      </Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
}
export function Button({
  title,
  onPress,
  busy,
  secondary,
  danger,
  icon,
}: {
  title: string;
  onPress: () => void;
  busy?: boolean;
  secondary?: boolean;
  danger?: boolean;
  icon?: React.ComponentProps<typeof Ionicons>['name'];
}) {
  const color = secondary ? colors.primary : '#FFF';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: !!busy }}
      disabled={busy}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        secondary && { backgroundColor: colors.light },
        danger && { backgroundColor: colors.red },
        { opacity: pressed || busy ? 0.65 : 1 },
      ]}
    >
      {busy ? (
        <ActivityIndicator color={color} />
      ) : (
        <>
          {icon && <Ionicons name={icon} size={20} color={color} />}
          <Text style={[styles.buttonText, { color }]}>{title}</Text>
        </>
      )}
    </Pressable>
  );
}
export function Field({ label, ...props }: TextInputProps & { label: string }) {
  return (
    <View style={{ gap: 8 }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={colors.muted}
        style={[styles.input, props.multiline && { minHeight: 110, textAlignVertical: 'top' }]}
        {...props}
      />
    </View>
  );
}
export function ErrorMessage({ message }: { message: string }) {
  return message ? (
    <View accessibilityLiveRegion="polite" style={styles.error}>
      <Text style={styles.errorText}>{message}</Text>
    </View>
  ) : null;
}
export function Empty({
  icon = 'leaf-outline',
  title,
  body,
}: {
  icon?: React.ComponentProps<typeof Ionicons>['name'];
  title: string;
  body: string;
}) {
  return (
    <View style={[styles.card, { alignItems: 'center', paddingVertical: 35 }]}>
      <Ionicons name={icon} size={38} color={colors.primary} />
      <Text style={styles.section}>{title}</Text>
      <Text style={[styles.subtitle, { textAlign: 'center' }]}>{body}</Text>
    </View>
  );
}
export function Chip({
  title,
  active,
  onPress,
}: {
  title: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={[
        styles.chip,
        active && { backgroundColor: colors.primary, borderColor: colors.primary },
      ]}
    >
      <Text style={{ color: active ? '#FFF' : colors.muted, fontWeight: '600' }}>{title}</Text>
    </Pressable>
  );
}
export function message(error: unknown) {
  return error instanceof Error ? error.message : 'Não foi possível concluir. Tente novamente.';
}
