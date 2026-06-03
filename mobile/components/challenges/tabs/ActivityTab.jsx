import { View, Text, Image, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatProgress } from '../../../utils/challengeHelpers';
import useAuthStore from '../../../store/authStore';
import { BASE_URL } from '../../../constants/api';
import colors from '../../../constants/colors';

export default function ActivityTab({
  activity,
  isLoading,
  challengeType,
  targetType,
  unit,
  teamMembers,
}) {
  if (isLoading) {
    return (
      <ActivityIndicator
        color={colors.primary}
        style={{ marginTop: 20 }}
      />
    );
  }

  // ── TEAM ──
  if (challengeType === 'team') {
    const feed = activity?.feed || [];
    return (
      <View style={styles.container}>

        {/* ── Member contribution bar chart ── */}
        {teamMembers && teamMembers.length > 0 && (
          <MemberContributionChart
            members={teamMembers}
            targetType={targetType}
            unit={unit}
          />
        )}

        {/* ── Feed ── */}
        <Text style={styles.sectionTitle}>Team Activity</Text>
        <Text style={styles.subtitle}>
          Eligible actions logged by all members
        </Text>

        {feed.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="clipboard-outline" size={38} color={colors.borderDark} />
            <Text style={styles.emptyTitle}>No activity yet.</Text>
            <Text style={styles.emptySub}>
              Be the first to log an eligible action!
            </Text>
          </View>
        ) : (
          feed.map((item) => (
            <FeedItem key={item.id} item={item} />
          ))
        )}
      </View>
    );
  }

  // ── SOLO ──
  const hasData = activity?.activity && activity.activity.length > 0;

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Your Activity</Text>
      <Text style={styles.subtitle}>
        Eligible actions you logged for this challenge
      </Text>
      {!hasData ? (
        <View style={styles.empty}>
          <Ionicons name="clipboard-outline" size={38} color={colors.borderDark} />
          <Text style={styles.emptyTitle}>No eligible actions logged yet.</Text>
          <Text style={styles.emptySub}>
            Log eligible actions to see your activity here.
          </Text>
        </View>
      ) : (
        activity.activity.map((item) => (
          <FeedItem key={item.id} item={item} />
        ))
      )}
    </View>
  );
}

