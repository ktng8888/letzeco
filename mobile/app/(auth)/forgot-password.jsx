import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
  ActivityIndicator, Alert, Image
} from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import authService from '../../services/authService';
import colors from '../../constants/colors';
import images from '../../constants/images';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('email'); // 'email' | 'otp'
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSendOtp = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email.');
      return;
    }
    setIsLoading(true);
    try {
      await authService.forgotPassword(email.trim());
      setStep('otp');
      Alert.alert('OTP Sent', 'Check your email. Code expires in 5 minutes.');
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to send OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleValidateOtp = async () => {
    if (!otp || otp.length !== 6) {
      Alert.alert('Error', 'Please enter the 6-digit OTP.');
      return;
    }
    setIsLoading(true);
    try {
      await authService.validateOtp(email.trim(), otp);
      // Go to reset password with email + otp
      router.push({
        pathname: '/(auth)/reset-password',
        params: { email: email.trim(), otp }
      });
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Invalid OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.inner}>

        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={images.logo}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.appName}>LetzECO</Text>
        </View>

        <Text style={styles.title}>Forgot Password</Text>

        {step === 'email' ? (
          <>
            <Text style={styles.subtitle}>
              Enter your email to receive an OTP
            </Text>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="kayetee@gmail.com"
              placeholderTextColor={colors.textLight}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={[styles.btn, isLoading && styles.btnDisabled]}
              onPress={handleSendOtp}
              disabled={isLoading}
            >
              {isLoading
                ? <ActivityIndicator color={colors.textWhite} />
                : <Text style={styles.btnText}>Send OTP</Text>
              }
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.subtitle}>
              OTP sent to {email}, please enter within 5 minutes
            </Text>
            <Text style={styles.label}>OTP</Text>
            <TextInput
              style={[styles.input, styles.otpInput]}
              placeholder="123456"
              placeholderTextColor={colors.textLight}
              value={otp}
              onChangeText={setOtp}
              keyboardType="number-pad"
              maxLength={6}
            />
            <TouchableOpacity
              style={[styles.btn, isLoading && styles.btnDisabled]}
              onPress={handleValidateOtp}
              disabled={isLoading}
            >
              {isLoading
                ? <ActivityIndicator color={colors.textWhite} />
                : <Text style={styles.btnText}>Validate OTP</Text>
              }
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.resendBtn}
              onPress={handleSendOtp}
              disabled={isLoading}
            >
              <Text style={styles.resendText}>Resend OTP</Text>
            </TouchableOpacity>
          </>
        )}

        {/* Back to Login */}
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
        >
          <Text style={styles.backText}>← Back to Login</Text>
        </TouchableOpacity>

      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgWhite,
  },
  inner: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    width: 72,
    height: 72,
  },
  appName: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.primary,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 15,
    color: colors.textPrimary,
    backgroundColor: colors.bgLight,
    marginBottom: 16,
  },
  otpInput: {
    fontSize: 24,
    letterSpacing: 8,
    textAlign: 'center',
  },
  btn: {
    height: 50,
    backgroundColor: colors.primary,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  btnDisabled: { backgroundColor: colors.primaryLight },
  btnText: {
    color: colors.textWhite,
    fontSize: 16,
    fontWeight: '700',
  },
  resendBtn: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  resendText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  backBtn: {
    alignItems: 'center',
    marginTop: 24,
  },
  backText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
});