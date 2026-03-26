import {
  ScrollView, View, Text, StyleSheet,
  RefreshControl
} from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';

import useAuthStore from '../../store/authStore';
import userService from '../../services/userService';
import actionService from '../../services/actionService';
import challengeService from '../../services/challengeService';
import notificationService from '../../services/notificationService';

import LoadingScreen from '../../components/common/LoadingScreen';
import ScreenHeader from '../../components/common/ScreenHeader';
import SectionHeader from '../../components/common/SectionHeader';
import EmptyState from '../../components/common/EmptyState';
import UserCard from '../../components/home/UserCard';
import ChallengeMiniCard from '../../components/home/ChallengeMiniCard';
import TodayActionCard from '../../components/home/TodayActionCard';
import colors from '../../constants/colors';

// XP needed per level — match your DB
const XP_TABLE = {
  1: 100, 2: 200, 3: 300, 4: 400, 5: 500,
  6: 600, 7: 700, 8: 800, 9: 900, 10: 1000,
};

export default function HomeScreen() {
  const router = useRouter();
  const { user, updateUser } = useAuthStore();

  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [todayActions, setTodayActions] = useState([]);
  const [myChallenges, setMyChallenges] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadData = async () => {
    try {
      const [profileData, todayData, challengeData, notifData] =
        await Promise.all([
          userService.getProfile(),
          actionService.getTodayActions(),
          challengeService.getMyChallenges(),
          notificationService.getAll(),
        ]);

      updateUser(profileData.data);
      setTodayActions(todayData.data.actions || []);
      setMyChallenges(challengeData.data.slice(0, 2) || []);
      setUnreadCount(notifData.data.unread_count || 0);

    } catch (err) {
      console.error('Load home error:', err);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
      useCallback(() => { loadData(); }, [])
  );
  
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, []);

  if (isLoading) return <LoadingScreen />;

  const xpToNextLevel = XP_TABLE[user?.level] || 1000;

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
      {/* Header */}
      <ScreenHeader
        title={`${getGreeting()}, ${user?.username || 'Eco Warrior'} 👋`}
        subtitle="Keep making the world greener!"
        showBell
        unreadCount={unreadCount}
      />

      {/* User Card */}
      <UserCard user={user} xpToNextLevel={xpToNextLevel} />

      {/* Challenges Section */}
      <View style={styles.section}>
        <SectionHeader
          title="Challenge"
          linkText="View Challenges"
          onPress={() => router.push('/screens/challenges')}
        />
        {myChallenges.length === 0 ? (
          <EmptyState 
            title="No challenges yet. Join one!" 
            subtitle="Start your eco-journey by joining a challenge. Every small step counts!"
            buttonText="View Challenge"
            onButtonPress={() => router.push('/screens/challenges')}/>
        ) : (
          myChallenges.map((c) => (
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

      {/* Today's Actions Section */}
      <View style={styles.section}>
        <SectionHeader
          title="Today's Actions"
          linkText="View Actions"
          onPress={() => router.push('/(tabs)/log-action')}
        />
        {todayActions.length === 0 ? (
          <EmptyState
            title="A fresh start awaits"
            subtitle="Today is perfect to begin. What eco-action will you take?"
            buttonText="Start Logging"
            onButtonPress={() => router.push('/(tabs)/log-action')}
          />
        ) : (
          <>
            <Text style={styles.todayCount}>
              Total action logged/logging today: {todayActions.length}
            </Text>
            {todayActions.map((a) => (
              <TodayActionCard key={a.id} action={a} />
            ))}
          </>
        )}
      </View>

      <View style={{ height: 20 }} />
    </ScrollView>
  );
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgLight,
  },
  section: {
    marginHorizontal: 16,
    marginTop: 16,
  },
  todayCount: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 8,
  },
});