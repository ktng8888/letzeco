import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../../constants/colors';

export default function RewardCard({ reward }) {
  const isCompletion = reward.type === 'completion';
  return (
    <View style={[
      styles.card,
      { backgroundColor: isCompletion ? '#f0fdf4' : '#fefce8' },
    ]}>
      <View style={styles.rewardRow}>
        <Ionicons
          name={isCompletion ? 'checkmark-circle-outline' : 'trophy-outline'}
          size={14}
          color={isCompletion ? colors.success : colors.xpColor}
        />
        <Text style={styles.rewardType}>
          {isCompletion
            ? 'Completion Reward'
            : `Top ${reward.top_value} Ranking Reward`
          }
        </Text>
      </View>
      {reward.xp_reward > 0 && (
        <Text style={styles.rewardValue}>+{reward.xp_reward} XP</Text>
      )}
      {reward.badge_name && (
        <View style={styles.badgeRow}>
          <Ionicons name="ribbon-outline" size={13} color={colors.xpColor} />
          <Text style={styles.rewardBadge}>
            "{reward.badge_name}" Badge
          </Text>
        </View>
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
  rewardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  rewardValue: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary,
  },
  rewardBadge: {
    fontSize: 13,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 18,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 5,
  },
});
