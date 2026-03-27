import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator,
  Modal, TextInput, RefreshControl
} from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import challengeService from '../../services/challengeService';
import actionService from '../../services/actionService';
import LoadingScreen from '../../components/common/LoadingScreen';
import ChallengeProgress from '../../components/challenges/ChallengeProgress';
import TeamCard from '../../components/challenges/TeamCard';
import EligibleActionsList from '../../components/challenges/EligibleActionsList';
import colors from '../../constants/colors';

const OVERVIEW_TABS = ['Overview', 'Ranking', 'Activity'];
const TEAM_TABS = ['Overview', 'Team', 'Ranking', 'Activity'];

export default function ChallengeDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [challenge, setChallenge] = useState(null);
  const [activeTab, setActiveTab] = useState('Overview');
  const [isJoining, setIsJoining] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  // Team modals
  const [showJoinTeam, setShowJoinTeam] = useState(false);
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [publicTeams, setPublicTeams] = useState([]);
  const [teamCode, setTeamCode] = useState('');
  const [newTeamName, setNewTeamName] = useState('');
  const [isPrivateTeam, setIsPrivateTeam] = useState(false);
  const [isTeamLoading, setIsTeamLoading] = useState(false);
  const [joinTab, setJoinTab] = useState('public'); // 'public' | 'code'

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
              Alert.alert(
                'Error',
                err.response?.data?.message || 'Failed to leave.'
              );
            } finally {
              setIsLeaving(false);
            }
          }
        }
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

  const handleJoinByCode = async () => {
    if (!teamCode.trim()) {
      Alert.alert('Error', 'Please enter a team code.');
      return;
    }
    try {
      await challengeService.joinByCode(teamCode.trim().toUpperCase());
      setShowJoinTeam(false);
      setTeamCode('');
      await loadData();
      Alert.alert('Success!', 'You joined the team!');
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Invalid code.');
    }
  };

  const handleCreateTeam = async () => {
    if (!newTeamName.trim()) {
      Alert.alert('Error', 'Please enter a team name.');
      return;
    }
    try {
      await challengeService.createTeam(
        newTeamName.trim(),
        isPrivateTeam,
        id
      );
      setShowCreateTeam(false);
      setNewTeamName('');
      await loadData();
      Alert.alert('Success!', 'Team created! Share the code with friends.');
    } catch (err) {
      Alert.alert(
        'Error',
        err.response?.data?.message || 'Failed to create team.'
      );
    }
  };

  const handleLogEligibleAction = () => {
    router.push('/(tabs)/log-action');
  };

  if (isLoading) return <LoadingScreen />;
  if (!challenge) return null;

  const isTeamChallenge = challenge.type === 'team';
  const isParticipating = challenge.is_participating;
  const daysLeft = getDaysLeft(challenge.end_date);
  const tabs = isTeamChallenge && isParticipating
    ? TEAM_TABS
    : OVERVIEW_TABS;

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerBadges}>
          <View style={[
            styles.typeBadge,
            {
              backgroundColor: isTeamChallenge
                ? '#eff6ff'
                : colors.primaryBg
            }
          ]}>
            <Text style={[
              styles.typeText,
              { color: isTeamChallenge ? '#3b82f6' : colors.primary }
            ]}>
              {isTeamChallenge ? 'Tea' : 'Sol'}
            </Text>
          </View>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>
              Active
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
        {/* Challenge Info */}
        <View style={styles.infoSection}>
          <Text style={styles.challengeName}>{challenge.name}</Text>

          {/* Date + Days left */}
          <View style={styles.dateRow}>
            <Text style={styles.dateText}>
              {formatDate(challenge.start_date)} -{' '}
              {formatDate(challenge.end_date)}
            </Text>
            {daysLeft > 0 && (
              <Text style={styles.daysLeft}>
                {daysLeft} days left
              </Text>
            )}
          </View>

          {/* If participating — show progress */}
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
                label={`Min: ${challenge.target_value} ${getTargetLabel(challenge.target_type)}`}
              />
            </View>
          )}

          {/* Team Info (if team challenge and participating) */}
          {isTeamChallenge && isParticipating && challenge.team && (
            <View style={styles.teamSection}>
              <View style={styles.teamHeader}>
                <View>
                  <Text style={styles.teamName}>
                    {challenge.team.name}
                  </Text>
                  <Text style={styles.teamCode}>
                    Code: {challenge.team.code}
                  </Text>
                </View>
                <Text style={styles.teamRank}>
                  Rank #{challenge.team_rank || '-'}
                </Text>
              </View>

              {/* Team Progress */}
              <ChallengeProgress
                current={challenge.team.team_progress || 0}
                target={parseFloat(challenge.target_value) || 0}
                targetType={challenge.target_type}
                label="Team Progress"
              />
            </View>
          )}
        </View>

        {/* Action Buttons */}
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
              onPress={handleLogEligibleAction}
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
                  onPress={() => {
                    setShowJoinTeam(true);
                    loadPublicTeams();
                  }}
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
                  ? <ActivityIndicator color={colors.textWhite} />
                  : <Text style={styles.joinBtnText}>Join Challenge</Text>
                }
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Tabs */}
        <View style={styles.tabs}>
          {tabs.map((tab) => (
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
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab Content */}
        <View style={styles.tabContent}>

          {/* Overview Tab */}
          {activeTab === 'Overview' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>About this Challenge</Text>
              <Text style={styles.about}>{challenge.about}</Text>

              <Text style={styles.sectionTitle}>Eligible Actions</Text>
              <Text style={styles.viewAll}>View All</Text>
              <EligibleActionsList
                actions={challenge.eligible_actions}
              />

              <Text style={styles.sectionTitle}>Reward</Text>
              {challenge.rewards?.map((reward, i) => (
                <RewardCard key={i} reward={reward} />
              ))}
            </View>
          )}

          {/* Team Tab (team challenges only) */}
          {activeTab === 'Team' && challenge.team && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Team Members ({challenge.team.member_count}/5)
              </Text>
              {challenge.team.members?.map((member) => (
                <MemberRow key={member.user_id} member={member} />
              ))}

              {/* Team code */}
              {challenge.team.code && (
                <View style={styles.codeCard}>
                  <Text style={styles.codeLabel}>
                    Share Code with Friends
                  </Text>
                  <Text style={styles.code}>
                    {challenge.team.code}
                  </Text>
                  <Text style={styles.codeHint}>
                    Members can use this code to join your team
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Ranking Tab */}
          {activeTab === 'Ranking' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Top 5 Participants</Text>
              <Text style={styles.viewAll}>View Full Leaderboard</Text>
              <PlaceholderList message="Ranking data coming soon" />
            </View>
          )}

          {/* Activity Tab */}
          {activeTab === 'Activity' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Weekly Activity</Text>
              <PlaceholderList message="Activity data coming soon" />
            </View>
          )}

        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Join Team Modal */}
      <Modal
        visible={showJoinTeam}
        animationType="slide"
        transparent
        onRequestClose={() => setShowJoinTeam(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Join Team</Text>
              <TouchableOpacity onPress={() => setShowJoinTeam(false)}>
                <Ionicons name="close" size={22} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            {/* Public / Code tabs */}
            <View style={styles.joinTabs}>
              <TouchableOpacity
                style={[
                  styles.joinTab,
                  joinTab === 'public' && styles.joinTabActive
                ]}
                onPress={() => setJoinTab('public')}
              >
                <Text style={[
                  styles.joinTabText,
                  joinTab === 'public' && styles.joinTabTextActive
                ]}>
                  Public Team
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.joinTab,
                  joinTab === 'code' && styles.joinTabActive
                ]}
                onPress={() => setJoinTab('code')}
              >
                <Text style={[
                  styles.joinTabText,
                  joinTab === 'code' && styles.joinTabTextActive
                ]}>
                  Enter Code
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll}>
              {joinTab === 'public' && (
                <View style={styles.publicTeamsSection}>
                  {isTeamLoading ? (
                    <ActivityIndicator color={colors.primary} />
                  ) : publicTeams.length === 0 ? (
                    <Text style={styles.noTeams}>
                      No public teams yet. Create one!
                    </Text>
                  ) : (
                    publicTeams.map((team) => (
                      <TeamCard
                        key={team.id}
                        team={team}
                        showJoinBtn
                        onJoin={() => handleJoinPublicTeam(team.id)}
                      />
                    ))
                  )}
                </View>
              )}

              {joinTab === 'code' && (
                <View style={styles.codeSection}>
                  <Text style={styles.codeInputLabel}>
                    Enter 6-character code
                  </Text>
                  <TextInput
                    style={styles.codeInput}
                    value={teamCode}
                    onChangeText={setTeamCode}
                    placeholder="ABC123"
                    placeholderTextColor={colors.textLight}
                    autoCapitalize="characters"
                    maxLength={6}
                  />
                  <TouchableOpacity
                    style={styles.codeJoinBtn}
                    onPress={handleJoinByCode}
                  >
                    <Text style={styles.codeJoinBtnText}>Join Team</Text>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Create Team Modal */}
      <Modal
        visible={showCreateTeam}
        animationType="slide"
        transparent
        onRequestClose={() => setShowCreateTeam(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Team</Text>
              <TouchableOpacity onPress={() => setShowCreateTeam(false)}>
                <Ionicons name="close" size={22} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <View style={styles.createTeamForm}>
              <Text style={styles.createLabel}>Team Name</Text>
              <TextInput
                style={styles.createInput}
                value={newTeamName}
                onChangeText={setNewTeamName}
                placeholder="The Green Squad"
                placeholderTextColor={colors.textLight}
              />

              {/* Private Toggle */}
              <TouchableOpacity
                style={styles.privateToggle}
                onPress={() => setIsPrivateTeam(!isPrivateTeam)}
              >
                <View style={[
                  styles.checkbox,
                  isPrivateTeam && styles.checkboxChecked
                ]}>
                  {isPrivateTeam && (
                    <Ionicons name="checkmark" size={14} color="#fff" />
                  )}
                </View>
                <View>
                  <Text style={styles.privateLabel}>Private Team</Text>
                  <Text style={styles.privateHint}>
                    Only people with code can join
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.createTeamSubmitBtn}
                onPress={handleCreateTeam}
              >
                <Text style={styles.createTeamSubmitText}>
                  Create Team & Participate
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </View>
  );
}

