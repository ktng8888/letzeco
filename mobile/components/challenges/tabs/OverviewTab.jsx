import { View, Text, Image, StyleSheet } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import EligibleActionsList from '../EligibleActionsList';
import SoundTouchableOpacity from '../../common/SoundTouchableOpacity';
import ChallengeRewardModal from '../modals/ChallengeRewardModal';
import { getImageUrl } from '../../../utils/imageUrl';
import colors from '../../../constants/colors';

export default function OverviewTab({ challenge }) {
  const [previewReward, setPreviewReward] = useState(null);
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
              onPreview={setPreviewReward}
            />
          )}
          {rankingRewards.length > 0 && (
            <RewardSection
              title="Ranking Rewards"
              icon="trophy"
              tint={colors.xpColor}
              bgColor="#fffbeb"
              rewards={rankingRewards}
              onPreview={setPreviewReward}
            />
          )}
        </View>
      ) : (
        <Text style={styles.about}>
          No rewards configured for this challenge.
        </Text>
      )}

      <ChallengeRewardModal
        reward={previewReward}
        onClose={() => setPreviewReward(null)}
      />
    </View>
  );
}

function RewardSection({ title, icon, tint, bgColor, rewards, onPreview }) {
  return (
    <View style={[styles.rewardSection, { backgroundColor: bgColor }]}>
      <View style={styles.rewardSectionHeader}>
        <View style={[styles.rewardIconWrap, { backgroundColor: tint }]}>
          <Ionicons name={icon} size={15} color={colors.textWhite} />
        </View>
        <Text style={styles.rewardSectionTitle}>{title}</Text>
      </View>

      <View style={styles.rewardRows}>
        {rewards.map((reward, index) => {
          const hasBadge = !!reward.badge_name;
          const isObtained = !!reward.user_reward_status;
          const RowComponent = hasBadge ? SoundTouchableOpacity : View;
          return (
          <RowComponent
            key={`${reward.type}-${reward.top_value || index}`}
            style={[
              styles.rewardRow,
              index > 0 && styles.rewardRowDivider,
            ]}
            onPress={hasBadge ? () => onPreview(reward) : undefined}
            activeOpacity={hasBadge ? 0.78 : 1}
          >
            {hasBadge && (
              <View style={styles.rewardBadgeImageWrap}>
                {reward.badge_image ? (
                  <Image
                    source={{ uri: getImageUrl(reward.badge_image) }}
                    style={styles.rewardBadgeImage}
                    resizeMode="contain"
                  />
                ) : (
                  <Ionicons name="ribbon" size={25} color={tint} />
                )}
                {isObtained && (
                  <View style={styles.rewardClaimedBadge}>
                    <Ionicons name="checkmark" size={11} color={colors.textWhite} />
                  </View>
                )}
              </View>
            )}
            <View style={styles.rewardCopy}>
              <Text style={styles.rewardLabel}>
                {reward.type === 'ranking'
                  ? `Top ${reward.top_value}`
                  : 'Complete Challenge'}
              </Text>
              {reward.badge_name && (
                <Text style={styles.rewardBadge}>
                  Badge: {reward.badge_name}
                </Text>
              )}
            </View>
            <View style={styles.rewardRight}>
              {reward.xp_reward > 0 && (
                <Text style={styles.rewardValue}>+{reward.xp_reward} XP</Text>
              )}
              {isObtained && !hasBadge && (
                <Ionicons name="checkmark-circle" size={17} color={colors.primary} />
              )}
              {hasBadge && (
                <Ionicons name="chevron-forward" size={17} color={colors.textLight} />
              )}
            </View>
          </RowComponent>
          );
        })}
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
  rewardBadgeImageWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bgWhite,
    borderWidth: 1,
    borderColor: 'rgba(15,23,42,0.08)',
    marginRight: 10,
    position: 'relative',
  },
  rewardBadgeImage: {
    width: 38,
    height: 38,
  },
  rewardClaimedBadge: {
    position: 'absolute',
    right: -5,
    top: -5,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: colors.bgWhite,
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
    lineHeight: 17,
  },
  rewardValue: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.primary,
    flexShrink: 0,
  },
  rewardRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    flexShrink: 0,
  },
});
