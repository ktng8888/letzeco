import { View, Text, Image, Modal, StyleSheet } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import EligibleActionsList from '../EligibleActionsList';
import SoundTouchableOpacity from '../../common/SoundTouchableOpacity';
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

      <RewardPreviewModal
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

function RewardPreviewModal({ reward, onClose }) {
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
  },
  rewardBadgeImage: {
    width: 38,
    height: 38,
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
