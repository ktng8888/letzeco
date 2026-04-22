import {
  ScrollView, View, Text, StyleSheet,
  RefreshControl, TouchableOpacity, Image, Modal, Alert
} from 'react-native';
import { useState, useCallback } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import useAuthStore from '../../store/authStore';
import userService from '../../services/userService';
import actionService from '../../services/actionService';
import challengeService from '../../services/challengeService';
import notificationService from '../../services/notificationService';
import profileService from '../../services/profileService';

import LoadingScreen from '../../components/common/LoadingScreen';
import SectionHeader from '../../components/common/SectionHeader';
import EmptyState from '../../components/common/EmptyState';
import ChallengeMiniCard from '../../components/home/ChallengeMiniCard';
import TodayActionCard from '../../components/home/TodayActionCard';
import { getImageUrl } from '../../utils/imageUrl';
import { BASE_URL } from '../../constants/api';
import colors from '../../constants/colors';

const XP_TABLE: Record<number, number> = {
  1: 100, 2: 200, 3: 300, 4: 400, 5: 500,
  6: 600, 7: 700, 8: 800, 9: 900, 10: 1000,
};

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

type StreakReward = {
  id: number;
  day: number;
  xp_reward: number;
  badge_name: string | null;
  badge_image: string | null;
  user_streak_reward_id: number | null;
  obtain_date: string | null;
  claim_status: string | null;
  is_earned: boolean;
};

