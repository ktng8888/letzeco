import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Alert
} from 'react-native';
import { useState } from 'react';
import RankRow from '../cards/RankRow';
import ParticipantInfoModal from '../modals/ParticipantInfoModal';
import colors from '../../../constants/colors';
import friendService from '../../../services/friendService';

export default function RankingTab({ ranking, isLoading, challenge }) {
  const [selected, setSelected] = useState(null);
  const [sendingUserId, setSendingUserId] = useState(null);
  const [friendshipOverrides, setFriendshipOverrides] = useState({});

  if (isLoading) {
    return (
      <ActivityIndicator
        color={colors.primary}
        style={{ marginTop: 20 }}
      />
    );
  }

  if (!ranking) {
    return <Text style={styles.empty}>No ranking data yet.</Text>;
  }

  const { type, top = [], your_rank, your_team_rank, your_team_id,
    current_user_id, total_participants, total_teams } = ranking;

  const updateUserStatus = (userId, status, friendshipId = null) => {
    setFriendshipOverrides(current => ({
      ...current,
      [userId]: {
        friendship_status: status,
        friendship_id: friendshipId,
      },
    }));

    const patchMember = member =>
      Number(member.user_id || member.id) === Number(userId)
        ? {
            ...member,
            friendship_status: status,
            friendship_id: friendshipId ?? member.friendship_id,
          }
        : member;

    setSelected(current => {
      if (!current) return current;
      if (current.type === 'solo') {
        return { ...current, data: patchMember(current.data) };
      }
      return {
        ...current,
        data: {
          ...current.data,
          members: (current.data.members || []).map(patchMember),
        },
      };
    });
  };

  const handleFriendAction = async (user) => {
    const targetUserId = user.user_id || user.id;
    const status = user.friendship_status || 'none';

    if (!targetUserId || status === 'self' || status === 'friends') return;

    setSendingUserId(targetUserId);
    try {
      if (status === 'request_received') {
        await friendService.approve(user.friendship_id);
        updateUserStatus(targetUserId, 'friends', user.friendship_id);
        return;
      }

      if (status === 'none') {
        const response = await friendService.sendRequest(targetUserId);
        updateUserStatus(
          targetUserId,
          'request_sent',
          response.data?.id || user.friendship_id
        );
      }
    } catch (err) {
      Alert.alert(
        'Error',
        err.response?.data?.message || 'Unable to update friend request.'
      );
    } finally {
      setSendingUserId(null);
    }
  };

  const withFriendshipOverride = (user) => {
    const userId = user.user_id || user.id;
    return friendshipOverrides[userId]
      ? { ...user, ...friendshipOverrides[userId] }
      : user;
  };

  const withTeamMemberOverrides = (team) => ({
    ...team,
    members: (team.members || []).map(withFriendshipOverride),
  });

  return (
    <View style={styles.container}>
      {/* Your rank banner */}
      {(your_rank || your_team_rank) && (
        <View style={styles.yourRankBanner}>
          <Text style={styles.yourRankLabel}>
            {type === 'team' ? 'Team Rank' : 'Your Rank'}
          </Text>
          <Text style={styles.yourRankValue}>
            #{your_rank || your_team_rank}
          </Text>
        </View>
      )}

      <Text style={styles.sectionTitle}>
        {type === 'solo'
          ? 'All Participants Ranking'
          : 'All Teams Ranking'
        }
      </Text>

      {top.length === 0 ? (
        <Text style={styles.empty}>
          {type === 'solo' ? 'No participants yet.' : 'No teams yet.'}
        </Text>
      ) : (
        top.map((item, i) => (
          <RankRow
            key={type === 'solo' ? item.user_id : item.team_id}
            item={item}
            index={i}
            type={type}
            isYou={
              type === 'solo'
                ? item.user_id === (current_user_id || challenge?.current_user_id)
                : item.team_id === your_team_id
            }
            targetType={challenge?.target_type}
            unit={challenge?.unit}
            onPress={() => setSelected({
              type,
              data: type === 'team'
                ? withTeamMemberOverrides(item)
                : withFriendshipOverride(item),
            })}
          />
        ))
      )}

      <Text style={styles.total}>
        {type === 'solo'
          ? `${total_participants} total participants`
          : `${total_teams} teams competing`
        }
      </Text>

      <ParticipantInfoModal
        selected={selected}
        challenge={challenge}
        sendingUserId={sendingUserId}
        onClose={() => setSelected(null)}
        onFriendAction={handleFriendAction}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 8 },
  empty: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 4,
    marginBottom: 4,
  },
  yourRankBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.primaryBg,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.primaryLight,
  },
  yourRankLabel: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '600',
  },
  yourRankValue: {
    fontSize: 20,
    color: colors.primary,
    fontWeight: '800',
  },
  total: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
});
