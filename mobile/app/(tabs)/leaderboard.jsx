import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Modal
} from 'react-native';
import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import leaderboardService from '../../services/leaderboardService';
import useAuthStore from '../../store/authStore';

import LoadingScreen from '../../components/common/LoadingScreen';
import ScreenHeader from '../../components/common/ScreenHeader';
import TopThreePodium from '../../components/leaderboard/TopThreePodium';
import LeaderboardCard from '../../components/leaderboard/LeaderboardCard';
import colors from '../../constants/colors';
import SoundTouchableOpacity from '../../components/common/SoundTouchableOpacity';

export default function LeaderboardScreen() {
  const { user } = useAuthStore();

  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('global');
  const [globalData, setGlobalData] = useState(null);
  const [friendsData, setFriendsData] = useState(null);
  const [showInfo, setShowInfo] = useState(false);

  const loadData = async () => {
    try {
      const [globalResult, friendsResult] = await Promise.all([
        leaderboardService.getGlobal(),
        leaderboardService.getFriends(),
      ]);
      setGlobalData(globalResult.data);
      setFriendsData(friendsResult.data);
    } catch (err) {
      console.error('Load leaderboard error:', err);
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

  const currentData = activeTab === 'global' ? globalData : friendsData;
  const leaderboard = currentData?.leaderboard || [];
  const yourRank = currentData?.your_rank || '-';
  const top3 = leaderboard.slice(0, 3);
  const rest = leaderboard;

  const weekRange = getWeekRange();

  return (
    <View style={styles.container}>

      <ScreenHeader title="Leaderboard" />

      {/* Period Info */}
      <View style={styles.periodRow}>
        <Text style={styles.periodText}>Period: {weekRange}</Text>
        <SoundTouchableOpacity onPress={() => setShowInfo(true)}>
          <View style={styles.rankingInfoBtn}>
            <Text style={styles.rankingInfoText}>About Ranking</Text>
            <Ionicons name="information-circle-outline" size={13} color={colors.primary} />
          </View>
        </SoundTouchableOpacity>
      </View>

      {/* Your Rank Banner */}
      <View style={styles.yourRankBanner}>
        <View style={styles.yourRankLeft}>
          <RankIcon rank={yourRank} size={30} color={colors.textWhite} />
          <View>
            <Text style={styles.yourRankLabel}>Your Rank</Text>
            <Text style={styles.yourRankValue}>Rank {yourRank}</Text>
          </View>
        </View>
        <View style={styles.yourRankRight}>
          <Text style={styles.yourXpLabel}>Weekly XP</Text>
          <Text style={styles.yourXpValue}>{user?.weekly_xp || 0}</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <SoundTouchableOpacity
          style={[styles.tab, activeTab === 'global' && styles.tabActive]}
          onPress={() => setActiveTab('global')}
        soundType="tab"
        >
          <View style={styles.tabContent}>
            <Ionicons
              name="earth-outline"
              size={16}
              color={activeTab === 'global' ? colors.primary : colors.textSecondary}
            />
            <Text style={[styles.tabText, activeTab === 'global' && styles.tabTextActive]}>
              Global
            </Text>
          </View>
        </SoundTouchableOpacity>
        <SoundTouchableOpacity
          style={[styles.tab, activeTab === 'friends' && styles.tabActive]}
          onPress={() => setActiveTab('friends')}
        soundType="tab"
        >
          <View style={styles.tabContent}>
            <Ionicons
              name="people-outline"
              size={16}
              color={activeTab === 'friends' ? colors.primary : colors.textSecondary}
            />
            <Text style={[styles.tabText, activeTab === 'friends' && styles.tabTextActive]}>
              Friends
            </Text>
          </View>
        </SoundTouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {leaderboard.length === 0 && activeTab === 'global' ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="trophy-outline" size={54} color={colors.borderDark} />
            <Text style={styles.emptyText}>No data yet. Start logging actions!</Text>
          </View>
        ) : (
          <>
            {/* Top 3 Podium — always shown for friends tab even if empty */}
            <View style={styles.podiumSection}>
              <TopThreePodium
                top3={top3}
                myId={user?.id}
                isFriends={activeTab === 'friends'}
              />
            </View>

            {/* Rest of leaderboard */}
            {leaderboard.length > 0 && (
              <View style={styles.listSection}>
                {rest.map((item) => (
                  <LeaderboardCard key={item.id} item={item} myId={user?.id} />
                ))}
              </View>
            )}
          </>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Ranking Info Modal */}
      <Modal
        visible={showInfo}
        transparent
        animationType="fade"
        onRequestClose={() => setShowInfo(false)}
      >
        <SoundTouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setShowInfo(false)}
        >
          <View style={styles.infoModal}>
            <View style={styles.infoTitleRow}>
              <Ionicons name="trophy-outline" size={22} color={colors.xpColor} />
              <Text style={styles.infoTitle}>Ranking Formula</Text>
            </View>
            <Text style={styles.infoText}>
              Weekly XP {'>'} Level {'>'} Total XP {'>'} Streak
            </Text>
            <View style={styles.infoDivider} />
            <Text style={styles.infoDescription}>
              Rankings reset every Monday.{'\n\n'}
              Focus on earning XP this week by logging as many eco-actions as possible!{'\n\n'}
              The more you log, the higher you rank.
            </Text>
            <SoundTouchableOpacity
              style={styles.infoBtn}
              onPress={() => setShowInfo(false)}
            >
              <Text style={styles.infoBtnText}>Got it!</Text>
            </SoundTouchableOpacity>
          </View>
        </SoundTouchableOpacity>
      </Modal>

    </View>
  );
}

// ─────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────
function getWeekRange() {
  const now = new Date();
  const day = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return `${monday.getDate()} ${months[monday.getMonth()]} - ` +
    `${sunday.getDate()} ${months[sunday.getMonth()]} ${sunday.getFullYear()}`;
}

function RankIcon({ rank, size = 24, color }) {
  const meta = getRankIconMeta(rank);
  return (
    <Ionicons
      name={meta.name}
      size={size}
      color={color || meta.color}
    />
  );
}

function getRankIconMeta(rank) {
  if (rank === 1) return { name: 'trophy', color: colors.xpColor };
  if (rank === 2) return { name: 'medal-outline', color: colors.textLight };
  if (rank === 3) return { name: 'ribbon-outline', color: '#c2763b' };
  if (rank <= 10) return { name: 'medal-outline', color: colors.xpColor };
  if (rank <= 50) return { name: 'star-outline', color: colors.xpColor };
  return { name: 'leaf-outline', color: colors.primary };
}

// ─────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgLight,
  },
  periodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.bgWhite,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  periodText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  rankingInfoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rankingInfoText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '500',
  },
  yourRankBanner: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  yourRankLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  yourRankLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  yourRankValue: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textWhite,
  },
  yourRankRight: { alignItems: 'flex-end' },
  yourXpLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  yourXpValue: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textWhite,
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
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  podiumSection: {
    backgroundColor: colors.bgWhite,
    marginBottom: 8,
  },
  listSection: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 40,
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  infoModal: {
    backgroundColor: colors.bgWhite,
    borderRadius: 20,
    padding: 24,
    width: '100%',
    alignItems: 'center',
  },
  infoTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  infoText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.primary,
    textAlign: 'center',
  },
  infoDivider: {
    height: 1,
    backgroundColor: colors.border,
    width: '100%',
    marginVertical: 16,
  },
  infoDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  infoBtn: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 40,
    width: '100%',
    alignItems: 'center',
  },
  infoBtnText: {
    color: colors.textWhite,
    fontSize: 15,
    fontWeight: '700',
  },
});