export default function HomeScreen() {
  const router = useRouter();
  const { user, updateUser } = useAuthStore();

  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [todayActions, setTodayActions] = useState<any[]>([]);
  const [myChallenges, setMyChallenges] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [streakRewards, setStreakRewards] = useState<StreakReward[]>([]);
  const [todayLoggedCount, setTodayLoggedCount] = useState(0);

  const [claimModal, setClaimModal] = useState(false);
  const [claimingReward, setClaimingReward] = useState<StreakReward | null>(null);
  const [isClaiming, setIsClaiming] = useState(false);

  const loadData = async () => {
    try {
      const [profileData, todayData, challengeData, notifData, streakData] =
        await Promise.all([
          userService.getProfile(),
          actionService.getTodayActions(),
          challengeService.getMyChallenges(),
          notificationService.getAll(),
          profileService.getStreakRewards(),
        ]);

      updateUser(profileData.data);
      const actions = todayData.data.actions || [];
      setTodayActions(actions);
      setTodayLoggedCount(
        actions.filter((a: any) => a.status === 'completed').length
      );
      setMyChallenges(challengeData.data.slice(0, 2) || []);
      setUnreadCount(notifData.data.unread_count || 0);
      setStreakRewards(streakData.data.rewards || []);

    } catch (err) {
      console.error('Load home error:', err);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { loadData(); }, []));

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, []);

  const handleClaimPress = (reward: StreakReward) => {
    if (!reward.is_earned) return;
    if (reward.claim_status === 'claimed') return;
    if (todayLoggedCount === 0) {
      Alert.alert(
        'Log an action first! 🌿',
        'You need to log at least one eco-action today before claiming your streak reward.',
        [{ text: 'Got it', style: 'default' }]
      );
      return;
    }
    setClaimingReward(reward);
    setClaimModal(true);
  };

  const handleConfirmClaim = async () => {
    if (!claimingReward) return;
    setIsClaiming(true);
    try {
      await profileService.claimStreakReward(claimingReward.user_streak_reward_id);
      setClaimModal(false);
      setClaimingReward(null);
      loadData();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to claim.');
    } finally {
      setIsClaiming(false);
    }
  };

  if (isLoading) return <LoadingScreen />;

  const xpToNextLevel = XP_TABLE[user?.level] || 1000;
  const xpPercent = Math.min(((user?.level_xp || 0) / xpToNextLevel) * 100, 100);
  const streak = user?.streak || 0;

  const today = new Date();
  const todayDayIndex = today.getDay();
  const streakDays = Array.from({ length: 7 }, (_, i) => {
    const dayIndex = (todayDayIndex + i) % 7;
    const reward = streakRewards[i] || null;
    return {
      dayName: DAY_NAMES[dayIndex],
      reward,
      isToday: i === 0,
    };
  });

  const hasUnclaimed = streakRewards.some(
    (r: StreakReward) => r.is_earned && r.claim_status === 'unclaimed'
  );

  const avatarUri = user?.profile_image
    ? `${BASE_URL}/${user.profile_image}`
    : null;

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.primary}
        />
      }
    >
      {/* ── HERO CARD ── */}
      <View style={styles.heroCard}>
        <View style={styles.heroTop}>
          <View style={styles.xpPills}>
            <View style={styles.xpPill}>
              <Text style={styles.xpPillValue}>{user?.weekly_xp || 0}</Text>
              <Text style={styles.xpPillLabel}>Weekly XP</Text>
            </View>
            <View style={styles.xpPill}>
              <Text style={styles.xpPillValue}>{user?.total_xp || 0}</Text>
              <Text style={styles.xpPillLabel}>Total XP</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.bellBtn}
            onPress={() => router.push('/screens/notifications')}
          >
            <Ionicons name="notifications-outline" size={22} color="#fff" />
            {unreadCount > 0 && (
              <View style={styles.notifBadge}>
                <Text style={styles.notifBadgeText}>{unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.avatarSection}
          onPress={() => router.push('/(tabs)/profile')}
        >
          <View style={styles.avatarRing}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInitial}>
                  {user?.username?.charAt(0).toUpperCase() || '?'}
                </Text>
              </View>
            )}
          </View>
          <Text style={styles.heroUsername}>{user?.username}</Text>
          <View style={styles.levelBadge}>
            <Text style={styles.levelBadgeText}>Lv. {user?.level}</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.xpBarWrap}>
          <View style={styles.xpBarBg}>
            <View style={[styles.xpBarFill, { width: `${xpPercent}%` }]} />
          </View>
          <Text style={styles.xpBarLabel}>
            {user?.level_xp} / {xpToNextLevel} XP
          </Text>
        </View>
      </View>

      {/* ── STREAK CARD ── */}
      <View style={styles.streakCard}>
        <View style={styles.streakHeader}>
          <Text style={styles.streakTitle}>🔥 {streak} Day Streak!</Text>
          <Text style={styles.streakMotivation}>{getMotivation(streak)}</Text>
        </View>

        {hasUnclaimed && todayLoggedCount > 0 && (
          <View style={styles.claimBanner}>
            <Ionicons name="gift-outline" size={16} color="#f59e0b" />
            <Text style={styles.claimBannerText}>
              You have rewards to claim! Tap a day below.
            </Text>
          </View>
        )}

        {hasUnclaimed && todayLoggedCount === 0 && (
          <View style={[styles.claimBanner, { backgroundColor: colors.primaryBg }]}>
            <Ionicons name="information-circle-outline" size={16} color={colors.primary} />
            <Text style={[styles.claimBannerText, { color: colors.primary }]}>
              Log an action today to unlock claimable rewards!
            </Text>
          </View>
        )}

        <View style={styles.streakDays}>
          {streakDays.map((item, i) => {
            const reward = item.reward;
            const isClaimed = reward?.claim_status === 'claimed';
            const isEarned = reward?.is_earned;
            const isUnclaimed = isEarned && !isClaimed;
            const canClaim = isUnclaimed && todayLoggedCount > 0;

            return (
              <TouchableOpacity
                key={i}
                style={styles.dayCol}
                onPress={() => reward && handleClaimPress(reward)}
                disabled={!reward || !isUnclaimed}
              >
                <Text style={[
                  styles.dayName,
                  item.isToday && styles.dayNameToday
                ]}>
                  {item.dayName}
                </Text>
                <View style={[
                  styles.dayBox,
                  isClaimed && styles.dayBoxClaimed,
                  canClaim && styles.dayBoxCanClaim,
                  item.isToday && !isEarned && styles.dayBoxToday,
                ]}>
                  {isClaimed ? (
                    <Ionicons name="checkmark" size={18} color="#fff" />
                  ) : canClaim ? (
                    <Ionicons name="gift" size={18} color="#f59e0b" />
                  ) : reward?.badge_image ? (
                    <Image
                      source={{ uri: getImageUrl(reward.badge_image) ?? undefined }}
                      style={styles.dayBadgeImg}
                    />
                  ) : (
                    <Text style={styles.dayEmoji}>
                      {isEarned ? '⭐' : ''}
                    </Text>
                  )}
                </View>
                <Text style={[
                  styles.dayXp,
                  isClaimed && { color: colors.primary }
                ]}>
                  {reward ? `${reward.xp_reward} XP` : '—'}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* ── CHALLENGES ── */}
      <View style={styles.section}>
        <SectionHeader
          title="Challenges"
          linkText="View Challenges >"
          onPress={() => router.push('/screens/challenges')}
        />
        {myChallenges.length === 0 ? (
          <EmptyState
            title="No challenges yet. Join one!"
            subtitle="Start your eco-journey by joining a challenge."
            buttonText="View Challenges"
            onButtonPress={() => router.push('/screens/challenges')}
          />
        ) : (
          myChallenges.map((c: any) => (
            <ChallengeMiniCard
              key={c.id}
              challenge={c}
              onPress={() => router.push({
                pathname: '/screens/challenge-detail',
                params: { id: c.challenge_id }
              })}
            />
          ))
        )}
      </View>

      {/* ── TODAY'S ACTIONS ── */}
      <View style={styles.section}>
        <SectionHeader
          title="Today's Actions"
          linkText="View Actions >"
          onPress={() => router.push('/(tabs)/log-action')}
        />
        {todayActions.length === 0 ? (
          <EmptyState
            title="A fresh start awaits!"
            subtitle="Today is perfect to begin. What eco-action will you take?"
            buttonText="Start Logging"
            onButtonPress={() => router.push('/(tabs)/log-action')}
          />
        ) : (
          <>
            <Text style={styles.todayCount}>
              Total action logged/logging today: {todayActions.length}
            </Text>
            {todayActions.map((a: any) => (
              <TodayActionCard key={a.id} action={a} />
            ))}
          </>
        )}
      </View>

      <View style={{ height: 30 }} />

      {/* ── CLAIM MODAL ── */}
      <Modal visible={claimModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalEmoji}>🎁</Text>
            <Text style={styles.modalTitle}>Claim Streak Reward!</Text>
            <Text style={styles.modalSubtitle}>
              Day {claimingReward?.day} Streak
            </Text>
            <View style={styles.modalRewardRow}>
              <Text style={styles.modalXp}>+{claimingReward?.xp_reward} XP</Text>
              {claimingReward?.badge_name && (
                <Text style={styles.modalBadge}>
                  🏅 {claimingReward.badge_name}
                </Text>
              )}
            </View>
            <TouchableOpacity
              style={styles.modalClaimBtn}
              onPress={handleConfirmClaim}
              disabled={isClaiming}
            >
              <Text style={styles.modalClaimBtnText}>
                {isClaiming ? 'Claiming...' : 'Claim Now!'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setClaimModal(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

function getMotivation(streak: number) {
  if (!streak || streak === 0) return 'Start your streak today!';
  if (streak < 3) return 'Great start! Keep going!';
  if (streak < 7) return "You're on a roll! 🔥";
  if (streak < 14) return "Keep going! You're amazing!";
  return 'Unstoppable eco warrior! 💪';
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgLight },

  // Hero
  heroCard: {
    backgroundColor: colors.primary,
    paddingTop: 52,
    paddingBottom: 24,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  xpPills: { flexDirection: 'row', gap: 8 },
  xpPill: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: 'center',
  },
  xpPillValue: { fontSize: 14, fontWeight: '700', color: '#fff' },
  xpPillLabel: { fontSize: 10, color: 'rgba(255,255,255,0.8)' },
  bellBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center', justifyContent: 'center',
  },
  notifBadge: {
    position: 'absolute', top: -2, right: -2,
    backgroundColor: colors.error,
    borderRadius: 8, minWidth: 16, height: 16,
    alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 3,
  },
  notifBadgeText: { fontSize: 10, color: '#fff', fontWeight: '700' },

  avatarSection: { alignItems: 'center', marginBottom: 16 },
  avatarRing: {
    width: 88, height: 88, borderRadius: 44,
    borderWidth: 3, borderColor: 'rgba(255,255,255,0.8)',
    marginBottom: 10, overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  avatar: { width: '100%', height: '100%' },
  avatarPlaceholder: {
    width: '100%', height: '100%',
    alignItems: 'center', justifyContent: 'center',
  },
  avatarInitial: { fontSize: 34, fontWeight: '700', color: '#fff' },
  heroUsername: {
    fontSize: 20, fontWeight: '700', color: '#fff', marginBottom: 6,
  },
  levelBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 4,
  },
  levelBadgeText: { fontSize: 13, fontWeight: '600', color: '#fff' },

  xpBarWrap: { marginTop: 4 },
  xpBarBg: {
    height: 8, backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 4, overflow: 'hidden',
  },
  xpBarFill: {
    height: '100%', backgroundColor: '#fff', borderRadius: 4,
  },
  xpBarLabel: {
    fontSize: 11, color: 'rgba(255,255,255,0.85)',
    textAlign: 'center', marginTop: 5,
  },

  // Streak
  streakCard: {
    backgroundColor: colors.bgWhite,
    marginHorizontal: 16, marginTop: 14,
    borderRadius: 16, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  streakHeader: { alignItems: 'center', marginBottom: 10 },
  streakTitle: {
    fontSize: 18, fontWeight: '700', color: colors.textPrimary,
  },
  streakMotivation: {
    fontSize: 13, color: colors.textSecondary, marginTop: 2,
  },
  claimBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#fef3c7', borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 8, marginBottom: 12,
  },
  claimBannerText: { fontSize: 12, color: '#92400e', flex: 1 },

  streakDays: { flexDirection: 'row', justifyContent: 'space-between' },
  dayCol: { alignItems: 'center', flex: 1 },
  dayName: {
    fontSize: 10, color: colors.textSecondary,
    marginBottom: 6, fontWeight: '500',
  },
  dayNameToday: { color: colors.primary, fontWeight: '700' },
  dayBox: {
    width: 38, height: 38, borderRadius: 10,
    backgroundColor: colors.bgGrey,
    alignItems: 'center', justifyContent: 'center', marginBottom: 4,
    borderWidth: 1, borderColor: colors.border,
  },
  dayBoxClaimed: {
    backgroundColor: colors.primary, borderColor: colors.primary,
  },
  dayBoxCanClaim: {
    backgroundColor: '#fef3c7', borderColor: '#f59e0b', borderWidth: 2,
  },
  dayBoxToday: { borderColor: colors.primary, borderWidth: 2 },
  dayBadgeImg: { width: 26, height: 26, borderRadius: 13 },
  dayEmoji: { fontSize: 14 },
  dayXp: { fontSize: 10, color: colors.textSecondary, fontWeight: '500' },

  // Sections
  section: { marginHorizontal: 16, marginTop: 16 },
  todayCount: { fontSize: 12, color: colors.textSecondary, marginBottom: 8 },

  // Modal
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center', justifyContent: 'center', padding: 24,
  },
  modal: {
    backgroundColor: '#fff', borderRadius: 24,
    padding: 28, alignItems: 'center', width: '100%', gap: 8,
  },
  modalEmoji: { fontSize: 52 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: colors.textPrimary },
  modalSubtitle: { fontSize: 14, color: colors.textSecondary },
  modalRewardRow: { alignItems: 'center', gap: 4, marginVertical: 8 },
  modalXp: { fontSize: 24, fontWeight: '700', color: colors.xpColor },
  modalBadge: { fontSize: 14, color: colors.textSecondary },
  modalClaimBtn: {
    backgroundColor: colors.primary, borderRadius: 14,
    paddingVertical: 14, width: '100%',
    alignItems: 'center', marginTop: 4,
  },
  modalClaimBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  modalCancel: {
    fontSize: 14, color: colors.textSecondary, marginTop: 4,
  },
});