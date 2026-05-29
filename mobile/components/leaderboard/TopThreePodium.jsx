import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { BASE_URL } from '../../constants/api';
import { getRankBorderColor } from '../../utils/rankUtils';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../constants/colors';

export default function TopThreePodium({ top3, myId, isFriends }) {
  const [first, second, third] = top3 || [];

  return (
    <View style={styles.podium}>
      {/* 2nd place */}
      <PodiumItem
        user={second}
        rank={2}
        height={80}
        isMe={second?.id === myId}
        isFriends={isFriends}
      />
      {/* 1st place */}
      <PodiumItem
        user={first}
        rank={1}
        height={110}
        isMe={first?.id === myId}
        isFriends={isFriends}
      />
      {/* 3rd place */}
      <PodiumItem
        user={third}
        rank={3}
        height={60}
        isMe={third?.id === myId}
        isFriends={isFriends}
      />
    </View>
  );
}

function PodiumItem({ user, rank, height, isMe, isFriends }) {
  const router = useRouter();
  const medal = getMedalMeta(rank);

  if (!user) {
    return (
      <View style={styles.podiumSlot}>
        <Ionicons name={medal.icon} size={25} color={medal.color} style={styles.medal} />
        <TouchableOpacity
          style={[styles.avatar, styles.avatarEmpty]}
          onPress={() => isFriends && router.push('/screens/friends')}
        >
          <Text style={styles.avatarEmptyIcon}>+</Text>
        </TouchableOpacity>
        <Text style={styles.usernameEmpty}>
          {isFriends ? 'Add Friend' : '---'}
        </Text>
        <Text style={styles.xp}>—</Text>
        <View style={[styles.block, { height }]}>
          <Text style={styles.rankText}>#{rank}</Text>
        </View>
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={styles.podiumSlot}
      onPress={() => {
        if (!isMe) {
          router.push({
            pathname: '/screens/user-profile',
            params: { userId: user.id }
          });
        }
      }}
      disabled={isMe}
    >
      {/* Medal */}
      <Ionicons name={medal.icon} size={25} color={medal.color} style={styles.medal} />

      {/* Avatar */}
      <View style={[
        styles.avatar,
        isMe && styles.avatarMe,
        rank === 1 && styles.avatarFirst,
        { borderColor: getRankBorderColor(rank) },
      ]}>
        {user.profile_image ? (
            <Image
            source={{ uri: `${BASE_URL}/${user.profile_image}` }}
            style={styles.avatarImg}
            />
        ) : (
            <Text style={styles.avatarText}>
            {user.username?.charAt(0).toUpperCase()}
            </Text>
        )}
      </View>

      {/* Username */}
      <Text
        style={[styles.username, isMe && styles.usernameMe]}
        numberOfLines={1}
      >
        {isMe ? 'You' : user.username}
      </Text>

      {/* XP */}
      <Text style={styles.xp}>{user.weekly_xp} WXP</Text>

      {/* Podium Block */}
      <View style={[styles.block, { height }, rank === 1 && styles.blockFirst]} >
        <Text style={styles.rankText}>#{rank}</Text>
      </View>
    </TouchableOpacity>
  );
}

function getMedalMeta(rank) {
  if (rank === 1) return { icon: 'trophy', color: colors.xpColor };
  if (rank === 2) return { icon: 'medal-outline', color: colors.textLight };
  return { icon: 'ribbon-outline', color: '#c2763b' };
}

const styles = StyleSheet.create({
  podium: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 8,
  },
  podiumSlot: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  medal: { marginBottom: 4 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.bgGrey,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.border,
  },
  avatarMe: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryBg,
  },
  avatarFirst: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderColor: '#f59e0b',
    backgroundColor: '#fef3c7',
  },
  avatarImg: {
        width: '100%',
        height: '100%',
        borderRadius: 26,
    },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  avatarEmpty: {
    borderStyle: 'dashed',
    backgroundColor: '#f3f4f6',
    borderColor: colors.border,
  },
  avatarEmptyIcon: {
    fontSize: 20,
    color: colors.textSecondary,
    fontWeight: '300',
  },
  usernameEmpty: {
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  username: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  usernameMe: { color: colors.primary },
  xp: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  block: {
    width: '100%',
    backgroundColor: colors.primaryLight,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  blockFirst: {
    backgroundColor: colors.primary,
  },
  rankText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textWhite,
  },
});
