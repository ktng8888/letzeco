import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, RefreshControl,
} from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import challengeService   from '../../services/challengeService';
import LoadingScreen      from '../../components/common/LoadingScreen';
import ChallengeProgress  from '../../components/challenges/ChallengeProgress';

// Tabs
import OverviewTab  from '../../components/challenges/tabs/OverviewTab';
import TeamTab      from '../../components/challenges/tabs/TeamTab';
import RankingTab   from '../../components/challenges/tabs/RankingTab';
import ActivityTab  from '../../components/challenges/tabs/ActivityTab';

// Modals
import JoinTeamModal    from '../../components/challenges/modals/JoinTeamModal';
import CreateTeamModal  from '../../components/challenges/modals/CreateTeamModal';

// Helpers
import { getDaysLeft, formatDate, getTargetLabel } from '../../utils/challengeHelpers';

import colors from '../../constants/colors';

const OVERVIEW_TABS = ['Overview', 'Ranking', 'Activity'];
const TEAM_TABS     = ['Overview', 'Team', 'Ranking', 'Activity'];

export default function ChallengeDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  // ── Core state
  const [isLoading, setIsLoading]   = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [challenge, setChallenge]   = useState(null);
  const [activeTab, setActiveTab]   = useState('Overview');
  const [isJoining, setIsJoining]   = useState(false);
  const [isLeaving, setIsLeaving]   = useState(false);

  // ── Tab data state
  const [ranking, setRanking]       = useState(null);
  const [activity, setActivity]     = useState(null);
  const [tabLoading, setTabLoading] = useState(false);

  // ── Modal state
  const [showJoinTeam, setShowJoinTeam]     = useState(false);
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [publicTeams, setPublicTeams]       = useState([]);
  const [isTeamLoading, setIsTeamLoading]   = useState(false);

  // ── Load challenge
  const loadData = async () => {
    try {
      const data = await challengeService.getById(id);
      setChallenge(data.data);
    } catch (err) {
      console.error('Load challenge error:', err);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { loadData(); }, [id]);

  // ── Load tab data lazily
  useEffect(() => {
    if (activeTab === 'Ranking' && !ranking)  loadRanking();
    if (activeTab === 'Activity' && !activity) loadActivity();
  }, [activeTab]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, []);

  const loadPublicTeams = async () => {
    setIsTeamLoading(true);
    try {
      const data = await challengeService.getPublicTeams(id);
      setPublicTeams(data.data || []);
    } catch (err) {
      console.error('Load public teams error:', err);
    } finally {
      setIsTeamLoading(false);
    }
  };

  const loadRanking = async () => {
    setTabLoading(true);
    try {
      const data = await challengeService.getRanking(id);
      setRanking(data.data);
    } catch (err) {
      console.error('Load ranking error:', err);
    } finally {
      setTabLoading(false);
    }
  };

  const loadActivity = async () => {
    setTabLoading(true);
    try {
      const data = await challengeService.getActivity(id);
      setActivity(data.data);
    } catch (err) {
      console.error('Load activity error:', err);
    } finally {
      setTabLoading(false);
    }
  };

  // ── Event handlers
  const handleJoinSolo = async () => {
    setIsJoining(true);
    try {
      await challengeService.joinSolo(id);
      await loadData();
      Alert.alert('Success!', 'You joined the challenge!');
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to join.');
    } finally {
      setIsJoining(false);
    }
  };

  const handleLeave = () => {
    Alert.alert(
      'Leave Challenge',
      'Are you sure you want to leave this challenge?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: async () => {
            setIsLeaving(true);
            try {
              await challengeService.leave(id);
              await loadData();
            } catch (err) {
              Alert.alert('Error', err.response?.data?.message || 'Failed to leave.');
            } finally {
              setIsLeaving(false);
            }
          },
        },
      ]
    );
  };

  const handleJoinPublicTeam = async (teamId) => {
    try {
      await challengeService.joinPublicTeam(teamId);
      setShowJoinTeam(false);
      await loadData();
      Alert.alert('Success!', 'You joined the team!');
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to join.');
    }
  };

  const handleJoinByCode = async (code) => {
    try {
      await challengeService.joinByCode(code);
      setShowJoinTeam(false);
      await loadData();
      Alert.alert('Success!', 'You joined the team!');
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Invalid code.');
    }
  };

  const handleCreateTeam = async (teamName, isPrivate) => {
    try {
      await challengeService.createTeam(teamName, isPrivate, id);
      setShowCreateTeam(false);
      await loadData();
      Alert.alert('Success!', 'Team created! Share the code with friends.');
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to create team.');
    }
  };

  // ── Guards
  if (isLoading) return <LoadingScreen />;
  if (!challenge) return null;

  const isTeamChallenge = challenge.type === 'team';
  const isParticipating = challenge.is_participating;
  const daysLeft        = getDaysLeft(challenge.end_date);
  const tabs            = isTeamChallenge && isParticipating ? TEAM_TABS : OVERVIEW_TABS;

  return (
    <View style={styles.container}>

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerBadges}>
          <View style={[
            styles.typeBadge,
            { backgroundColor: isTeamChallenge ? '#eff6ff' : colors.primaryBg },
          ]}>
            <Text style={[
              styles.typeText,
              { color: isTeamChallenge ? '#3b82f6' : colors.primary },
            ]}>
              {isTeamChallenge ? 'Team' : 'Solo'}
            </Text>
          </View>
        </View>
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
        {/* ── Challenge Info ── */}
        <View style={styles.infoSection}>
          <Text style={styles.challengeName}>{challenge.name}</Text>

          <View style={styles.dateRow}>
            <Text style={styles.dateText}>
              {formatDate(challenge.start_date)} – {formatDate(challenge.end_date)}
            </Text>
            {daysLeft > 0 && (
              <Text style={styles.daysLeft}>{daysLeft} days left</Text>
            )}
          </View>

          {/* Solo progress */}
          {isParticipating && (
            <View style={styles.progressSection}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressTitle}>Your Progress</Text>
                <Text style={styles.rankText}>
                  Rank #{challenge.your_rank || '-'}
                </Text>
              </View>
              <ChallengeProgress
                current={challenge.progress_value || 0}
                target={parseFloat(challenge.target_value) || 0}
                targetType={challenge.target_type}
                unit={challenge.unit}
                label={`Min: ${challenge.target_value} ${
                  challenge.unit || getTargetLabel(challenge.target_type)
                }`}
              />
            </View>
          )}

          {/* Team progress */}
          {isTeamChallenge && isParticipating && challenge.team && (
            <View style={styles.teamSection}>
              <View style={styles.teamHeader}>
                <View>
                  <Text style={styles.teamName}>{challenge.team.name}</Text>
                  <Text style={styles.teamCode}>Code: {challenge.team.code}</Text>
                </View>
                <Text style={styles.teamRank}>
                  Rank #{challenge.team_rank || '-'}
                </Text>
              </View>
              <ChallengeProgress
                current={challenge.team.team_progress || 0}
                target={parseFloat(challenge.target_value) || 0}
                targetType={challenge.target_type}
                unit={challenge.unit}
                label="Team Progress"
              />
            </View>
          )}
        </View>

        {/* ── Action buttons ── */}
        {isParticipating ? (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.leaveBtn}
              onPress={handleLeave}
              disabled={isLeaving}
            >
              {isLeaving
                ? <ActivityIndicator size="small" color={colors.error} />
                : <Text style={styles.leaveBtnText}>Leave Challenge</Text>
              }
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.logBtn}
              onPress={() => router.push({
                pathname: '/screens/challenge-actions',
                params: {
                  challengeId: challenge.id,
                  challengeName: challenge.name,
                },
              })}
            >
              <Text style={styles.logBtnText}>Log Eligible Action</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.actionButtons}>
            {isTeamChallenge ? (
              <>
                <TouchableOpacity
                  style={styles.joinTeamBtn}
                  onPress={() => { setShowJoinTeam(true); loadPublicTeams(); }}
                >
                  <Text style={styles.joinTeamBtnText}>Join Team</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.createTeamBtn}
                  onPress={() => setShowCreateTeam(true)}
                >
                  <Text style={styles.createTeamBtnText}>Create Team</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity
                style={[styles.joinBtn, isJoining && styles.btnDisabled]}
                onPress={handleJoinSolo}
                disabled={isJoining}
              >
                {isJoining
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={styles.joinBtnText}>Join Challenge</Text>
                }
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* ── Tab bar ── */}
        <View style={styles.tabs}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[
                styles.tabText,
                activeTab === tab && styles.tabTextActive,
              ]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Tab content ── */}
        <View style={styles.tabContent}>
          {activeTab === 'Overview' && (
            <OverviewTab challenge={challenge} />
          )}
          {activeTab === 'Team' && (
            <TeamTab
              team={challenge.team}
            />
          )}
          {activeTab === 'Ranking' && (
            <RankingTab
              ranking={ranking}
              isLoading={tabLoading}
              challenge={challenge}
            />
          )}
          {activeTab === 'Activity' && (
            <ActivityTab
              activity={activity}
              isLoading={tabLoading}
              challengeType={challenge.type}
              teamMembers={challenge.team?.members}
              targetType={challenge.target_type}
              unit={challenge.unit}
            />
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ── Modals ── */}
      <JoinTeamModal
        visible={showJoinTeam}
        onClose={() => setShowJoinTeam(false)}
        publicTeams={publicTeams}
        isLoading={isTeamLoading}
        onJoinPublic={handleJoinPublicTeam}
        onJoinByCode={handleJoinByCode}
      />
      <CreateTeamModal
        visible={showCreateTeam}
        onClose={() => setShowCreateTeam(false)}
        onSubmit={handleCreateTeam}
      />
    </View>
  );
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
  headerBadges: { flexDirection: 'row', gap: 8 },
  typeBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  typeText: { fontSize: 12, fontWeight: '700' },
  infoSection: {
    backgroundColor: colors.bgWhite,
    padding: 16,
    gap: 12,
  },
  challengeName: { fontSize: 20, fontWeight: '700', color: colors.textPrimary },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dateText: { fontSize: 13, color: colors.textSecondary },
  daysLeft: { fontSize: 13, color: colors.primary, fontWeight: '600' },

  progressSection: {
    backgroundColor: colors.bgGrey,
    borderRadius: 12,
    padding: 14,
    gap: 10,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressTitle: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  rankText: { fontSize: 13, fontWeight: '600', color: colors.primary },

  teamSection: {
    backgroundColor: colors.bgGrey,
    borderRadius: 12,
    padding: 14,
    gap: 12,
  },
  teamHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  teamName: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  teamCode: { fontSize: 12, color: colors.primary, fontWeight: '500' },
  teamRank: { fontSize: 14, fontWeight: '700', color: colors.primary },

  actionButtons: {
    padding: 16,
    gap: 8,
    backgroundColor: colors.bgWhite,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  joinBtn: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  joinBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  joinTeamBtn: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  joinTeamBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  createTeamBtn: {
    backgroundColor: colors.bgWhite,
    borderRadius: 12,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  createTeamBtnText: { color: colors.primary, fontSize: 15, fontWeight: '600' },
  leaveBtn: {
    borderWidth: 1,
    borderColor: colors.error,
    borderRadius: 12,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  leaveBtnText: { color: colors.error, fontSize: 14, fontWeight: '600' },
  logBtn: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  btnDisabled: { backgroundColor: colors.primaryLight },

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
  tabActive: { borderBottomColor: colors.primary },
  tabText: { fontSize: 12, fontWeight: '500', color: colors.textSecondary },
  tabTextActive: { color: colors.primary, fontWeight: '700' },
  tabContent: { padding: 16 },
});
