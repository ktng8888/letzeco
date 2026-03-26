import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BASE_URL } from '../../constants/api';
import { getRankBorderColor } from '../../utils/rankUtils';
import images from '../../constants/images';
import colors from '../../constants/colors';

export default function LeaderboardCard({ item, myId }) {
  const router = useRouter();
  const isMe = item.id === myId;
  const isTop3 = item.rank <= 3;

  const medal = item.rank === 1
    ? '🥇' : item.rank === 2
    ? '🥈' : item.rank === 3
    ? '🥉' : null;

  return (
    <TouchableOpacity
      style={[styles.card, isMe && styles.cardMe]}
      onPress={() => {
        if (!isMe) {
          router.push({
            pathname: '/screens/user-profile',
            params: { userId: item.id }
          });
        }
      }}
      disabled={isMe}
    >
      {/* Rank */}
      <View style={styles.rankContainer}>
        {medal ? (
          <Text style={styles.medal}>{medal}</Text>
        ) : (
          <Text style={[styles.rank, isMe && styles.rankMe]}>
            #{item.rank}
          </Text>
        )}
      </View>

      {/* Avatar */}
      <View style={[
        styles.avatar,
        isMe && styles.avatarMe,
        isTop3 && styles.avatarTop3 &&
        { borderColor: getRankBorderColor(item.rank) }
      ]}>
        {item.profile_image ? (
            <Image
            source={{ uri: `${BASE_URL}/${item.profile_image}` }}
            style={styles.avatarImg}
            />
        ) : (
            <Text style={styles.avatarText}>
            {item.username?.charAt(0).toUpperCase()}
            </Text>
        )}
      </View>

      {/* User Info */}
      <View style={styles.info}>
        <Text style={[styles.username, isMe && styles.usernameMe]}>
          {isMe ? `${item.username} (You)` : item.username}
        </Text>
        <View style={styles.metaRow}>
          <Text style={styles.meta}>Lv.{item.level}</Text>
          <Text style={styles.metaDot}>•</Text>
          <Text style={styles.meta}>
            {item.streak > 0 ? `🔥 ${item.streak}` : 'No streak'}
          </Text>
        </View>
      </View>

      {/* Weekly XP */}
      <View style={styles.xpContainer}>
        <Text style={[styles.xpValue, isMe && styles.xpValueMe]}>
          {item.weekly_xp}
        </Text>
        <Text style={styles.xpLabel}>WXP</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgWhite,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  cardMe: {
    backgroundColor: colors.primaryBg,
    borderWidth: 1,
    borderColor: colors.primaryLight,
  },
  rankContainer: {
    width: 36,
    alignItems: 'center',
  },
  medal: { fontSize: 22 },
  rank: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  rankMe: { color: colors.primary },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
  avatarTop3: {
    borderColor: '#f59e0b',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
},
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  info: { flex: 1 },
  username: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  usernameMe: { color: colors.primary },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  meta: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  metaDot: {
    fontSize: 12,
    color: colors.textLight,
  },
  xpContainer: { alignItems: 'flex-end' },
  xpValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  xpValueMe: { color: colors.primary },
  xpLabel: {
    fontSize: 11,
    color: colors.textSecondary,
  },
});