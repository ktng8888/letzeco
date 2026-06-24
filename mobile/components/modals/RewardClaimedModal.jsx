import { View, Text, Image, StyleSheet } from 'react-native';

import colors from '../../constants/colors';
import { getImageUrl } from '../../utils/imageUrl';
import RewardModal from './RewardModal';

export default function RewardClaimedModal({ visible, result, onClose }) {
  return (
    <RewardModal
      visible={visible}
      icon="checkmark-circle"
      iconColor={colors.primary}
      title="Reward Claimed!"
      primaryText="Awesome!"
      onPrimary={onClose}
      onRequestClose={onClose}
    >
      {result?.xp_reward > 0 && (
        <View style={styles.rewardCard}>
          <Text style={styles.rewardLabel}>Collected</Text>
          <Text style={styles.xp}>+{result.xp_reward} XP</Text>
        </View>
      )}
      {result?.badge_image && (
        <View style={styles.badgeArtFrame}>
          <View style={styles.badgeHalo} />
          <Image
            source={{ uri: getImageUrl(result.badge_image) }}
            style={styles.badgeImage}
            resizeMode="contain"
          />
        </View>
      )}
      {result?.badge_name && (
        <View style={styles.badgePill}>
          <Text style={styles.badge}>{result.badge_name} badge unlocked!</Text>
        </View>
      )}
      {result?.level_up && (
        <View style={styles.levelPill}>
          <Text style={styles.level}>Level {result.new_level} reached!</Text>
        </View>
      )}
    </RewardModal>
  );
}

const styles = StyleSheet.create({
  rewardCard: {
    width: '100%',
    alignItems: 'center',
    backgroundColor: colors.primaryBg,
    borderRadius: 18,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: colors.primaryLight,
  },
  rewardLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0,
  },
  xp: {
    fontSize: 34,
    fontWeight: '800',
    color: colors.primary,
  },
  badgeArtFrame: {
    width: 104,
    height: 104,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 2,
  },
  badgeHalo: {
    position: 'absolute',
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: colors.primaryBg,
    borderWidth: 1,
    borderColor: colors.primaryLight,
  },
  badgeImage: {
    width: 92,
    height: 92,
  },
  badgePill: {
    borderRadius: 999,
    backgroundColor: colors.xpBg,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  badge: {
    fontSize: 14,
    color: colors.xpColor,
    fontWeight: '700',
    textAlign: 'center',
  },
  levelPill: {
    borderRadius: 999,
    backgroundColor: colors.primaryBg,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  level: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
    textAlign: 'center',
  },
});
