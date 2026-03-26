import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, RefreshControl, Modal
} from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

import leaderboardService from '../../services/leaderboardService';
import useAuthStore from '../../store/authStore';

import LoadingScreen from '../../components/common/LoadingScreen';
import ScreenHeader from '../../components/common/ScreenHeader';
import TopThreePodium from '../../components/leaderboard/TopThreePodium';
import LeaderboardCard from '../../components/leaderboard/LeaderboardCard';
import colors from '../../constants/colors';

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
  //const rest = leaderboard.slice(3);
  const rest = leaderboard;

  // Get current week range
  const weekRange = getWeekRange();

  return (
    <View style={styles.container}>

      <ScreenHeader title="Leaderboard" />

      {/* Period Info */}
      <View style={styles.periodRow}>
        <Text style={styles.periodText}>
          Period: {weekRange}
        </Text>
        <TouchableOpacity onPress={() => setShowInfo(true)}>
          <Text style={styles.rankingInfoBtn}>
            About Ranking ⓘ
          </Text>
        </TouchableOpacity>
      </View>

      {/* Your Rank Banner */}
      <View style={styles.yourRankBanner}>
        <View style={styles.yourRankLeft}>
          <Text style={styles.yourRankEmoji}>
            {getRankEmoji(yourRank)}
          </Text>
          <View>
            <Text style={styles.yourRankLabel}>Your Rank</Text>
            <Text style={styles.yourRankValue}>#{yourRank}</Text>
          </View>
        </View>
        <View style={styles.yourRankRight}>
          <Text style={styles.yourXpLabel}>Weekly XP</Text>
          <Text style={styles.yourXpValue}>{user?.weekly_xp || 0}</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'global' && styles.tabActive]}
          onPress={() => setActiveTab('global')}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'global' && styles.tabTextActive
          ]}>
            🌍 Global
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'friends' && styles.tabActive]}
          onPress={() => setActiveTab('friends')}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'friends' && styles.tabTextActive
          ]}>
            👫 Friends
          </Text>
        </TouchableOpacity>
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
        {leaderboard.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🏆</Text>
            <Text style={styles.emptyText}>
              {activeTab === 'friends'
                ? 'Add friends to see the friends leaderboard!'
                : 'No data yet. Start logging actions!'
              }
            </Text>
          </View>
        ) : (
          <>
            {/* Top 3 Podium */}
            <View style={styles.podiumSection}>
              <TopThreePodium top3={top3} myId={user?.id} />
            </View>

            {/* Rest of leaderboard */}
            <View style={styles.listSection}>
              {rest.map((item) => (
                <LeaderboardCard
                  key={item.id}
                  item={item}
                  myId={user?.id}
                />
              ))}
            </View>
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
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setShowInfo(false)}
        >
          <View style={styles.infoModal}>
            <Text style={styles.infoTitle}>
              🏆 Ranking Formula
            </Text>
            <Text style={styles.infoText}>
              Weekly XP {'>'} Level {'>'} Total XP {'>'} Streak
            </Text>
            <View style={styles.infoDivider} />
            <Text style={styles.infoDescription}>
              Rankings reset every Monday.{'\n\n'}
              Focus on earning XP this week by logging as many eco-actions as possible!{'\n\n'}
              The more you log, the higher you rank. 🌿
            </Text>
            <TouchableOpacity
              style={styles.infoBtn}
              onPress={() => setShowInfo(false)}
            >
              <Text style={styles.infoBtnText}>Got it!</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
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

function getRankEmoji(rank) {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  if (rank <= 10) return '🏅';
  if (rank <= 50) return '⭐';
  return '🌱';
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
  yourRankEmoji: { fontSize: 28 },
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
  emptyIcon: { fontSize: 48 },
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
  infoTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 8,
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