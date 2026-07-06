import { Image, Modal, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import colors from '../../constants/colors';
import { getImageUrl } from '../../utils/imageUrl';
import SoundTouchableOpacity from '../common/SoundTouchableOpacity';

export default function GiftDetailModal({
  gift,
  visible,
  claiming,
  onClose,
  onClaim,
}) {
  if (!gift) return null;

  const rewardType = gift.type === 'completion'
    ? 'Completion Reward'
    : `Top ${gift.top_value} Ranking Reward`;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <SoundTouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Ionicons name="close" size={22} color={colors.textPrimary} />
          </SoundTouchableOpacity>

          <View style={styles.badgeFrame}>
            {gift.badge_image ? (
              <Image
                source={{ uri: getImageUrl(gift.badge_image) }}
                style={styles.badgeImage}
                resizeMode="contain"
              />
            ) : (
              <View style={styles.badgeFallback}>
                <Ionicons name="ribbon" size={62} color={colors.xpColor} />
              </View>
            )}
          </View>

          <Text style={styles.challengeName} numberOfLines={2}>
            {gift.challenge_name}
          </Text>

          <View style={styles.rewardTypePill}>
            <Ionicons
              name={gift.type === 'completion' ? 'checkmark-circle-outline' : 'trophy-outline'}
              size={15}
              color={gift.type === 'completion' ? colors.success : colors.xpColor}
            />
            <Text style={styles.rewardTypeText}>{rewardType}</Text>
          </View>

          {!!gift.badge_name && (
            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <Ionicons name="ribbon-outline" size={17} color={colors.xpColor} />
              </View>
              <View style={styles.detailCopy}>
                <Text style={styles.detailLabel}>Badge</Text>
                <Text style={styles.detailValue}>{gift.badge_name}</Text>
              </View>
            </View>
          )}

          {gift.xp_reward > 0 && (
            <View style={styles.detailRow}>
              <View style={[styles.detailIcon, styles.xpIcon]}>
                <Ionicons name="flash" size={17} color={colors.xpColor} />
              </View>
              <View style={styles.detailCopy}>
                <Text style={styles.detailLabel}>XP Reward</Text>
                <Text style={styles.xpValue}>+{gift.xp_reward} XP</Text>
              </View>
            </View>
          )}

          <SoundTouchableOpacity
            style={[styles.claimBtn, claiming && styles.claimBtnDisabled]}
            onPress={() => onClaim(gift)}
            disabled={claiming}
          >
            <Text style={styles.claimBtnText}>
              {claiming ? 'Claiming...' : 'Claim Reward'}
            </Text>
          </SoundTouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.52)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: '100%',
    maxWidth: 350,
    backgroundColor: colors.bgWhite,
    borderRadius: 24,
    paddingHorizontal: 22,
    paddingTop: 28,
    paddingBottom: 22,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 22,
    elevation: 10,
  },
  closeBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.bgGrey,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  badgeFrame: {
    width: 136,
    height: 136,
    borderRadius: 68,
    backgroundColor: colors.xpBg,
    borderWidth: 1,
    borderColor: '#fde68a',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  badgeImage: {
    width: 112,
    height: 112,
  },
  badgeFallback: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: colors.bgWhite,
    alignItems: 'center',
    justifyContent: 'center',
  },
  challengeName: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '900',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 10,
  },
  rewardTypePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: 999,
    backgroundColor: colors.primaryBg,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 16,
  },
  rewardTypeText: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.primary,
  },
  detailRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.bgLight,
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  detailIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#fffbeb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  xpIcon: {
    backgroundColor: colors.xpBg,
  },
  detailCopy: {
    flex: 1,
    minWidth: 0,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary,
    lineHeight: 20,
  },
  xpValue: {
    fontSize: 17,
    fontWeight: '900',
    color: colors.xpColor,
  },
  claimBtn: {
    width: '100%',
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    paddingVertical: 15,
    marginTop: 6,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.22,
    shadowRadius: 12,
    elevation: 4,
  },
  claimBtnDisabled: {
    backgroundColor: colors.primaryLight,
  },
  claimBtnText: {
    color: colors.textWhite,
    fontSize: 16,
    fontWeight: '800',
  },
});
