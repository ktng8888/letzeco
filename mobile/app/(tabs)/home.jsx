import { useState, useCallback } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import useAuthStore from '../../store/authStore';
import userService from '../../services/userService';
import actionService from '../../services/actionService';
import challengeService from '../../services/challengeService';
import notificationService from '../../services/notificationService';
import profileService from '../../services/profileService';

import LoadingScreen from '../../components/common/LoadingScreen';
import HomeTopBar from '../../components/home/HomeTopBar';
import ChallengeCarousel from '../../components/home/ChallengeCarousel';
import StreakRewardsCard from '../../components/home/StreakRewardsCard';
import TodayActionsSection from '../../components/home/TodayActionsSection';
import ClaimRewardModal from '../../components/home/ClaimRewardModal';
import colors from '../../constants/colors';

export default function HomeScreen() {
  const router = useRouter();
  const { user, updateUser } = useAuthStore();

  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [todayActions, setTodayActions] = useState([]);
  const [myChallenges, setMyChallenges] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [streakRewards, setStreakRewards] = useState([]);
  const [giftCount, setGiftCount] = useState(0);
  const [todayLoggedCount, setTodayLoggedCount] = useState(0);
  const [claimModal, setClaimModal] = useState(false);
  const [claimingReward, setClaimingReward] = useState(null);
  const [isClaiming, setIsClaiming] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);

  const loadData = useCallback(async () => {
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
      setTodayLoggedCount(actions.filter(action => action.status === 'completed').length);
      setMyChallenges(challengeData.data.slice(0, 5) || []);
      setUnreadCount(notifData.data.unread_count || 0);
      setStreakRewards(streakData.data.rewards || []);

      const giftData = await challengeService.getGifts();
      setGiftCount(giftData.data.count || 0);
    } catch (err) {
      console.error('Load home error:', err);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [updateUser]);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  const xpToNextLevel = user?.xp_to_next_level || 1000;
  const xpPercent = Math.min(((user?.level_xp || 0) / xpToNextLevel) * 100, 100);
  const streak = user?.streak || 0;

  const handleClaimPress = reward => {
    if (
      !reward.is_earned &&
      reward.day === streak + 1 &&
      todayLoggedCount === 0
    ) {
      Alert.alert(
        `Day ${reward.day} is ready`,
        'Log one eco-action today to unlock this streak reward.',
        [
          { text: 'Later', style: 'cancel' },
          { text: 'Log Action', onPress: () => router.push('/(tabs)/log-action') },
        ]
      );
      return;
    }

    if (
      !reward.is_earned ||
      reward.claim_status !== 'unclaimed' ||
      !reward.user_streak_reward_id
    ) {
      return;
    }

    if (todayLoggedCount === 0) {
      Alert.alert(
        'Log an action first!',
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
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to claim.');
    } finally {
      setIsClaiming(false);
    }
  };

  const handleActionPress = action => {
    if (action?.status !== 'completed' || !action?.id) return;

    router.push({
      pathname: '/screens/log-history-detail',
      params: { logId: action.id },
    });
  };

  if (isLoading) return <LoadingScreen />;

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
        <HomeTopBar
          user={user}
          xpToNextLevel={xpToNextLevel}
          xpPercent={xpPercent}
          giftCount={giftCount}
          unreadCount={unreadCount}
          onProfilePress={() => router.push('/(tabs)/profile')}
          onGiftsPress={() => router.push('/screens/gifts')}
          onNotificationsPress={() => router.push('/screens/notifications')}
        />

        <ChallengeCarousel
          challenges={myChallenges}
          activeSlide={activeSlide}
          onSlideChange={setActiveSlide}
          onJoinPress={() => router.push('/screens/challenges')}
          onChallengePress={challenge => {
            router.push({
              pathname: '/screens/challenge-detail',
              params: { id: challenge.challenge_id },
            });
          }}
        />

        <StreakRewardsCard
          streak={streak}
          rewards={streakRewards}
          todayLoggedCount={todayLoggedCount}
          onRewardPress={handleClaimPress}
        />

        <TodayActionsSection
          actions={todayActions}
          loggedCount={todayLoggedCount}
          onLogMorePress={() => router.push('/(tabs)/log-action')}
          onActionPress={handleActionPress}
        />

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/(tabs)/log-action')}
      >
        <Ionicons name="add" size={26} color="#fff" />
        <Text style={styles.fabText}>Log</Text>
      </TouchableOpacity>

      <ClaimRewardModal
        visible={claimModal}
        reward={claimingReward}
        isClaiming={isClaiming}
        onConfirm={handleConfirmClaim}
        onCancel={() => setClaimModal(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f0f4f0' },
  container: { flex: 1 },
  bottomSpacer: { height: 100 },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    backgroundColor: colors.primary,
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  fabText: { fontSize: 10, fontWeight: '700', color: '#fff', marginTop: -2 },
});
