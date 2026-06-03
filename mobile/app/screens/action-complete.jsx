import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Animated
} from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import useAuthStore from '../../store/authStore';
import { BadgeUnlockedModal, LevelUpModal } from '../../components/modals';
import colors from '../../constants/colors';
import SoundTouchableOpacity from '../../components/common/SoundTouchableOpacity';
import { playClickSound } from '../../services/audioService';

export default function ActionCompleteScreen() {
  const router = useRouter();
  const { result } = useLocalSearchParams();
  const { updateUser } = useAuthStore();
  const insets = useSafeAreaInsets();

  const [data, setData] = useState(null);
  const [modalQueue, setModalQueue] = useState([]);
  const [activeModalIndex, setActiveModalIndex] = useState(-1);

  // Animation
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (result) {
      playClickSound('actionComplete');
      const parsed = JSON.parse(result);
      setData(parsed);

      // Update user store with new XP/level
      if (parsed.xp) {
        updateUser({
          level_xp: parsed.xp.new_level_xp,
          total_xp: parsed.xp.new_total_xp,
          weekly_xp: parsed.xp.new_weekly_xp,
          level: parsed.new_level,
          streak: parsed.streak?.new_streak,
        });
      }

      // Animate in
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }).start();

      const queue = buildModalQueue(parsed);

      // Show reward modals after short delay, one at a time.
      setTimeout(() => {
        setModalQueue(queue);
        setActiveModalIndex(queue.length > 0 ? 0 : -1);
      }, 800);
    }
  }, [result]);

  const handleRewardModalClose = () => {
    setActiveModalIndex((current) => {
      const next = current + 1;
      return next < modalQueue.length ? next : -1;
    });
  };

  if (!data) return null;

  const { user_action, xp, streak, streak_reward } = data;
  
  const baseXp = user_action?.base_xp ?? 0;  
  const bonusXp = user_action?.bonus_xp_gained ?? 0;
  const totalXpGained = baseXp + bonusXp;
  
  const todayImpact = data?.today_impact || {};
  const todayActions = todayImpact.total_actions ?? data.total_actions_completed ?? 0;
  const todayXp = todayImpact.total_xp_earned ?? xp?.new_total_xp ?? 0;
  const todayCo2 = todayImpact.total_co2_saved ?? user_action?.co2_saved ?? 0;
  const todayLitre = todayImpact.total_litre_saved ?? user_action?.litre_saved ?? 0;
  const todayKwh = todayImpact.total_kwh_saved ?? user_action?.kwh_saved ?? 0;
  const activeModal = activeModalIndex >= 0 ? modalQueue[activeModalIndex] : null;
  const levelMax = getLevelMax(data.new_level);
  const levelXp = xp?.new_level_xp ?? 0;
  const levelPercent = Math.min((levelXp / levelMax) * 100, 100);
  const currentStreak = streak?.new_streak ?? data.new_streak ?? 0;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={[styles.heroCard, { paddingTop: insets.top + 8 }]}>
          <View style={styles.heroPatternOne} />
          <View style={styles.heroPatternTwo} />
          <View style={styles.heroTopRow}>
            <View style={styles.successBadge}>
              <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
              <Text style={styles.successBadgeText}>Complete</Text>
            </View>
            <View style={styles.streakPill}>
              <Ionicons name="flame" size={15} color="#fff7ed" />
              <Text style={styles.streakPillText}>
                {currentStreak} day{currentStreak === 1 ? '' : 's'} streak
              </Text>
            </View>
          </View>

          <Animated.View style={[
            styles.doneRing,
            { transform: [{ scale: scaleAnim }] }
          ]}>
            <Ionicons name="checkmark-circle" size={48} color={colors.primary} />
          </Animated.View>

          <Text style={styles.congrats}>Congrats!</Text>
          <Text style={styles.actionLogged}>Action Logged</Text>

          <Animated.View style={[
            styles.xpBubble,
            { transform: [{ scale: scaleAnim }] }
          ]}>
            <Ionicons name="flash" size={24} color="#f59e0b" />
            <Text style={styles.xpGained}>+{totalXpGained} XP</Text>
            {bonusXp > 0 && (
              <Text style={styles.xpBreakdown}>
                ({baseXp} XP + {bonusXp} bonus XP)
              </Text>
            )}
          </Animated.View>

          <View style={styles.levelPanel}>
            <View style={styles.levelHeader}>
              <Text style={styles.levelLabel}>Lv. {data.new_level}</Text>
              <Text style={styles.levelProgress}>
                {levelXp} / {levelMax} XP
              </Text>
            </View>
            <View style={styles.levelBarBg}>
              <View style={[styles.levelBarFill, { width: `${levelPercent}%` }]} />
            </View>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={[
            styles.bodyContent,
            { paddingBottom: Math.max(insets.bottom + 18, 24) },
          ]}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <View style={styles.impactCard}>
            <View style={styles.sectionTitleRow}>
              <View style={styles.sectionIcon}>
                <Ionicons name="sparkles" size={17} color={colors.primary} />
              </View>
              <Text style={styles.impactTitle}>Your Impact Today</Text>
            </View>
            <View style={styles.impactGrid}>
              <ImpactRow
                label="Actions Logged"
                value={`${todayActions} Actions`}
                icon="checkmark-circle-outline"
                iconColor={colors.success}
              />
              <ImpactRow
                label="Total XP Earned"
                value={`${todayXp} XP`}
                icon="star-outline"
                iconColor={colors.xpColor}
              />
              {parseFloat(todayCo2) > 0 && (
                <ImpactRow
                  label="CO2 Saved"
                  value={`${todayCo2} Kg`}
                  icon="leaf-outline"
                  iconColor={colors.primary}
                />
              )}
              {parseFloat(todayLitre) > 0 && (
                <ImpactRow
                  label="Water Saved"
                  value={`${todayLitre} L`}
                  icon="water-outline"
                  iconColor={colors.info}
                />
              )}
              {parseFloat(todayKwh) > 0 && (
                <ImpactRow
                  label="Energy Saved"
                  value={`${todayKwh} kWh`}
                  icon="flash-outline"
                  iconColor={colors.xpColor}
                />
              )}
            </View>
          </View>

          {streak_reward && (
            <View style={styles.streakCard}>
              <View style={styles.streakIconWrap}>
                <Ionicons name="flame" size={25} color={colors.streakColor} />
              </View>
              <View style={styles.streakCopy}>
                <Text style={styles.streakCardTitle}>
                  Day {streak_reward.day} Reward Unlocked!
                </Text>
                <Text style={styles.streakCardText}>
                  Claim +{streak_reward.xp_reward} XP from Home.
                </Text>
              </View>
            </View>
          )}

          {!streak_reward && <View style={styles.noRewardButtonSpacer} />}

          <SoundTouchableOpacity
            style={styles.logAnotherBtn}
            onPress={() => router.replace('/(tabs)/log-action')}
          >
            <Ionicons name="add-circle" size={21} color="#fff" />
            <Text style={styles.logAnotherText}>Log Another Action</Text>
          </SoundTouchableOpacity>

          <SoundTouchableOpacity
            style={styles.homeBtn}
            onPress={() => router.replace('/(tabs)/home')}
          >
            <Ionicons name="home-outline" size={18} color={colors.textSecondary} />
            <Text style={styles.homeBtnText}>Back to Home</Text>
          </SoundTouchableOpacity>
        </ScrollView>
      </View>

      <LevelUpModal
        visible={activeModal?.type === 'level-up'}
        level={activeModal?.level}
        onClose={handleRewardModalClose}
      />

      <BadgeUnlockedModal
        visible={activeModal?.type === 'badge'}
        badge={activeModal?.badge}
        onClose={handleRewardModalClose}
      />
    </View>
  );
}

