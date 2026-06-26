import { Image, Modal, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SoundTouchableOpacity from '../../common/SoundTouchableOpacity';
import { getImageUrl } from '../../../utils/imageUrl';
import colors from '../../../constants/colors';

export default function ChallengeRewardModal({ reward, onClose }) {
  if (!reward) return null;

  const rewardLabel = reward.type === 'ranking'
    ? `Top ${reward.top_value} Ranking Reward`
    : 'Completion Reward';

  return (
    <Modal
      visible={!!reward}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <SoundTouchableOpacity style={styles.modalClose} onPress={onClose}>
            <Ionicons name="close" size={22} color={colors.textPrimary} />
          </SoundTouchableOpacity>

          <View style={styles.modalBadgeWrap}>
            {reward.badge_image ? (
              <Image
                source={{ uri: getImageUrl(reward.badge_image) }}
                style={styles.modalBadgeImage}
                resizeMode="contain"
              />
            ) : (
              <View style={styles.modalBadgeFallback}>
                <Ionicons name="ribbon" size={70} color={colors.primary} />
              </View>
            )}
          </View>

          <Text style={styles.modalRewardType}>{rewardLabel}</Text>
          <Text style={styles.modalBadgeName} numberOfLines={3}>
            {reward.badge_name || 'Special Badge'}
          </Text>
          {reward.xp_reward > 0 && (
            <View style={styles.modalXpPill}>
              <Ionicons name="flash" size={15} color={colors.xpColor} />
              <Text style={styles.modalXpText}>+{reward.xp_reward} XP</Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.48)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    backgroundColor: colors.bgWhite,
    borderRadius: 22,
    paddingHorizontal: 22,
    paddingTop: 28,
    paddingBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 8,
  },
  modalClose: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bgGrey,
    zIndex: 2,
  },
  modalBadgeWrap: {
    width: 148,
    height: 148,
    borderRadius: 74,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryBg,
    borderWidth: 1,
    borderColor: colors.primaryLight,
    marginBottom: 16,
  },
  modalBadgeImage: {
    width: 126,
    height: 126,
  },
  modalBadgeFallback: {
    width: 126,
    height: 126,
    borderRadius: 63,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bgWhite,
  },
  modalRewardType: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.primary,
    backgroundColor: colors.primaryBg,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 10,
    overflow: 'hidden',
  },
  modalBadgeName: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.textPrimary,
    textAlign: 'center',
    lineHeight: 28,
  },
  modalXpPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.xpBg,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 7,
    marginTop: 14,
  },
  modalXpText: {
    fontSize: 15,
    fontWeight: '900',
    color: colors.xpColor,
  },
});
