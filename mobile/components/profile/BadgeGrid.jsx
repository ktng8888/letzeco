import {
  View, Text, TouchableOpacity, StyleSheet
} from 'react-native';
import { useRouter } from 'expo-router';
import colors from '../../constants/colors';

export default function BadgeGrid({ unlocked, locked }) {
  const router = useRouter();

  return (
    <View style={styles.container}>

      {/* Filter tabs */}
      <View style={styles.filterRow}>
        <Text style={styles.filterInfo}>
          {unlocked?.length || 0} unlocked •{' '}
          {locked?.length || 0} locked
        </Text>
      </View>

      {/* Unlocked Badges */}
      {unlocked?.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Unlocked</Text>
          <View style={styles.grid}>
            {unlocked.map((badge) => (
              <TouchableOpacity
                key={badge.id}
                style={styles.badgeCard}
                onPress={() => router.push({
                  pathname: '/screens/achievement-detail',
                  params: { achievementId: badge.id }
                })}
              >
                <View style={[styles.badgeIcon, styles.badgeUnlocked]}>
                  <Text style={styles.badgeEmoji}>
                    {getBadgeEmoji(badge.badge_name)}
                  </Text>
                </View>
                <Text style={styles.badgeName} numberOfLines={2}>
                  {badge.badge_name}
                </Text>
                <Text style={styles.badgeType}>
                  {badge.category_name || badge.type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Locked Badges */}
      {locked?.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Locked</Text>
          <View style={styles.grid}>
            {locked.map((badge) => (
              <TouchableOpacity
                key={badge.id}
                style={styles.badgeCard}
                onPress={() => router.push({
                  pathname: '/screens/achievement-detail',
                  params: { achievementId: badge.id }
                })}
              >
                <View style={[styles.badgeIcon, styles.badgeLocked]}>
                  <Text style={styles.badgeEmojiLocked}>🔒</Text>
                </View>
                <Text style={[styles.badgeName, styles.badgeNameLocked]}
                  numberOfLines={2}>
                  {badge.badge_name}
                </Text>
                {/* Progress */}
                <View style={styles.progressBar}>
                  <View style={[
                    styles.progressFill,
                    {
                      width: `${Math.min(
                        (badge.current_progress / badge.target_value) * 100,
                        100
                      )}%`
                    }
                  ]} />
                </View>
                <Text style={styles.progressText}>
                  {badge.current_progress} / {badge.target_value}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {(!unlocked?.length && !locked?.length) && (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No badges yet</Text>
        </View>
      )}
    </View>
  );
}

function getBadgeEmoji(name) {
  if (!name) return '🏅';
  if (name.includes('Gold')) return '🥇';
  if (name.includes('Silver')) return '🥈';
  if (name.includes('Bronze')) return '🥉';
  if (name.includes('Water')) return '💧';
  if (name.includes('Energy')) return '⚡';
  if (name.includes('Tree') || name.includes('Forest')) return '🌳';
  if (name.includes('Mobility')) return '🚌';
  if (name.includes('Streak')) return '🔥';
  if (name.includes('Friend')) return '👫';
  return '🏅';
}

const styles = StyleSheet.create({
  container: { paddingVertical: 12 },
  filterRow: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  filterInfo: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  section: { marginBottom: 16 },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textSecondary,
    paddingHorizontal: 16,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    gap: 8,
  },
  badgeCard: {
    width: '30%',
    alignItems: 'center',
    gap: 4,
    padding: 8,
    backgroundColor: colors.bgWhite,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  badgeIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeUnlocked: {
    backgroundColor: colors.primaryBg,
  },
  badgeLocked: {
    backgroundColor: colors.bgGrey,
  },
  badgeEmoji: { fontSize: 26 },
  badgeEmojiLocked: { fontSize: 22 },
  badgeName: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  badgeNameLocked: { color: colors.textSecondary },
  badgeType: {
    fontSize: 10,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: colors.bgGrey,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primaryLight,
    borderRadius: 2,
  },
  progressText: {
    fontSize: 10,
    color: colors.textSecondary,
  },
  empty: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
});