function buildModalQueue(result) {
  const queue = [];

  if (result?.level_up) {
    queue.push({ type: 'level-up', level: result.new_level });
  }

  getUnlockedBadges(result).forEach((badge) => {
    queue.push({ type: 'badge', badge });
  });

  return queue;
}

function getUnlockedBadges(result) {
  const badges = Array.isArray(result?.new_badges)
    ? result.new_badges
    : result?.new_badge
      ? [result.new_badge]
      : [];

  const seen = new Set();
  return badges.filter((badge) => {
    if (!badge) return false;
    const key = badge.id || `${badge.badge_name}:${badge.name}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function ImpactRow({ label, value, icon, iconColor }) {
  return (
    <View style={styles.impactRow}>
      <View style={styles.impactRowLeft}>
        <Ionicons name={icon} size={18} color={iconColor} />
        <Text style={styles.impactRowLabel}>{label}</Text>
      </View>
      <Text style={styles.impactRowValue}>{value}</Text>
    </View>
  );
}

function getLevelMax(level) {
  const table = {
    1: 100, 2: 200, 3: 300, 4: 400, 5: 500,
    6: 600, 7: 700, 8: 800, 9: 900, 10: 1000,
  };
  return table[level] || 1000;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#eafff3' },
  content: {
    flex: 1,
    backgroundColor: '#eafff3',
  },
  bodyContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
    gap: 9,
  },
  noRewardButtonSpacer: { height: 20 },
  heroCard: {
    backgroundColor: '#18b85f',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    paddingHorizontal: 28,
    paddingBottom: 14,
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: '#166534',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 7,
  },
  heroPatternOne: {
    position: 'absolute',
    top: 34,
    right: -46,
    width: 180,
    height: 54,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.16)',
    transform: [{ rotate: '-24deg' }],
  },
  heroPatternTwo: {
    position: 'absolute',
    bottom: 22,
    left: -62,
    width: 190,
    height: 58,
    borderRadius: 18,
    backgroundColor: 'rgba(15,118,110,0.22)',
    transform: [{ rotate: '-24deg' }],
  },
  heroTopRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  successBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#fff',
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 6,
  },
  successBadgeText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '800',
  },
  streakPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(17,24,39,0.22)',
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 6,
  },
  streakPillText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
  },
  doneRing: {
    width: 62,
    height: 62,
    borderRadius: 31,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.72)',
    marginBottom: 6,
  },
  congrats: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.82)',
    fontWeight: '700',
    marginBottom: 0,
  },
  actionLogged: {
    fontSize: 27,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 8,
    letterSpacing: 0,
  },
  xpBubble: {
    minWidth: 190,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#fff4c7',
    borderRadius: 22,
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginBottom: 8,
  },
  xpGained: {
    fontSize: 30,
    fontWeight: '900',
    color: colors.xpColor,
  },
  xpBreakdown: {
    width: '100%',
    fontSize: 13,
    color: '#b45309',
    fontWeight: '700',
    textAlign: 'center',
    marginTop: -2,
  },
  levelPanel: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 15,
    padding: 9,
  },
  levelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  levelLabel: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '900',
  },
  levelProgress: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.86)',
    fontWeight: '700',
  },
  levelBarBg: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.30)',
    borderRadius: 999,
    overflow: 'hidden',
  },
  levelBarFill: {
    height: '100%',
    backgroundColor: '#facc15',
    borderRadius: 999,
  },
  impactCard: {
    backgroundColor: colors.bgWhite,
    borderRadius: 20,
    padding: 13,
    borderWidth: 1,
    borderColor: 'rgba(34,197,94,0.16)',
    shadowColor: '#14532d',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 3,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 9,
  },
  sectionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryBg,
  },
  impactTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.textPrimary,
  },
  impactGrid: { gap: 9 },
  impactRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 13,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  impactRowLeft: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  impactRowLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  impactRowValue: {
    fontSize: 14,
    fontWeight: '900',
    color: colors.textPrimary,
  },
  streakCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#fff7ed',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#fed7aa',
  },
  streakIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffedd5',
  },
  streakCopy: {
    flex: 1,
    minWidth: 0,
  },
  streakCardTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: colors.streakColor,
  },
  streakCardText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 3,
    fontWeight: '600',
  },
  logAnotherBtn: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: colors.primary,
    borderRadius: 16,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.24,
    shadowRadius: 12,
    elevation: 5,
  },
  logAnotherText: {
    color: colors.textWhite,
    fontSize: 16,
    fontWeight: '900',
  },
  homeBtn: {
    flexDirection: 'row',
    gap: 7,
    borderWidth: 1,
    borderColor: 'rgba(17,24,39,0.10)',
    backgroundColor: 'rgba(255,255,255,0.84)',
    borderRadius: 16,
    height: 45,
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeBtnText: {
    color: colors.textSecondary,
    fontSize: 15,
    fontWeight: '800',
  },
});
