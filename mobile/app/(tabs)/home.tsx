import {
  ScrollView, View, Text, StyleSheet,
  RefreshControl, TouchableOpacity, Image, Modal,
  Alert, FlatList, Dimensions
} from 'react-native';
import { useState, useCallback, useRef } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import useAuthStore from '../../store/authStore';
import userService from '../../services/userService';
import actionService from '../../services/actionService';
import challengeService from '../../services/challengeService';
import notificationService from '../../services/notificationService';
import profileService from '../../services/profileService';

import LoadingScreen from '../../components/common/LoadingScreen';
import { getImageUrl } from '../../utils/imageUrl';
import { BASE_URL } from '../../constants/api';
import colors from '../../constants/colors';

const { width: SCREEN_W } = Dimensions.get('window');
const CARD_W = SCREEN_W - 48;

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const CHALLENGE_GRADIENTS = [
  '#22c55e', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6',
];

type StreakReward = {
  id: number;
  day: number;
  xp_reward: number;
  badge_name: string | null;
  badge_image: string | null;
  user_streak_reward_id: number | null;
  claim_status: string | null;
  is_earned: boolean;
};

export default function HomeScreen() {
  const router = useRouter();
  const { user, updateUser } = useAuthStore();
  const flatListRef = useRef<FlatList>(null);

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
  const [activeSlide, setActiveSlide] = useState(0);

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
      setTodayLoggedCount(actions.filter((a: any) => a.status === 'completed').length);
      setMyChallenges(challengeData.data.slice(0, 5) || []);
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
  const onRefresh = useCallback(() => { setRefreshing(true); loadData(); }, []);

  const handleClaimPress = (reward: StreakReward) => {
    if (!reward.is_earned || reward.claim_status === 'claimed') return;
    if (todayLoggedCount === 0) {
      Alert.alert(
        'Log an action first! 🌿',
        'You need to log at least one eco-action today before claiming.',
        [{ text: 'Got it' }]
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
    } finally { setIsClaiming(false); }
  };

  if (isLoading) return <LoadingScreen />;

  const xpToNextLevel = user?.xp_to_next_level || 1000;
  const xpPercent = Math.min(((user?.level_xp || 0) / xpToNextLevel) * 100, 100);
  const streak = user?.streak || 0;
  const avatarUri = user?.profile_image ? `${BASE_URL}/${user.profile_image}` : null;

  const todayDayIndex = new Date().getDay();
  const streakDays = Array.from({ length: 7 }, (_, i) => ({
    dayName: DAY_NAMES[(todayDayIndex + i) % 7],
    reward: streakRewards[i] || null,
    isToday: i === 0,
  }));

  const hasUnclaimed = streakRewards.some(
    (r: StreakReward) => r.is_earned && r.claim_status === 'unclaimed'
  );

  const carouselItems: any[] = myChallenges.length > 0
    ? [...myChallenges, { id: 'join', isJoin: true }]
    : [{ id: 'join', isJoin: true }];

  return (
    <View style={styles.root}>
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
        {/* ── TOP BAR ── */}
        <View style={styles.topBar}>

          {/* Left: Avatar (with Lv badge at bottom) + name + XP bar */}
          <TouchableOpacity
            style={styles.topLeft}
            onPress={() => router.push('/(tabs)/profile')}
          >
            {/* Avatar wrapper: ring + absolute Lv badge */}
            <View style={styles.avatarWrap}>
              <View style={styles.avatarRing}>
                {avatarUri ? (
                  <Image source={{ uri: avatarUri }} style={styles.topAvatar} />
                ) : (
                  <View style={styles.topAvatarFallback}>
                    <Text style={styles.topAvatarInitial}>
                      {user?.username?.charAt(0).toUpperCase() || '?'}
                    </Text>
                  </View>
                )}
              </View>
              {/* Lv badge sits at the bottom center of the avatar */}
              <View style={styles.lvlChip}>
                <Text style={styles.lvlChipText}>Lv.{user?.level}</Text>
              </View>
            </View>

            <View style={styles.topNameBlock}>
              <Text style={styles.topName}>{user?.username}</Text>
              <View style={styles.topXpBarBg}>
                <View style={[styles.topXpBarFill, { width: `${xpPercent}%` }]} />
              </View>
              <Text style={styles.topXpLabel}>
                {user?.level_xp} / {xpToNextLevel} XP
              </Text>
            </View>
          </TouchableOpacity>

          {/* Right: Weekly XP + Total XP stacked, then Bell */}
          <View style={styles.topRight}>
            <View style={styles.xpStack}>
              <View style={styles.xpStackChip}>
                <Text style={styles.xpStackVal}>{user?.weekly_xp || 0}</Text>
                <Text style={styles.xpStackLabel}> Weekly XP</Text>
              </View>
              <View style={styles.xpStackChip}>
                <Text style={styles.xpStackVal}>{user?.total_xp || 0}</Text>
                <Text style={styles.xpStackLabel}> Total XP</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.bellBtn}
              onPress={() => router.push('/screens/notifications')}
            >
              <Ionicons name="notifications-outline" size={20} color={colors.textPrimary} />
              {unreadCount > 0 && <View style={styles.bellDot} />}
            </TouchableOpacity>
          </View>
        </View>

        {/* ── CHALLENGE CAROUSEL ── */}
        <View style={styles.carouselWrap}>
          <FlatList
            ref={flatListRef}
            data={carouselItems}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            snapToInterval={CARD_W + 12}
            decelerationRate="fast"
            contentContainerStyle={{ paddingHorizontal: 24, gap: 12 }}
            onScroll={e => {
              const idx = Math.round(e.nativeEvent.contentOffset.x / (CARD_W + 12));
              setActiveSlide(idx);
            }}
            keyExtractor={item => String(item.id)}
            renderItem={({ item, index }) => {
              if (item.isJoin) {
                return (
                  <TouchableOpacity
                    style={[styles.challengeCard, styles.joinCard]}
                    onPress={() => router.push('/screens/challenges')}
                  >
                    <Text style={styles.joinIcon}>🌿</Text>
                    <Text style={styles.joinTitle}>Join a Challenge!</Text>
                    <Text style={styles.joinSub}>
                      Start your eco-journey by joining a community challenge
                    </Text>
                    <View style={styles.joinBtn}>
                      <Text style={styles.joinBtnText}>Browse Challenges</Text>
                    </View>
                  </TouchableOpacity>
                );
              }
              const bgColor = CHALLENGE_GRADIENTS[index % CHALLENGE_GRADIENTS.length];
              const isTeam = item.type === 'team';
              const daysLeft = Math.max(0, Math.ceil(
                (new Date(item.end_date).getTime() - Date.now()) / 86400000
              ));
              const prog = Math.min(
                ((item.progress_value || 0) / (item.target_value || 1)) * 100, 100
              );
              return (
                <TouchableOpacity
                  style={[styles.challengeCard, { backgroundColor: bgColor }]}
                  onPress={() => router.push({
                    pathname: '/screens/challenge-detail',
                    params: { id: item.challenge_id }
                  })}
                >
                  <View style={styles.cTypeBadge}>
                    <Text style={styles.cTypeText}>
                      {isTeam ? '👥 Team' : '🎯 Solo'}
                    </Text>
                  </View>
                  <Text style={styles.cName} numberOfLines={2}>
                    {item.challenge_name}
                  </Text>
                  <Text style={styles.cDays}>
                    {daysLeft > 0 ? `${daysLeft} days left` : 'Ends today'}
                  </Text>
                  <View style={styles.cProgressBg}>
                    <View style={[styles.cProgressFill, { width: `${prog}%` }]} />
                  </View>
                  <Text style={styles.cProgressLabel}>
                    {item.progress_value || 0} / {item.target_value || '?'}
                  </Text>
                  <View style={styles.cViewBtn}>
                    <Text style={[styles.cViewBtnText, { color: bgColor }]}>View</Text>
                  </View>
                </TouchableOpacity>
              );
            }}
          />
          <View style={styles.dots}>
            {carouselItems.map((_, i) => (
              <View key={i} style={[styles.dot, i === activeSlide && styles.dotActive]} />
            ))}
          </View>
        </View>

        {/* ── STREAK ── */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>🔥 {streak} Day Streak</Text>
          <Text style={styles.streakMotiv}>{getMotivation(streak)}</Text>

          {hasUnclaimed && todayLoggedCount === 0 && (
            <View style={styles.banner}>
              <Ionicons name="information-circle-outline" size={14} color={colors.primary} />
              <Text style={styles.bannerText}>Log an action today to claim rewards!</Text>
            </View>
          )}
          {hasUnclaimed && todayLoggedCount > 0 && (
            <View style={[styles.banner, { backgroundColor: '#fef3c7' }]}>
              <Ionicons name="gift-outline" size={14} color="#f59e0b" />
              <Text style={[styles.bannerText, { color: '#92400e' }]}>
                Rewards ready! Tap to claim.
              </Text>
            </View>
          )}

          <View style={styles.streakDays}>
            {streakDays.map((item, i) => {
              const r = item.reward;
              const claimed = r?.claim_status === 'claimed';
              const earned = r?.is_earned;
              const canClaim = earned && !claimed && todayLoggedCount > 0;
              return (
                <TouchableOpacity
                  key={i}
                  style={styles.dayCol}
                  onPress={() => r && handleClaimPress(r)}
                  disabled={!r || !(earned && !claimed)}
                >
                  <Text style={[styles.dayLabel, item.isToday && styles.dayLabelToday]}>
                    {item.dayName}
                  </Text>
                  <View style={[
                    styles.dayBox,
                    claimed && styles.dayBoxClaimed,
                    canClaim && styles.dayBoxCanClaim,
                    item.isToday && !earned && styles.dayBoxToday,
                  ]}>
                    {claimed
                      ? <Ionicons name="checkmark" size={16} color="#fff" />
                      : canClaim
                        ? <Ionicons name="gift" size={16} color="#f59e0b" />
                        : r?.badge_image
                          ? <Image
                              source={{ uri: getImageUrl(r.badge_image) ?? undefined }}
                              style={styles.dayImg}
                            />
                          : <Text style={{ fontSize: 12 }}>{earned ? '⭐' : ''}</Text>
                    }
                  </View>
                  <Text style={[styles.dayXp, claimed && { color: colors.primary }]}>
                    {r ? `${r.xp_reward}XP` : '—'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ── TODAY'S ACTIONS ── */}
        <View style={styles.card}>
          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>⚡ Today's Actions</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/log-action')}>
              <Text style={styles.seeAll}>View All</Text>
            </TouchableOpacity>
          </View>

          {todayActions.length === 0 ? (
            <TouchableOpacity
              style={styles.emptyBox}
              onPress={() => router.push('/(tabs)/log-action')}
            >
              <Text style={{ fontSize: 32 }}>🌱</Text>
              <Text style={styles.emptyTitle}>Start logging today!</Text>
              <Text style={styles.emptySub}>Tap to log your first eco-action</Text>
            </TouchableOpacity>
          ) : (
            <>
              <Text style={styles.actionCount}>{todayLoggedCount} logged today</Text>
              {todayActions.map((a: any) => {
                const canOpenLogDetail = a?.status === 'completed' && !!a?.id;
                return (
                <TouchableOpacity
                  key={a.id}
                  style={styles.actionRow}
                  activeOpacity={canOpenLogDetail ? 0.75 : 1}
                  disabled={!canOpenLogDetail}
                  onPress={() => {
                    if (!canOpenLogDetail) return;
                    router.push({
                      pathname: '/screens/log-history-detail',
                      params: { logId: a.id }
                    });
                  }}
                >
                  {a.action_image ? (
                    <Image
                      source={{ uri: getImageUrl(a.action_image) ?? undefined }}
                      style={styles.actionImg}
                    />
                  ) : (
                    <View style={[styles.actionImg, {
                      backgroundColor: a.tag_bg_colour_code || colors.primaryBg,
                      alignItems: 'center', justifyContent: 'center'
                    }]}>
                      <Text style={{ fontSize: 18 }}>🌿</Text>
                    </View>
                  )}
                  <View style={styles.actionInfo}>
                    <Text style={styles.actionName} numberOfLines={1}>
                      {a.action_name}
                    </Text>
                    <Text style={styles.actionTime}>{formatActionTime(a)}</Text>
                    <View style={[styles.catTag, {
                      backgroundColor: a.tag_bg_colour_code || colors.primaryBg
                    }]}>
                      <Text style={[styles.catTagText, {
                        color: a.tag_text_colour_code || colors.primary
                      }]}>{a.category_name}</Text>
                    </View>
                  </View>
                  <View>
                    {a.status === 'in_progress' ? (
                      <View style={styles.loggingPill}>
                        <Text style={styles.loggingText}>Logging</Text>
                      </View>
                    ) : (
                      <Text style={styles.actionXp}>
                        +{a.xp_gained || a.xp_reward} XP
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              )})}
            </>
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ── FAB ── */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/(tabs)/log-action')}
      >
        <Ionicons name="add" size={26} color="#fff" />
        <Text style={styles.fabText}>Log</Text>
      </TouchableOpacity>

      {/* ── CLAIM MODAL ── */}
      <Modal visible={claimModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={{ fontSize: 52 }}>🎁</Text>
            <Text style={styles.modalTitle}>Claim Reward!</Text>
            <Text style={styles.modalSub}>Day {claimingReward?.day} Streak</Text>
            <Text style={styles.modalXp}>+{claimingReward?.xp_reward} XP</Text>
            {claimingReward?.badge_name && (
              <Text style={styles.modalBadge}>🏅 {claimingReward.badge_name}</Text>
            )}
            <TouchableOpacity
              style={styles.modalBtn}
              onPress={handleConfirmClaim}
              disabled={isClaiming}
            >
              <Text style={styles.modalBtnText}>
                {isClaiming ? 'Claiming...' : 'Claim Now!'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setClaimModal(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function getMotivation(streak: number) {
  if (!streak) return 'Start today!';
  if (streak < 3) return 'Great start! Keep going!';
  if (streak < 7) return "You're on fire! 🔥";
  if (streak < 14) return 'Keep it up! Amazing!';
  return 'Eco legend! 🌍';
}

function formatActionTime(action: any) {
  const raw =
    action?.end_time ||
    action?.completed_at ||
    action?.logged_at ||
    action?.start_time ||
    action?.created_at;

  if (!raw) return 'Time unavailable';
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return 'Time unavailable';

  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  return `${hours % 12 || 12}:${minutes} ${ampm}`;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f0f4f0' },
  container: { flex: 1 },

  // ── Top Bar ──
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 52,
    paddingBottom: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    gap: 8,
  },
  topLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
  },

  // Avatar wrap: holds ring + absolute Lv badge
  avatarWrap: {
    alignItems: 'center',
    // extra bottom space so the badge (which overflows by ~8px) isn't clipped
    marginBottom: 6,
  },
  avatarRing: {
    width: 48, height: 48, borderRadius: 24,
    borderWidth: 2.5, borderColor: colors.primary,
    overflow: 'hidden',
    backgroundColor: colors.primaryBg,
  },
  topAvatar: { width: '100%', height: '100%' },
  topAvatarFallback: {
    width: '100%', height: '100%',
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.primaryBg,
  },
  topAvatarInitial: { fontSize: 18, fontWeight: '700', color: colors.primary },

  // Lv badge: absolute, pinned to bottom-center of avatarWrap
  lvlChip: {
    position: 'absolute',
    bottom: -8,
    alignSelf: 'center',
    backgroundColor: colors.primary,
    borderRadius: 6,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderWidth: 1.5,
    borderColor: '#fff',
  },
  lvlChipText: { fontSize: 9, fontWeight: '700', color: '#fff' },

  topNameBlock: { flex: 1 },
  topName: {
    fontSize: 14, fontWeight: '700',
    color: colors.textPrimary, marginBottom: 3,
  },
  topXpBarBg: {
    height: 5, backgroundColor: '#e5e7eb',
    borderRadius: 3, overflow: 'hidden',
  },
  topXpBarFill: {
    height: '100%', backgroundColor: colors.primary, borderRadius: 3,
  },
  topXpLabel: { fontSize: 10, color: colors.textSecondary, marginTop: 2 },

  // Right side: xpStack + bell
  topRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  xpStack: {
    gap: 4,
  },
  xpStackChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  xpStackVal: {
    fontSize: 12, fontWeight: '700', color: colors.textPrimary,
  },
  xpStackLabel: {
    fontSize: 11, color: colors.textSecondary,
  },
  bellBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: '#f3f4f6',
    alignItems: 'center', justifyContent: 'center',
  },
  bellDot: {
    position: 'absolute', top: 4, right: 4,
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: colors.error,
  },

  // ── Carousel ──
  carouselWrap: { paddingTop: 14, paddingBottom: 4 },
  challengeCard: {
    width: CARD_W, borderRadius: 20, padding: 20,
    minHeight: 175, justifyContent: 'space-between',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12, shadowRadius: 8, elevation: 5,
  },
  joinCard: {
    backgroundColor: colors.primaryBg,
    borderWidth: 2, borderColor: colors.primaryLight,
    alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  joinIcon: { fontSize: 32 },
  joinTitle: { fontSize: 17, fontWeight: '700', color: colors.primary },
  joinSub: { fontSize: 12, color: colors.textSecondary, textAlign: 'center' },
  joinBtn: {
    backgroundColor: colors.primary, borderRadius: 12,
    paddingHorizontal: 20, paddingVertical: 10, marginTop: 4,
  },
  joinBtnText: { fontSize: 13, fontWeight: '700', color: '#fff' },
  cTypeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4,
  },
  cTypeText: { fontSize: 11, fontWeight: '600', color: '#fff' },
  cName: { fontSize: 17, fontWeight: '700', color: '#fff', marginTop: 6 },
  cDays: { fontSize: 11, color: 'rgba(255,255,255,0.8)', marginBottom: 6 },
  cProgressBg: {
    height: 5, backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 3, overflow: 'hidden',
  },
  cProgressFill: { height: '100%', backgroundColor: '#fff', borderRadius: 3 },
  cProgressLabel: { fontSize: 10, color: 'rgba(255,255,255,0.8)', marginTop: 3 },
  cViewBtn: {
    alignSelf: 'flex-end', backgroundColor: '#fff',
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 6, marginTop: 8,
  },
  cViewBtnText: { fontSize: 12, fontWeight: '700' },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 5, marginTop: 10 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#d1d5db' },
  dotActive: { backgroundColor: colors.primary, width: 16 },

  // ── Cards ──
  card: {
    backgroundColor: '#fff', marginHorizontal: 16, marginTop: 12,
    borderRadius: 18, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  sectionRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 12,
  },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  seeAll: { fontSize: 13, color: colors.primary, fontWeight: '600' },

  // ── Streak ──
  streakMotiv: { fontSize: 12, color: colors.textSecondary, marginBottom: 10, marginTop: 2 },
  banner: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: colors.primaryBg, borderRadius: 10,
    paddingHorizontal: 10, paddingVertical: 7, marginBottom: 10,
  },
  bannerText: { fontSize: 12, color: colors.primary, flex: 1 },
  streakDays: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  dayCol: { alignItems: 'center', flex: 1 },
  dayLabel: {
    fontSize: 10, color: colors.textSecondary,
    marginBottom: 5, fontWeight: '500',
  },
  dayLabelToday: { color: colors.primary, fontWeight: '700' },
  dayBox: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center',
    marginBottom: 3, borderWidth: 1, borderColor: '#e5e7eb',
  },
  dayBoxClaimed: { backgroundColor: colors.primary, borderColor: colors.primary },
  dayBoxCanClaim: { backgroundColor: '#fef3c7', borderColor: '#f59e0b', borderWidth: 2 },
  dayBoxToday: { borderColor: colors.primary, borderWidth: 2 },
  dayImg: { width: 24, height: 24, borderRadius: 12 },
  dayXp: { fontSize: 9, color: colors.textSecondary, fontWeight: '600' },

  // ── Today Actions ──
  actionCount: { fontSize: 12, color: colors.textSecondary, marginBottom: 10 },
  emptyBox: {
    alignItems: 'center', paddingVertical: 20, gap: 6,
    backgroundColor: colors.primaryBg, borderRadius: 14,
  },
  emptyTitle: { fontSize: 14, fontWeight: '700', color: colors.primary },
  emptySub: { fontSize: 12, color: colors.textSecondary },
  actionRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    marginBottom: 10, paddingBottom: 10,
    borderBottomWidth: 1, borderBottomColor: '#f3f4f6',
  },
  actionImg: { width: 44, height: 44, borderRadius: 12 },
  actionInfo: { flex: 1, gap: 4 },
  actionName: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  actionTime: { fontSize: 11, color: colors.textSecondary, marginTop: -1 },
  catTag: {
    alignSelf: 'flex-start', paddingHorizontal: 8,
    paddingVertical: 2, borderRadius: 6,
  },
  catTagText: { fontSize: 11, fontWeight: '600' },
  actionXp: { fontSize: 14, fontWeight: '700', color: colors.xpColor },
  loggingPill: {
    backgroundColor: colors.streakBg, borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  loggingText: { fontSize: 12, fontWeight: '600', color: colors.streakColor },

  // ── FAB ──
  fab: {
    position: 'absolute', bottom: 24, right: 20,
    backgroundColor: colors.primary,
    width: 58, height: 58, borderRadius: 29,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 8, elevation: 8,
  },
  fabText: { fontSize: 10, fontWeight: '700', color: '#fff', marginTop: -2 },

  // ── Modal ──
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center', justifyContent: 'center', padding: 24,
  },
  modal: {
    backgroundColor: '#fff', borderRadius: 24,
    padding: 28, alignItems: 'center', width: '100%', gap: 8,
  },
  modalTitle: { fontSize: 20, fontWeight: '700', color: colors.textPrimary },
  modalSub: { fontSize: 14, color: colors.textSecondary },
  modalXp: { fontSize: 26, fontWeight: '700', color: colors.xpColor },
  modalBadge: { fontSize: 14, color: colors.textSecondary },
  modalBtn: {
    backgroundColor: colors.primary, borderRadius: 14,
    paddingVertical: 14, width: '100%', alignItems: 'center', marginTop: 8,
  },
  modalBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  modalCancel: { fontSize: 14, color: colors.textSecondary, marginTop: 4 },
});
