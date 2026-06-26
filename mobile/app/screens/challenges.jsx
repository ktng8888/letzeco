import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl
} from 'react-native';
import { useRef, useState, useCallback } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import challengeService from '../../services/challengeService';
import LoadingScreen from '../../components/common/LoadingScreen';
import EmptyState from '../../components/common/EmptyState';
import ChallengeCard from '../../components/challenges/ChallengeCard';
import colors from '../../constants/colors';
import SoundTouchableOpacity from '../../components/common/SoundTouchableOpacity';

const TABS = ['Participating', 'Available', 'Completed'];
const TYPE_FILTERS = [
  { key: 'all', label: 'All', icon: 'apps-outline' },
  { key: 'solo', label: 'Solo', icon: 'person-outline' },
  { key: 'team', label: 'Team', icon: 'people-outline' },
];

export default function ChallengesScreen() {
  const router = useRouter();
  const { tab } = useLocalSearchParams();
  const consumedTabParamRef = useRef(null);

  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('Participating');
  const [activeType, setActiveType] = useState('all');
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
    useCallback(() => {
      if (TABS.includes(tab) && consumedTabParamRef.current !== tab) {
        consumedTabParamRef.current = tab;
        setActiveTab(tab);
        setActiveType('all');
      }
      loadData();
    }, [tab])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, []);

  if (isLoading) return <LoadingScreen />;

  // Split challenges into tabs
  const isCompletedForUser = c =>
    (c.user_challenge_status || c.status) === 'completed' ||
    (
      c.is_participating &&
      (c.challenge_status || c.status) === 'inactive' &&
      Number(c.progress_value || 0) >= Number(c.target_value || 0)
    );

  const participating = allChallenges.filter(
    c =>
      c.is_participating &&
      (c.challenge_status || c.status) === 'active' &&
      !isCompletedForUser(c)
  );
  const available = allChallenges.filter(
    c => !c.is_participating && c.status === 'active'
  );
  const completed = myChallenges.filter(isCompletedForUser);

  const getTabData = () => {
    switch (activeTab) {
      case 'Participating': return participating;
      case 'Available': return available;
      case 'Completed': return completed;
      default: return [];
    }
  };

  const tabData = getTabData();
  const typeCounts = TYPE_FILTERS.reduce((acc, filter) => {
    acc[filter.key] = filter.key === 'all'
      ? tabData.length
      : tabData.filter(c => c.type === filter.key).length;
    return acc;
  }, {});
  const currentData = activeType === 'all'
    ? tabData
    : tabData.filter(c => c.type === activeType);

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <SoundTouchableOpacity onPress={() => router.back()} soundType="back">
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </SoundTouchableOpacity>
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
            <SoundTouchableOpacity
              key={tab}
              style={[
                styles.tab,
                activeTab === tab && styles.tabActive
              ]}
              onPress={() => setActiveTab(tab)}
            soundType="tab"
            >
              <Text style={[
                styles.tabText,
                activeTab === tab && styles.tabTextActive
              ]}>
                {tab} ({count})
              </Text>
            </SoundTouchableOpacity>
          );
        })}
      </View>

      <View style={styles.typeFilters}>
        {TYPE_FILTERS.map((filter) => {
          const active = activeType === filter.key;
          return (
            <SoundTouchableOpacity
              key={filter.key}
              style={[
                styles.typeFilter,
                active && styles.typeFilterActive,
              ]}
              onPress={() => setActiveType(filter.key)}
              activeOpacity={0.75}
            soundType="tab"
            >
              <Ionicons
                name={filter.icon}
                size={15}
                color={active ? colors.primary : colors.textSecondary}
              />
              <Text style={[
                styles.typeFilterText,
                active && styles.typeFilterTextActive,
              ]}>
                {filter.label}
              </Text>
              <Text style={[
                styles.typeFilterCount,
                active && styles.typeFilterCountActive,
              ]}>
                {typeCounts[filter.key]}
              </Text>
            </SoundTouchableOpacity>
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
            title={getEmptyTitle(activeTab, activeType)}
            subtitle={getEmptySubtitle(activeTab, activeType)}
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
          currentData.map((challenge) => {
            const challengeId = challenge.challenge_id || challenge.id;
            const userChallengeStatus =
              challenge.user_challenge_status || challenge.status;

            return (
              <ChallengeCard
                key={`${activeTab}-${challengeId}`}
                challenge={{
                  ...challenge,
                  id: challengeId,
                  name: challenge.name || challenge.challenge_name,
                  status: challenge.challenge_status || challenge.status,
                  user_challenge_status: userChallengeStatus,
                }}
                onPress={() => router.push({
                  pathname: '/screens/challenge-detail',
                  params: { id: challengeId }
                })}
              />
            );
          })
        )}
        <View style={{ height: 20 }} />
      </ScrollView>

    </View>
  );
}

function getEmptyTitle(tab, type = 'all') {
  const typeLabel = type === 'all' ? '' : `${type} `;
  switch (tab) {
    case 'Participating': return `No ${typeLabel}challenges yet`;
    case 'Available': return `No available ${typeLabel}challenges`;
    case 'Completed': return `No completed ${typeLabel}challenges`;
    default: return 'No challenges';
  }
}

function getEmptySubtitle(tab, type = 'all') {
  const typeLabel = type === 'all' ? 'challenge' : `${type} challenge`;
  switch (tab) {
    case 'Participating':
      return `Join a ${typeLabel} to start tracking your progress!`;
    case 'Available':
      return `Check back later for new ${typeLabel}s!`;
    case 'Completed':
      return `Complete a ${typeLabel} to see it here!`;
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
  typeFilters: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
    backgroundColor: colors.bgLight,
  },
  typeFilter: {
    flex: 1,
    minHeight: 38,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: colors.bgWhite,
    borderWidth: 1,
    borderColor: colors.border,
  },
  typeFilterActive: {
    backgroundColor: colors.primaryBg,
    borderColor: colors.primaryLight,
  },
  typeFilterText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  typeFilterTextActive: {
    color: colors.primary,
  },
  typeFilterCount: {
    minWidth: 20,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: colors.bgGrey,
    color: colors.textSecondary,
    fontSize: 10,
    fontWeight: '800',
    textAlign: 'center',
    overflow: 'hidden',
  },
  typeFilterCountActive: {
    backgroundColor: colors.bgWhite,
    color: colors.primary,
  },
  content: {
    padding: 16,
  },
});
