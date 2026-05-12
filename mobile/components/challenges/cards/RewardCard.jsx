import { View, Text, StyleSheet } from 'react-native';
import colors from '../../../constants/colors';

export default function RewardCard({ reward }) {
  const isCompletion = reward.type === 'completion';
  return (
    <View style={[
      styles.card,
      { backgroundColor: isCompletion ? '#f0fdf4' : '#fefce8' },
    ]}>
      <Text style={styles.rewardType}>
        {isCompletion
          ? '✅ Completion Reward'
          : `🏆 Top ${reward.top_value} Ranking Reward`
        }
      </Text>
      {reward.xp_reward > 0 && (
        <Text style={styles.rewardValue}>+{reward.xp_reward} XP</Text>
      )}
      {reward.badge_name && (
        <Text style={styles.rewardBadge}>
          🏅 "{reward.badge_name}" Badge
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 14,
    gap: 4,
  },
  rewardType: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  rewardValue: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary,
  },
  rewardBadge: {
    fontSize: 13,
    color: colors.textSecondary,
  },
});