// mobile/components/challenges/tabs/ActivityTab.jsx  (FULL REPLACEMENT)
import { View, Text, Image, ActivityIndicator, ScrollView, StyleSheet } from 'react-native';
import { formatProgress } from '../../../utils/challengeHelpers';
import { BASE_URL } from '../../../constants/api';
import useAuthStore from '../../../store/authStore';
import colors from '../../../constants/colors';

export default function ActivityTab({
  activity,
  isLoading,
  challengeType,
  targetType,
  unit,
  teamMembers,   // ← NEW: challenge.team?.members
}) {
  if (isLoading) {
    return (
      <ActivityIndicator
        color={colors.primary}
        style={{ marginTop: 20 }}
      />
    );
  }
  
  const { user } = useAuthStore();

  // ── TEAM ──
  if (challengeType === 'team') {
    const feed = activity?.feed || [];
    return (
      <View style={styles.container}>

        {/* ── Member contribution summary ── */}
        {teamMembers && teamMembers.length > 0 && (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Member Contributions</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.summaryRow}
            >
              {[...teamMembers]
                .sort((a, b) =>
                  parseFloat(b.contribution || 0) - parseFloat(a.contribution || 0)
                )
                .map((member) => (
                  <MemberSummaryChip
                    key={member.user_id}
                    member={member}
                    targetType={targetType}
                    unit={unit}
                    isYou={member.user_id === user?.id}
                  />
                ))
              }
            </ScrollView>
          </View>
        )}

        {/* ── Feed title ── */}
        <Text style={styles.sectionTitle}>Team Activity</Text>
        <Text style={styles.subtitle}>
          Eligible actions logged by all members
        </Text>

        {/* ── Feed items ── */}
        {feed.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyTitle}>No activity yet.</Text>
            <Text style={styles.emptySub}>
              Be the first to log an eligible action!
            </Text>
          </View>
        ) : (
          feed.map((item) => (
            <FeedItem key={item.id} item={item} isYou={item.user_id === user?.id} />
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
      {!hasData ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={styles.emptyTitle}>No eligible actions logged yet.</Text>
          <Text style={styles.emptySub}>
            Log eligible actions to see your activity here.
          </Text>
        </View>
      ) : (
        <DayBarChart data={activity.activity} />
      )}
    </View>
  );
}

// ─────────────────────────────────────────────────────
// Member contribution chip (summary row)
// ─────────────────────────────────────────────────────
function MemberSummaryChip({ member, targetType, unit, isYou }) {
  const value = parseFloat(member.contribution || 0);

  return (
    <View style={styles.chip}>
      {/* Avatar */}
      {member.profile_image ? (
        <Image
          source={{ uri: `${BASE_URL}/${member.profile_image}` }}
          style={styles.chipAvatar}
        />
      ) : (
        <View style={styles.chipAvatarFallback}>
          <Text style={styles.chipAvatarInitial}>
            {member.username?.charAt(0).toUpperCase()}
          </Text>
        </View>
      )}

    {/* Name */}
    <Text style={styles.chipName} numberOfLines={1}>
        {member.username}
        {isYou && ' (You)'}
    </Text>

      {/* Value */}
      <Text style={styles.chipValue}>
        {formatProgress(value, targetType, unit)}
      </Text>
    </View>
  );
}

// ─────────────────────────────────────────────────────
// Single activity feed item (team view)
// ─────────────────────────────────────────────────────
function FeedItem({ item, isYou }) {
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
          <Text style={styles.feedUsername}>{item.username}{isYou && ' (You)'}</Text>
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
// Solo vertical bar chart
// ─────────────────────────────────────────────────────
function DayBarChart({ data }) {
  const maxCount = Math.max(
    ...data.map(d => parseInt(d.action_count || 0)), 1
  );

  return (
    <View style={styles.chart}>
      <Text style={styles.chartLabel}>Actions Logged</Text>
      <View style={styles.verticalBars}>
        {data.map((item, i) => {
          const count = parseInt(item.action_count || 0);
          const heightPct = (count / maxCount) * 100;
          return (
            <View key={i} style={styles.barCol}>
              <Text style={styles.barValue}>{count}</Text>
              <View style={styles.verticalBarBg}>
                <View
                  style={[
                    styles.verticalBarFill,
                    { height: `${Math.max(heightPct, 4)}%` },
                  ]}
                />
              </View>
              <Text style={styles.barDay}>{item.day}</Text>
            </View>
          );
        })}
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

  // ── Member contribution summary card ──
  summaryCard: {
    backgroundColor: colors.bgWhite,
    borderRadius: 14,
    padding: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  summaryTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 10,
    paddingBottom: 2,
  },
  chip: {
    alignItems: 'center',
    gap: 5,
    minWidth: 72,
    maxWidth: 90,
  },
  chipAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  chipAvatarFallback: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.primaryLight,
  },
  chipAvatarInitial: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  chipName: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  chipValue: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
    textAlign: 'center',
  },

  // ── Feed styles ──
  empty: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 8,
  },
  emptyIcon: { fontSize: 36 },
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

  // ── Solo bar chart ──
  chart: { gap: 8 },
  chartLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  verticalBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 140,
    gap: 6,
  },
  barCol: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    height: '100%',
    justifyContent: 'flex-end',
  },
  barValue: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary,
  },
  verticalBarBg: {
    width: '100%',
    flex: 1,
    backgroundColor: colors.bgGrey,
    borderRadius: 4,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  verticalBarFill: {
    width: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  barDay: {
    fontSize: 10,
    color: colors.textSecondary,
    fontWeight: '500',
  },
});