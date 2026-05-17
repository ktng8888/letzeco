import {
  View, Text, Image, ScrollView,
  TouchableOpacity, StyleSheet
} from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import profileService from '../../services/profileService';
import LoadingScreen from '../../components/common/LoadingScreen';
import { BASE_URL } from '../../constants/api';
import colors from '../../constants/colors';

export default function AchievementDetailScreen() {
  const router = useRouter();
  const { achievementId } = useLocalSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [achievements, setAchievements] = useState([]);
  const [current, setCurrent] = useState(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const data = await profileService.getAchievements();
      const all = data.data;
      setAchievements(all);
      const found = all.find(a => a.id === parseInt(achievementId));
      setCurrent(found);
    } catch (err) {
      console.error('Load achievement error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <LoadingScreen />;
  if (!current) return null;

  // Tier progression: same type + same category, sorted by target_value asc
  const relatedAchievements = achievements
    .filter(
      a => a.type === current.type &&
           a.action_category_id === current.action_category_id &&
           a.action_id === current.action_id
    )
    .sort((a, b) => a.target_value - b.target_value);

  const progressPercent = current.target_value > 0
    ? Math.min((current.current_progress / current.target_value) * 100, 100)
    : 100;
  const displayProgress = current.target_value > 0
    ? Math.min(current.current_progress, current.target_value)
    : current.current_progress;

  const tierColor = getTierColor(current.badge_name);

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {current.badge_name}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >

        {/* ── Badge hero section ── */}
        <View style={[styles.heroSection, { backgroundColor: tierColor.bg }]}>
          {/* Badge image — large, greyed if locked */}
          <View style={styles.badgeImgWrap}>
            {current.badge_image ? (
              <Image
                source={{ uri: `${BASE_URL}/${current.badge_image}` }}
                style={[
                  styles.badgeImg,
                  !current.is_unlocked && styles.badgeImgLocked,
                ]}
                resizeMode="contain"
              />
            ) : (
              <View style={[
                styles.badgeImgFallback,
                !current.is_unlocked && styles.badgeImgFallbackLocked,
              ]}>
                <Text style={styles.badgeFallbackEmoji}>
                  {current.is_unlocked ? '🏅' : '🔒'}
                </Text>
              </View>
            )}

            {/* Not obtained overlay */}
            {!current.is_unlocked && (
              <View style={styles.notObtainedOverlay}>
                <Text style={styles.notObtainedText}>Not Obtained</Text>
              </View>
            )}
          </View>

          {/* Name */}
          <Text style={[styles.badgeName, { color: tierColor.text }]}>
            {current.badge_name}
          </Text>

          {/* Progress bar */}
          <View style={styles.progressBarBg}>
            <View style={[
              styles.progressBarFill,
              { width: `${progressPercent}%`, backgroundColor: tierColor.accent },
            ]} />
          </View>
          <Text style={styles.progressText}>
            {displayProgress} / {current.target_value}
          </Text>
        </View>

        {/* ── Description ── */}
        <View style={styles.descCard}>
          <Text style={styles.descText}>{current.name}</Text>
        </View>

        {/* ── Reward ── */}
        <View style={styles.rewardSection}>
          <Text style={styles.rewardLabel}>Rewards</Text>
          <View style={styles.rewardRow}>
            <View style={[
              styles.rewardXpBox,
              current.is_unlocked && styles.rewardXpBoxClaimed,
            ]}>
              {current.is_unlocked && (
                <View style={styles.rewardCheck}>
                  <Ionicons name="checkmark" size={12} color="#fff" />
                </View>
              )}
              <Text style={styles.rewardXpValue}>+{current.bonus_xp}</Text>
              <Text style={styles.rewardXpLabel}>XP Bonus</Text>
            </View>
          </View>
        </View>

        {/* ── Tier progression (like PTCG bottom row) ── */}
        {relatedAchievements.length > 1 && (
          <View style={styles.tierSection}>
            <View style={styles.tierRow}>
              {relatedAchievements.map((ach) => {
                const isActive  = ach.id === current.id;
                const tc        = getTierColor(ach.badge_name);
                return (
                  <TouchableOpacity
                    key={ach.id}
                    style={[
                      styles.tierChip,
                      isActive && styles.tierChipActive,
                      isActive && { borderColor: tc.accent },
                    ]}
                    onPress={() => {
                      if (!isActive) {
                        router.replace({
                          pathname: '/screens/achievement-detail',
                          params: { achievementId: ach.id },
                        });
                      }
                    }}
                    activeOpacity={isActive ? 1 : 0.7}
                  >
                    {/* Tier badge thumbnail */}
                    {ach.badge_image ? (
                      <Image
                        source={{ uri: `${BASE_URL}/${ach.badge_image}` }}
                        style={[
                          styles.tierImg,
                          !ach.is_unlocked && styles.tierImgLocked,
                        ]}
                        resizeMode="contain"
                      />
                    ) : (
                      <Text style={styles.tierEmoji}>
                        {getTierEmoji(ach.badge_name)}
                      </Text>
                    )}

                    {/* Unlocked checkmark */}
                    {ach.is_unlocked && (
                      <View style={styles.tierCheck}>
                        <Ionicons name="checkmark" size={10} color="#fff" />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

// ─────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────
function getTierColor(name = '') {
  if (name.includes('Gold'))   return { bg: '#fefce8', text: '#92400e', accent: '#f59e0b' };
  if (name.includes('Silver')) return { bg: '#f8fafc', text: '#475569', accent: '#94a3b8' };
  if (name.includes('Bronze')) return { bg: '#fef3ec', text: '#7c2d12', accent: '#c2763b' };
  return { bg: colors.primaryBg, text: colors.primary, accent: colors.primary };
}

function getTierEmoji(name = '') {
  if (name.includes('Gold'))   return '🥇';
  if (name.includes('Silver')) return '🥈';
  if (name.includes('Bronze')) return '🥉';
  return '🏅';
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgLight },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 56,
    paddingBottom: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.bgWhite,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
    flex: 1,
    textAlign: 'center',
  },

  content: { paddingBottom: 20 },

  // ── Hero ──
  heroSection: {
    alignItems: 'center',
    paddingVertical: 36,
    paddingHorizontal: 24,
    gap: 10,
  },
  badgeImgWrap: {
    width: 160,
    height: 160,
    marginBottom: 8,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeImg: {
    width: 160,
    height: 160,
    borderRadius: 80,
  },
  badgeImgLocked: {
    opacity: 0.2,
  },
  badgeImgFallback: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: colors.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeImgFallbackLocked: {
    backgroundColor: colors.bgGrey,
    opacity: 0.5,
  },
  badgeFallbackEmoji: { fontSize: 64 },

  notObtainedOverlay: {
    position: 'absolute',
    bottom: 8,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  notObtainedText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },

  badgeName: {
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
  },
  progressBarBg: {
    width: '70%',
    height: 8,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },

  // ── Description card ──
  descCard: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: colors.bgWhite,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
  },
  descText: {
    fontSize: 15,
    color: colors.textPrimary,
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '500',
  },

  // ── Reward ──
  rewardSection: {
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: colors.bgWhite,
    borderRadius: 14,
    padding: 16,
    gap: 12,
  },
  rewardLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  rewardRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  rewardXpBox: {
    width: 72,
    height: 72,
    borderRadius: 14,
    backgroundColor: colors.bgGrey,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    position: 'relative',
  },
  rewardXpBoxClaimed: {
    backgroundColor: colors.primaryBg,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  rewardCheck: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  rewardXpValue: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.primary,
  },
  rewardXpLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    fontWeight: '500',
  },

  // ── Tier progression row ──
  tierSection: {
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: colors.bgWhite,
    borderRadius: 14,
    padding: 16,
  },
  tierRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  tierChip: {
    width: 64,
    height: 64,
    borderRadius: 14,
    backgroundColor: colors.bgGrey,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  tierChipActive: {
    borderWidth: 3,
    backgroundColor: colors.bgWhite,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tierImg: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  tierImgLocked: {
    opacity: 0.3,
  },
  tierEmoji: { fontSize: 28 },
  tierCheck: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
});