// ─────────────────────────────────────────
// SUBCOMPONENTS
// ─────────────────────────────────────────

function RewardCard({ reward }) {
  const isCompletion = reward.type === 'completion';
  return (
    <View style={styles.rewardCard}>
      <Text style={styles.rewardType}>
        {isCompletion ? '🏆 Completion Reward' : '🥇 Ranking Reward'}
      </Text>
      <Text style={styles.rewardValue}>
        {reward.xp_reward} XP per member
      </Text>
      {reward.badge_name && (
        <Text style={styles.rewardBadge}>
          🏅 "{reward.badge_name}" Badge
        </Text>
      )}
    </View>
  );
}

function MemberRow({ member }) {
  return (
    <View style={styles.memberRow}>
      <View style={styles.memberAvatar}>
        <Text style={styles.memberAvatarText}>
          {member.username?.charAt(0).toUpperCase()}
        </Text>
      </View>
      <View style={styles.memberInfo}>
        <Text style={styles.memberName}>{member.username}</Text>
        <Text style={styles.memberMeta}>Lv. {member.level}</Text>
      </View>
      {member.contribution && (
        <Text style={styles.memberContrib}>
          {parseFloat(member.contribution).toFixed(1)}
        </Text>
      )}
    </View>
  );
}

function PlaceholderList({ message }) {
  return (
    <View style={styles.placeholder}>
      <Text style={styles.placeholderText}>{message}</Text>
    </View>
  );
}

