import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, RefreshControl
} from 'react-native';
import { useState, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import challengeService from '../../services/challengeService';
import LoadingScreen from '../../components/common/LoadingScreen';
import EmptyState from '../../components/common/EmptyState';
import ChallengeCard from '../../components/challenges/ChallengeCard';
import colors from '../../constants/colors';

const TABS = ['Participating', 'Available', 'Completed'];

export default function ChallengesScreen() {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('Participating');
  const [allChallenges, setAllChallenges] = useState([]);
  const [myChallenges, setMyChallenges] = useState([]);

  const loadData = async () => {
    try {
      const [allData, myData] = await Promise.all([
        challengeService.getAll(),
        challengeService.getMyChallenges(),
      ]);
      setAllChallenges(allData.data || []);
      setMyChallenges(myData.data || []);
    } catch (err) {
      console.error('Load challenges error:', err);
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

  // Split challenges into tabs
  const participating = allChallenges.filter(c => c.is_participating);
  const available = allChallenges.filter(
    c => !c.is_participating && c.status === 'active'
  );
  const completed = myChallenges.filter(
    c => c.challenge_status === 'completed'
  );

  const getTabData = () => {
    switch (activeTab) {
      case 'Participating': return participating;
      case 'Available': return available;
      case 'Completed': return completed;
      default: return [];
    }
  };

  const currentData = getTabData();

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Challenge</Text>
        <Text style={styles.headerSub}>
          Complete challenges
        </Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {TABS.map((tab) => {
          const count = tab === 'Participating'
            ? participating.length
            : tab === 'Available'
            ? available.length
            : completed.length;

          return (
            <TouchableOpacity
              key={tab}
              style={[
                styles.tab,
                activeTab === tab && styles.tabActive
              ]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[
                styles.tabText,
                activeTab === tab && styles.tabTextActive
              ]}>
                {tab} ({count})
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {currentData.length === 0 ? (
          <EmptyState
            title={getEmptyTitle(activeTab)}
            subtitle={getEmptySubtitle(activeTab)}
            buttonText={activeTab === 'Participating'
              ? 'Browse Challenges'
              : null
            }
            onButtonPress={activeTab === 'Participating'
              ? () => setActiveTab('Available')
              : null
            }
          />
        ) : (
          currentData.map((challenge) => (
            <ChallengeCard
              key={challenge.id || challenge.challenge_id}
              challenge={{
                ...challenge,
                id: challenge.id || challenge.challenge_id,
                name: challenge.name || challenge.challenge_name,
                status: challenge.status || challenge.challenge_status,
              }}
              onPress={() => router.push({
                pathname: '/screens/challenge-detail',
                params: {
                  id: challenge.id || challenge.challenge_id
                }
              })}
            />
          ))
        )}
        <View style={{ height: 20 }} />
      </ScrollView>

    </View>
  );
}

function getEmptyTitle(tab) {
  switch (tab) {
    case 'Participating': return 'No challenges yet';
    case 'Available': return 'No available challenges';
    case 'Completed': return 'No completed challenges';
    default: return 'No challenges';
  }
}

function getEmptySubtitle(tab) {
  switch (tab) {
    case 'Participating':
      return 'Join a challenge to start tracking your progress!';
    case 'Available':
      return 'Check back later for new challenges!';
    case 'Completed':
      return 'Complete a challenge to see it here!';
    default: return '';
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgLight,
  },
  header: {
    paddingTop: 56,
    paddingBottom: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.bgWhite,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  headerSub: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: colors.bgWhite,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.textSecondary,
    textAlign: 'center',
  },
  tabTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  content: {
    padding: 16,
  },
});