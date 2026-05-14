import {
  View, Text, Image, TouchableOpacity, StyleSheet
} from 'react-native';
import { useRouter } from 'expo-router';
import { BASE_URL } from '../../constants/api';
import colors from '../../constants/colors';

export default function BadgeGrid({ unlocked, locked }) {
  const router = useRouter();

  const goToDetail = (achievementId) => {
    router.push({
      pathname: '/screens/achievement-detail',
      params: { achievementId },
    });
  };

  return (
    <View style={styles.container}>

      {/* Filter info */}
      <View style={styles.filterRow}>
        <Text style={styles.filterInfo}>
          {unlocked?.length || 0} unlocked · {locked?.length || 0} locked
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
                onPress={() => goToDetail(badge.id)}
                activeOpacity={0.75}
              >
                <View style={styles.badgeImgWrap}>
                  {badge.badge_image ? (
                    <Image
                      source={{ uri: `${BASE_URL}/${badge.badge_image}` }}
                      style={styles.badgeImg}
                      resizeMode="contain"
                    />
                  ) : (
                    <View style={[styles.badgeImg, styles.badgeImgFallback]}>
                      <Text style={styles.fallbackEmoji}>🏅</Text>
                    </View>
                  )}
                  {/* Unlocked checkmark */}
                  <View style={styles.checkDot}>
                    <Text style={styles.checkDotText}>✓</Text>
                  </View>
                </View>
                <Text style={styles.badgeName} numberOfLines={2}>
                  {badge.badge_name}
                </Text>
                {/* Full progress bar */}
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: '100%' }]} />
                </View>
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
                onPress={() => goToDetail(badge.id)}
                activeOpacity={0.75}
              >
                <View style={styles.badgeImgWrap}>
                  {badge.badge_image ? (
                    // Show image but greyed out
                    <Image
                      source={{ uri: `${BASE_URL}/${badge.badge_image}` }}
                      style={[styles.badgeImg, styles.badgeImgLocked]}
                      resizeMode="contain"
                    />
                  ) : (
                    <View style={[styles.badgeImg, styles.badgeImgFallbackLocked]}>
                      <Text style={styles.fallbackEmoji}>🔒</Text>
                    </View>
                  )}
                  {/* Lock overlay */}
                  <View style={styles.lockOverlay}>
                    <Text style={styles.lockIcon}>🔒</Text>
                  </View>
                </View>
                <Text style={[styles.badgeName, styles.badgeNameLocked]}
                  numberOfLines={2}>
                  {badge.badge_name}
                </Text>
                {/* Progress bar */}
                <View style={styles.progressBar}>
                  <View style={[
                    styles.progressFill,
                    {
                      width: `${Math.min(
                        ((badge.current_progress || 0) / (badge.target_value || 1)) * 100,
                        100
                      )}%`
                    }
                  ]} />
                </View>
                <Text style={styles.progressText}>
                  {badge.current_progress || 0} / {badge.target_value}
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

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 16,
  },
  filterRow: {
    marginBottom: 4,
  },
  filterInfo: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  section: { gap: 10 },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  badgeCard: {
    width: '22%',
    alignItems: 'center',
    gap: 5,
  },

  // Badge image wrapper (relative positioned for overlay)
  badgeImgWrap: {
    width: 64,
    height: 64,
    position: 'relative',
  },
  badgeImg: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  badgeImgFallback: {
    backgroundColor: colors.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeImgLocked: {
    opacity: 0.25,
  },
  badgeImgFallbackLocked: {
    backgroundColor: colors.bgGrey,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.4,
  },
  fallbackEmoji: { fontSize: 28 },

  // Unlocked checkmark dot
  checkDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  checkDotText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '700',
  },

  // Lock overlay
  lockOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockIcon: { fontSize: 20 },

  // Badge name
  badgeName: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
    lineHeight: 13,
  },
  badgeNameLocked: {
    color: colors.textSecondary,
  },

  // Progress bar
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: colors.bgGrey,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  progressText: {
    fontSize: 9,
    color: colors.textSecondary,
    textAlign: 'center',
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