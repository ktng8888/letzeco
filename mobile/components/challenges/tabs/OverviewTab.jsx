import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import EligibleActionsList from '../EligibleActionsList';
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
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitleInline}>Eligible Actions</Text>
        <View style={styles.countPill}>
          <Text style={styles.countText}>
            {challenge.eligible_actions?.length || 0}
          </Text>
        </View>
      </View>
      <EligibleActionsList
        actions={challenge.eligible_actions}
        scrollable
        maxHeight={340}
      />

      {/* Rewards */}
      <Text style={styles.sectionTitle}>Rewards</Text>
      {challenge.rewards && challenge.rewards.length > 0 ? (
        <View style={styles.rewardsList}>
          {completionRewards.length > 0 && (
            <RewardSection
              title="Completion Reward"
              icon="checkmark-circle"
              tint={colors.primary}
              bgColor="#f0fdf4"
              rewards={completionRewards}
            />
          )}
          {rankingRewards.length > 0 && (
            <RewardSection
              title="Ranking Rewards"
              icon="trophy"
              tint={colors.xpColor}
              bgColor="#fffbeb"
              rewards={rankingRewards}
            />
          )}
        </View>
      ) : (
        <Text style={styles.about}>
          No rewards configured for this challenge.
        </Text>
      )}
    </View>
  );
}

function RewardSection({ title, icon, tint, bgColor, rewards }) {
  return (
    <View style={[styles.rewardSection, { backgroundColor: bgColor }]}>
      <View style={styles.rewardSectionHeader}>
        <View style={[styles.rewardIconWrap, { backgroundColor: tint }]}>
          <Ionicons name={icon} size={15} color={colors.textWhite} />
        </View>
        <Text style={styles.rewardSectionTitle}>{title}</Text>
      </View>

      <View style={styles.rewardRows}>
        {rewards.map((reward, index) => (
          <View
            key={`${reward.type}-${reward.top_value || index}`}
            style={[
              styles.rewardRow,
              index > 0 && styles.rewardRowDivider,
            ]}
          >
            <View style={styles.rewardCopy}>
              <Text style={styles.rewardLabel}>
                {reward.type === 'ranking'
                  ? `Top ${reward.top_value}`
                  : 'Complete Challenge'}
              </Text>
              {reward.badge_name && (
                <Text style={styles.rewardBadge} numberOfLines={1}>
                  Badge: {reward.badge_name}
                </Text>
              )}
            </View>
            {reward.xp_reward > 0 && (
              <Text style={styles.rewardValue}>+{reward.xp_reward} XP</Text>
            )}
          </View>
        ))}
      </View>
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
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  sectionTitleInline: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  countPill: {
    minWidth: 28,
    height: 24,
    borderRadius: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryBg,
  },
  countText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  about: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgWhite,
    padding: 14,
    gap: 12,
  },
  rewardsList: { gap: 12 },
  rewardSection: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  rewardSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rewardIconWrap: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rewardSectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  rewardRows: {
    backgroundColor: 'rgba(255,255,255,0.62)',
    borderRadius: 12,
    overflow: 'hidden',
  },
  rewardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 12,
    gap: 12,
  },
  rewardRowDivider: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(15,23,42,0.07)',
  },
  rewardCopy: {
    flex: 1,
    minWidth: 0,
  },
  rewardLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  rewardBadge: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 3,
  },
  rewardValue: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.primary,
  },
});
