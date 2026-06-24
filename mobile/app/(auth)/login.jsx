import { Text, Alert } from 'react-native';
import { useState } from 'react';
import { Link, useRouter } from 'expo-router';
import useAuthStore from '../../store/authStore';
import SoundTouchableOpacity from '../../components/common/SoundTouchableOpacity';
import {
  AuthButton,
  AuthFooter,
  AuthHeader,
  AuthInput,
  AuthPanel,
  AuthScreen,
  authStyles,
} from '../../components/common/AuthShell';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading } = useAuthStore();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    const result = await login(email.trim(), password);
    if (!result.success) {
      Alert.alert('Login Failed', result.message);
    } else {
      router.replace('/(tabs)/home');
    }
  };

  return (
    <AuthScreen>
      <AuthPanel>
        <AuthHeader
          title="Welcome Back"
          subtitle="Continue your eco-friendly journey"
        />

        <AuthInput
          label="Email"
          icon="mail-outline"
          placeholder="kayetee@gmail.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <AuthInput
          label="Password"
          icon="lock-closed-outline"
          placeholder="Enter your password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <Link href="/(auth)/forgot-password" asChild>
          <SoundTouchableOpacity style={authStyles.inlineAction}>
            <Text style={authStyles.inlineActionText}>Forgot Password?</Text>
          </SoundTouchableOpacity>
        </Link>

        <AuthButton title="Login" loading={isLoading} onPress={handleLogin} />

        <Link href="/(auth)/register" asChild>
          <SoundTouchableOpacity>
            <AuthFooter text="Don't have an account?" linkText="Register" />
          </SoundTouchableOpacity>
        </Link>
      </AuthPanel>
    </AuthScreen>
  );
}
