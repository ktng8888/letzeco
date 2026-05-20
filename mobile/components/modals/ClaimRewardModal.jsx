import { View, Text, StyleSheet } from 'react-native';

import colors from '../../constants/colors';
import RewardModal from './RewardModal';

export default function ClaimRewardModal({
  visible,
  reward,
  isClaiming,
  onConfirm,
  onCancel,
}) {
  return (
    <RewardModal
      visible={visible}
      icon="gift"
      iconColor={colors.xpColor}
      title="Claim Reward!"
      subtitle={`Day ${reward?.day || ''} Streak`}
      primaryText={isClaiming ? 'Claiming...' : 'Claim Now!'}
      primaryDisabled={isClaiming}
      onPrimary={onConfirm}
      secondaryText="Cancel"
      onSecondary={onCancel}
      onRequestClose={onCancel}
    >
      <View style={styles.rewardCard}>
        <Text style={styles.rewardLabel}>Reward</Text>
        <Text style={styles.xp}>+{reward?.xp_reward} XP</Text>
      </View>
      {reward?.badge_name && (
        <View style={styles.badgePill}>
          <Text style={styles.badge}>{reward.badge_name}</Text>
        </View>
      )}
    </RewardModal>
  );
}

const styles = StyleSheet.create({
  rewardCard: {
    width: '100%',
    alignItems: 'center',
    backgroundColor: colors.xpBg,
    borderRadius: 18,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#fde68a',
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
    color: colors.xpColor,
  },
  badgePill: {
    borderRadius: 999,
    backgroundColor: colors.primaryBg,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: colors.primaryLight,
  },
  badge: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '700',
    textAlign: 'center',
  },
});