// ─────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────
function getDaysLeft(endDate) {
  if (!endDate) return 0;
  const diff = Math.ceil(
    (new Date(endDate) - new Date()) / (1000 * 60 * 60 * 24)
  );
  return Math.max(0, diff);
}

function formatDate(dateString) {
  if (!dateString) return '';
  const d = new Date(dateString);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

function getTargetLabel(type) {
  switch (type) {
    case 'co2_kg': return 'kg CO₂';
    case 'count': return 'items';
    case 'litre': return 'L';
    case 'kwh': return 'kWh';
    default: return '';
  }
}

// ─────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────
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
  headerBadges: {
    flexDirection: 'row',
    gap: 8,
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  typeText: { fontSize: 12, fontWeight: '700' },
  statusBadge: {
    backgroundColor: colors.primaryBg,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  infoSection: {
    backgroundColor: colors.bgWhite,
    padding: 16,
    gap: 12,
  },
  challengeName: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateText: { fontSize: 13, color: colors.textSecondary },
  daysLeft: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '600',
  },
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
  progressTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  rankText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
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
  teamName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  teamCode: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '500',
  },
  teamRank: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
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
  joinBtnText: {
    color: colors.textWhite,
    fontSize: 15,
    fontWeight: '700',
  },
  joinTeamBtn: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  joinTeamBtnText: {
    color: colors.textWhite,
    fontSize: 15,
    fontWeight: '700',
  },
  createTeamBtn: {
    backgroundColor: colors.bgWhite,
    borderRadius: 12,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  createTeamBtnText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '600',
  },
  leaveBtn: {
    borderWidth: 1,
    borderColor: colors.error,
    borderRadius: 12,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  leaveBtnText: {
    color: colors.error,
    fontSize: 14,
    fontWeight: '600',
  },
  logBtn: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logBtnText: {
    color: colors.textWhite,
    fontSize: 15,
    fontWeight: '700',
  },
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
  tabText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  tabContent: { padding: 16 },
  section: { gap: 12 },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 8,
  },
  viewAll: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '500',
    marginTop: -8,
    marginBottom: 4,
    textAlign: 'right',
  },
  about: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  rewardCard: {
    backgroundColor: colors.xpBg,
    borderRadius: 12,
    padding: 14,
    gap: 4,
  },
  rewardType: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  rewardValue: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.xpColor,
  },
  rewardBadge: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgWhite,
    borderRadius: 12,
    padding: 12,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberAvatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  memberInfo: { flex: 1 },
  memberName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  memberMeta: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  memberContrib: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  codeCard: {
    backgroundColor: colors.primaryBg,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  codeLabel: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  code: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 4,
  },
  codeHint: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  placeholder: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: colors.bgGrey,
    borderRadius: 12,
  },
  placeholderText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: colors.bgWhite,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  modalScroll: {
    maxHeight: 400,
  },
  joinTabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  joinTab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  joinTabActive: { borderBottomColor: colors.primary },
  joinTabText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  joinTabTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  publicTeamsSection: { padding: 16 },
  noTeams: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingVertical: 20,
  },
  codeSection: {
    padding: 16,
    gap: 12,
  },
  codeInputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  codeInput: {
    height: 52,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 22,
    letterSpacing: 6,
    textAlign: 'center',
    color: colors.textPrimary,
    backgroundColor: colors.bgLight,
    fontWeight: '700',
  },
  codeJoinBtn: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  codeJoinBtnText: {
    color: colors.textWhite,
    fontSize: 15,
    fontWeight: '700',
  },
  createTeamForm: { padding: 16, gap: 12 },
  createLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  createInput: {
    height: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 15,
    color: colors.textPrimary,
    backgroundColor: colors.bgLight,
  },
  privateToggle: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 4,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  privateLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  privateHint: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  createTeamSubmitBtn: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  createTeamSubmitText: {
    color: colors.textWhite,
    fontSize: 15,
    fontWeight: '700',
  },
});