// ─────────────────────────────────────────────────────
// Member contribution bar chart
// ─────────────────────────────────────────────────────
function MemberContributionChart({ members, targetType, unit }) {
  const { user } = useAuthStore();

  const uniqueMembers = Array.from(
    new Map(members.map(member => [member.user_id, member])).values()
  );
  const sorted = uniqueMembers.sort(
    (a, b) => parseFloat(b.contribution || 0) - parseFloat(a.contribution || 0)
  );
  const maxValue = parseFloat(sorted[0]?.contribution || 0);

  return (
    <View style={styles.summaryCard}>
      <Text style={styles.summaryTitle}>Member Contributions</Text>

      <View style={styles.chartRows}>
        {sorted.map((member, i) => {
          const value    = parseFloat(member.contribution || 0);
          const barPct   = maxValue > 0 ? value / maxValue : 0;
          const isYou    = member.user_id === user?.id;
          const isLeader = i === 0 && value > 0;

          return (
            <View key={member.user_id} style={styles.chartRow}>

              {/* Avatar */}
              <View style={styles.chartAvatar}>
                {member.profile_image ? (
                  <Image
                    source={{ uri: `${BASE_URL}/${member.profile_image}` }}
                    style={styles.chartAvatarImg}
                  />
                ) : (
                  <View style={styles.chartAvatarFallback}>
                    <Text style={styles.chartAvatarInitial}>
                      {member.username?.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                )}
              </View>

              {/* Name */}
              <View style={styles.chartName}>
                <View style={styles.chartNameRow}>
                  <Text style={styles.chartNameText} numberOfLines={1}>
                    {member.username}
                  </Text>
                  {isLeader && (
                    <Ionicons name="trophy-outline" size={12} color={colors.xpColor} />
                  )}
                  {isYou
                    ? <Text style={styles.youTag}> (You)</Text>
                    : null
                  }
                </View>
              </View>

              {/* Bar track */}
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    {
                      width: `${Math.max(barPct * 100, value > 0 ? 3 : 0)}%`,
                    },
                    isYou && styles.barFillYou,
                  ]}
                />
              </View>

              {/* Value */}
              <Text style={[styles.chartValue, isYou && styles.chartValueYou]}>
                {formatProgress(value, targetType, unit)}
              </Text>

            </View>
          );
        })}
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────
// Single activity feed item
// ─────────────────────────────────────────────────────
function FeedItem({ item }) {
  const { user } = useAuthStore();
  const isYou  = item.user_id === user?.id;
  const timeAgo = getTimeAgo(item.end_time);

  const impacts = [];
  if (parseFloat(item.co2_saved)   > 0) impacts.push(`${parseFloat(item.co2_saved).toFixed(2)} kg CO₂`);
  if (parseFloat(item.litre_saved) > 0) impacts.push(`${parseFloat(item.litre_saved).toFixed(1)} L water`);
  if (parseFloat(item.kwh_saved)   > 0) impacts.push(`${parseFloat(item.kwh_saved).toFixed(1)} kWh`);
  const impactText = impacts.length > 0 ? impacts.join(' · ') : null;

  return (
    <View style={styles.feedItem}>
      {/* Left: avatar + connector */}
      <View style={styles.feedLeft}>
        {item.profile_image ? (
          <Image
            source={{ uri: `${BASE_URL}/${item.profile_image}` }}
            style={styles.avatar}
          />
        ) : (
          <View style={styles.avatarFallback}>
            <Text style={styles.avatarInitial}>
              {item.username?.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        <View style={styles.connector} />
      </View>

      {/* Right: content */}
      <View style={styles.feedContent}>
        <View style={styles.feedHeader}>
          <Text style={styles.feedUsername}>
            {item.username}
            {isYou && <Text style={styles.feedYouTag}> (You)</Text>}
          </Text>
          <Text style={styles.feedTime}>{timeAgo}</Text>
        </View>

        <View style={styles.actionCard}>
          {item.action_image && (
            <Image
              source={{ uri: `${BASE_URL}/${item.action_image}` }}
              style={styles.actionImg}
            />
          )}
          <View style={styles.actionInfo}>
            <Text style={styles.categoryLabel}>{item.category_name}</Text>
            <Text style={styles.actionName}>{item.action_name}</Text>
            {impactText && (
              <Text style={styles.impactText}>{impactText}</Text>
            )}
          </View>
          <View style={styles.xpBadge}>
            <Text style={styles.xpText}>+{item.xp_gained} XP</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────
// Helper: time ago
// ─────────────────────────────────────────────────────
function getTimeAgo(dateString) {
  if (!dateString) return '';
  const diff = Math.floor((Date.now() - new Date(dateString)) / 1000);
  if (diff < 60)        return 'Just now';
  if (diff < 3600)      return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400)     return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)}d ago`;
  const d = new Date(dateString);
  const months = ['Jan','Feb','Mar','Apr','May','Jun',
                  'Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${d.getDate()} ${months[d.getMonth()]}`;
}

const styles = StyleSheet.create({
  container: { gap: 12 },

  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 4,
  },
  subtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: -8,
  },

  // ── Member contribution chart card ──
  summaryCard: {
    backgroundColor: colors.bgWhite,
    borderRadius: 14,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  chartRows: {
    gap: 10,
  },
  chartRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  // Avatar
  chartAvatar: {
    width: 32,
    height: 32,
    flexShrink: 0,
  },
  chartAvatarImg: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  chartAvatarFallback: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartAvatarInitial: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },

  // Name column — fixed width so bars align
  chartName: {
    width: 80,
    flexShrink: 0,
  },
  chartNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  chartNameText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
    flexShrink: 1,
  },
  youTag: {
    fontSize: 11,
    fontWeight: '400',
    color: colors.primary,
  },

  // Bar track — takes remaining space
  barTrack: {
    flex: 1,
    height: 10,
    backgroundColor: colors.bgGrey,
    borderRadius: 5,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: colors.primaryLight,
    borderRadius: 5,
  },
  barFillYou: {
    backgroundColor: colors.primary,
  },

  // Value label
  chartValue: {
    width: 72,
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
    textAlign: 'right',
    flexShrink: 0,
  },
  chartValueYou: {
    color: colors.primary,
  },

  // ── Empty state ──
  empty: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  emptySub: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
  },

  // ── Feed styles ──
  feedItem: {
    flexDirection: 'row',
    gap: 10,
    paddingBottom: 4,
  },
  feedLeft: {
    alignItems: 'center',
    width: 36,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  avatarFallback: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  connector: {
    width: 2,
    flex: 1,
    backgroundColor: colors.bgGrey,
    marginTop: 4,
    marginBottom: -4,
    minHeight: 12,
  },
  feedContent: {
    flex: 1,
    gap: 6,
    paddingBottom: 16,
  },
  feedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  feedUsername: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  feedYouTag: {
    fontSize: 12,
    fontWeight: '400',
    color: colors.primary,
  },
  feedTime: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgWhite,
    borderRadius: 12,
    padding: 10,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionImg: {
    width: 40,
    height: 40,
    borderRadius: 8,
  },
  actionInfo: { flex: 1, gap: 2 },
  categoryLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  actionName: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
    lineHeight: 18,
  },
  impactText: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 1,
  },
  xpBadge: {
    backgroundColor: colors.primaryBg,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  xpText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },

});
