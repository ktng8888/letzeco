import { View, Text, StyleSheet } from 'react-native';
import EligibleActionsList from '../EligibleActionsList';
import RewardCard from '../cards/RewardCard';
import colors from '../../../constants/colors';

export default function OverviewTab({ challenge }) {
  const completionRewards = challenge.rewards?.filter(r => r.type === 'completion') || [];
  const rankingRewards = challenge.rewards
    ?.filter(r => r.type === 'ranking')
    .sort((a, b) => (a.top_value || 0) - (b.top_value || 0)) || [];

  return (
    <View style={styles.container}>
      {/* About */}
      <Text style={styles.sectionTitle}>About this Challenge</Text>
      <Text style={styles.about}>{challenge.about}</Text>

      {/* Eligible Actions */}
      <Text style={styles.sectionTitle}>Eligible Actions</Text>
      <EligibleActionsList actions={challenge.eligible_actions} />

      {/* Rewards */}
      <Text style={styles.sectionTitle}>Rewards</Text>
      {challenge.rewards && challenge.rewards.length > 0 ? (
        <View style={styles.rewardsList}>
          {completionRewards.map((r, i) => (
            <RewardCard key={`c-${i}`} reward={r} />
          ))}
          {rankingRewards.map((r, i) => (
            <RewardCard key={`r-${i}`} reward={r} />
          ))}
        </View>
      ) : (
        <Text style={styles.about}>
          No rewards configured for this challenge.
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 12 },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 8,
  },
  about: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  rewardsList: { gap: 8 },
});