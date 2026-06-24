import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../constants/colors';
import images from '../../constants/images';
import SoundTouchableOpacity from './SoundTouchableOpacity';

export function AuthScreen({ children, scroll = false, compact = false, contentStyle }) {
  const Content = scroll ? ScrollView : View;
  const contentProps = scroll
    ? {
        style: styles.scroll,
        contentContainerStyle: [
          styles.content,
          compact && styles.contentCompact,
          styles.scrollContent,
          contentStyle,
        ],
        keyboardShouldPersistTaps: 'handled',
        showsVerticalScrollIndicator: false,
      }
    : { style: [styles.content, compact && styles.contentCompact, contentStyle] };

  return (
    <KeyboardAvoidingView
      style={styles.keyboard}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.topBand} />
        <View style={styles.bottomBand} />
        <Content {...contentProps}>{children}</Content>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

export function AuthPanel({ children, compact = false }) {
  return <View style={[styles.panel, compact && styles.panelCompact]}>{children}</View>;
}

export function AuthHeader({ title, subtitle, compact = false }) {
  return (
    <View style={[styles.header, compact && styles.headerCompact]}>
      <View style={[styles.logoWrap, compact && styles.logoWrapCompact]}>
        <Image
          source={images.logo}
          style={[styles.logo, compact && styles.logoCompact]}
          resizeMode="contain"
        />
      </View>
      <Text style={[styles.appName, compact && styles.appNameCompact]}>LetzECO</Text>
      <Text style={[styles.title, compact && styles.titleCompact]}>{title}</Text>
      {!!subtitle && (
        <Text style={[styles.subtitle, compact && styles.subtitleCompact]}>
          {subtitle}
        </Text>
      )}
    </View>
  );
}

export function AuthInput({
  label,
  icon,
  inputStyle,
  containerStyle,
  compact = false,
  ...props
}) {
  return (
    <View style={[styles.field, compact && styles.fieldCompact, containerStyle]}>
      <Text style={[styles.label, compact && styles.labelCompact]}>{label}</Text>
      <View style={[styles.inputShell, compact && styles.inputShellCompact]}>
        {!!icon && (
          <Ionicons
            name={icon}
            size={compact ? 17 : 19}
            color={colors.primaryDark}
            style={styles.inputIcon}
          />
        )}
        <TextInput
          style={[styles.input, compact && styles.inputCompact, inputStyle]}
          placeholderTextColor={colors.textLight}
          {...props}
        />
      </View>
    </View>
  );
}

export function AuthButton({
  title,
  loading,
  disabled,
  children,
  style,
  compact = false,
  ...props
}) {
  return (
    <SoundTouchableOpacity
      style={[
        styles.button,
        compact && styles.buttonCompact,
        (disabled || loading) && styles.buttonDisabled,
        style,
      ]}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={colors.textWhite} />
      ) : (
        children || (
          <Text style={[styles.buttonText, compact && styles.buttonTextCompact]}>
            {title}
          </Text>
        )
      )}
    </SoundTouchableOpacity>
  );
}

export function AuthFooter({ text, linkText, compact = false, children }) {
  return (
    <View style={[styles.footer, compact && styles.footerCompact]}>
      <Text style={styles.footerText}>{text} </Text>
      {children || <Text style={styles.footerLink}>{linkText}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  keyboard: {
    flex: 1,
    backgroundColor: '#edf9ef',
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#edf9ef',
  },
  topBand: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 260,
    backgroundColor: '#ddf7e4',
    borderBottomLeftRadius: 44,
    borderBottomRightRadius: 44,
  },
  bottomBand: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 190,
    backgroundColor: '#f8fcf4',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 22,
    paddingVertical: 24,
  },
  contentCompact: {
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  panel: {
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
    backgroundColor: colors.bgWhite,
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 24,
    borderWidth: 1,
    borderColor: '#d9f2df',
    shadowColor: '#14532d',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 5,
  },
  panelCompact: {
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  headerCompact: {
    marginBottom: 14,
  },
  logoWrap: {
    width: 78,
    height: 78,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f7fee7',
    borderWidth: 1,
    borderColor: '#dcfce7',
    marginBottom: 8,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 3,
  },
  logoWrapCompact: {
    width: 62,
    height: 62,
    borderRadius: 18,
    marginBottom: 6,
  },
  logo: {
    width: 62,
    height: 62,
    borderRadius: 16,
  },
  logoCompact: {
    width: 50,
    height: 50,
    borderRadius: 14,
  },
  appName: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: 22,
  },
  appNameCompact: {
    fontSize: 24,
    marginBottom: 14,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  titleCompact: {
    fontSize: 25,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 21,
    color: colors.textSecondary,
    marginTop: 7,
    textAlign: 'center',
  },
  subtitleCompact: {
    fontSize: 14,
    lineHeight: 19,
    marginTop: 5,
  },
  field: {
    marginBottom: 14,
  },
  fieldCompact: {
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  labelCompact: {
    marginBottom: 6,
  },
  inputShell: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#dfeee4',
    borderRadius: 16,
    backgroundColor: '#fbfdfb',
    paddingHorizontal: 14,
  },
  inputShellCompact: {
    minHeight: 48,
    borderRadius: 14,
    paddingHorizontal: 13,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    minHeight: 52,
    paddingVertical: 0,
    fontSize: 15,
    color: colors.textPrimary,
  },
  inputCompact: {
    minHeight: 46,
    fontSize: 14,
  },
  otpInput: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 8,
    textAlign: 'center',
  },
  button: {
    minHeight: 54,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    marginTop: 6,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 4,
  },
  buttonCompact: {
    minHeight: 50,
    borderRadius: 15,
    marginTop: 4,
  },
  buttonDisabled: {
    backgroundColor: colors.primaryLight,
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    color: colors.textWhite,
    fontSize: 16,
    fontWeight: '800',
  },
  buttonTextCompact: {
    fontSize: 15,
  },
  footer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 22,
  },
  footerCompact: {
    marginTop: 14,
  },
  footerText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  footerLink: {
    fontSize: 14,
    color: colors.primaryDark,
    fontWeight: '800',
  },
  inlineAction: {
    alignSelf: 'flex-end',
    paddingVertical: 6,
    paddingLeft: 12,
    marginTop: -6,
    marginBottom: 6,
  },
  inlineActionText: {
    color: colors.primaryDark,
    fontSize: 14,
    fontWeight: '700',
  },
  secondaryAction: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    marginTop: 10,
  },
  secondaryActionText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '700',
  },
});

export const authStyles = styles;
