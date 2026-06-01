import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { colors, spacing, fontSize } from '../theme';
import { loginApi } from '../services/api';
import { saveToken, saveUser } from '../services/auth';

interface Props {
  onLogin: () => void;
}

const ACADEMIC_YEARS = ['2024-2025', '2025-2026', '2026-2027'];

export default function LoginScreen({ onLogin }: Props) {
  const [name, setName] = useState('');
  const [academicYear, setAcademicYear] = useState('');
  const [matricule, setMatricule] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!name.trim() || !academicYear || !matricule.trim()) {
      Alert.alert('خطأ', 'الرجاء إدخال جميع الحقول');
      return;
    }
    setLoading(true);
    try {
      const res = await loginApi(name.trim(), academicYear, matricule.trim());
      await saveToken(res.data.token);
      await saveUser(res.data.user);
      onLogin();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'فشل تسجيل الدخول';
      Alert.alert('خطأ', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>FAR</Text>
          </View>
          <Text style={styles.title}>منصة الدروس العسكرية</Text>
          <Text style={styles.subtitle}>القوات المسلحة الملكية المغربية</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>الاسم الكامل</Text>
          <TextInput
            style={styles.input}
            placeholder="أدخل اسمك الكامل"
            placeholderTextColor={colors.placeholder}
            value={name}
            onChangeText={setName}
            autoCorrect={false}
            textAlign="right"
          />

          <Text style={styles.label}>السنة الدراسية</Text>
          <View style={styles.pickerContainer}>
            {ACADEMIC_YEARS.map((year) => (
              <TouchableOpacity
                key={year}
                style={[
                  styles.yearOption,
                  academicYear === year && styles.yearOptionActive,
                ]}
                onPress={() => setAcademicYear(year)}
              >
                <Text
                  style={[
                    styles.yearOptionText,
                    academicYear === year && styles.yearOptionTextActive,
                  ]}
                >
                  {year}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>المعرف الرقمي (MATRICULE)</Text>
          <TextInput
            style={styles.input}
            placeholder="أدخل رقمك العسكري"
            placeholderTextColor={colors.placeholder}
            value={matricule}
            onChangeText={setMatricule}
            autoCapitalize="characters"
            autoCorrect={false}
            textAlign="right"
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>تسجيل الدخول</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  logoText: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.accent,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    color: colors.accent,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  form: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  label: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginBottom: spacing.xs,
    textAlign: 'right',
  },
  input: {
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 10,
    padding: spacing.md,
    fontSize: fontSize.md,
    color: colors.text,
    marginBottom: spacing.md,
    textAlign: 'right',
  },
  pickerContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: spacing.md,
  },
  yearOption: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    backgroundColor: colors.inputBg,
    alignItems: 'center',
  },
  yearOptionActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '20',
  },
  yearOptionText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  yearOptionTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: fontSize.md,
    fontWeight: '600',
  },
});
