import { Modal, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import colors from '../../constants/colors';

export default function RewardModal({
  visible,
  icon = 'trophy',
  iconColor = colors.primary,
  title,
  subtitle,
  children,
  primaryText = 'OK',
  onPrimary,
  primaryDisabled = false,
  secondaryText,
  onSecondary,
  onRequestClose,
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onRequestClose || onPrimary || onSecondary}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={[styles.topAccent, { backgroundColor: iconColor }]} />
          <View style={[styles.glow, { backgroundColor: `${iconColor}18` }]} />
          <View style={[styles.sparkleOne, { backgroundColor: `${iconColor}45` }]} />
          <View style={[styles.sparkleTwo, { backgroundColor: `${iconColor}30` }]} />

          <View style={[
            styles.iconWrap,
            {
              backgroundColor: `${iconColor}1A`,
              borderColor: `${iconColor}35`,
            },
          ]}>
            <Ionicons name={icon} size={38} color={iconColor} />
          </View>

          {!!title && <Text style={styles.title}>{title}</Text>}
          {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}

          {children}

          {!!primaryText && (
            <TouchableOpacity
              style={[
                styles.primaryBtn,
                primaryDisabled && styles.primaryBtnDisabled,
              ]}
              onPress={onPrimary}
              disabled={primaryDisabled}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryText}>{primaryText}</Text>
            </TouchableOpacity>
          )}

          {!!secondaryText && (
            <TouchableOpacity onPress={onSecondary} activeOpacity={0.75}>
              <Text style={styles.secondaryText}>{secondaryText}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(17,24,39,0.62)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 26,
  },
  modal: {
    backgroundColor: colors.bgWhite,
    borderRadius: 28,
    paddingHorizontal: 26,
    paddingTop: 34,
    paddingBottom: 26,
    width: '100%',
    alignItems: 'center',
    gap: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.7)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.2,
    shadowRadius: 26,
    elevation: 10,
  },
  topAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 6,
  },
  glow: {
    position: 'absolute',
    top: -50,
    width: 190,
    height: 190,
    borderRadius: 95,
  },
  sparkleOne: {
    position: 'absolute',
    top: 26,
    left: 30,
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  sparkleTwo: {
    position: 'absolute',
    top: 58,
    right: 34,
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  iconWrap: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    borderWidth: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.textPrimary,
    textAlign: 'center',
    letterSpacing: 0,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 6,
  },
  primaryBtn: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 15,
    paddingHorizontal: 40,
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.22,
    shadowRadius: 12,
    elevation: 4,
  },
  primaryBtnDisabled: {
    backgroundColor: colors.primaryLight,
  },
  primaryText: {
    color: colors.textWhite,
    fontSize: 16,
    fontWeight: '800',
  },
  secondaryText: {
    fontSize: 15,
    color: colors.textSecondary,
    marginTop: 6,
    fontWeight: '600',
  },
});
