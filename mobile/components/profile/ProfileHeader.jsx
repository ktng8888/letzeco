import {
  View, Text, TouchableOpacity, StyleSheet, Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BASE_URL } from '../../constants/api';
import colors from '../../constants/colors';

export default function ProfileHeader({
  user,
  totalBadges,
  totalActions,
  totalFriends,
  isOwnProfile = true,
  friendshipStatus,
  onEditPress,
  onFriendPress,
}) {
  return (
    <View style={styles.container}>

      {/* Avatar + Edit */}
      <View style={styles.avatarSection}>
        <View style={styles.avatarWrapper}>
          {user?.profile_image ? (
            <Image
                source={{ uri: `${BASE_URL}/${user.profile_image}` }}
                style={styles.avatar}
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {user?.username?.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          {isOwnProfile && (
            <TouchableOpacity
              style={styles.editAvatarBtn}
              onPress={onEditPress}
            >
              <Ionicons name="camera" size={14} color={colors.textWhite} />
            </TouchableOpacity>
          )}
        </View>

        {/* Username + Level */}
        <Text style={styles.username}>{user?.username}</Text>
        <Text style={styles.userId}>User ID: {user?.id}</Text>

        {/* Level XP Bar */}
        <View style={styles.xpBarContainer}>
          <Text style={styles.levelText}>Lv. {user?.level}</Text>
          <View style={styles.xpBarBg}>
            <View style={[
              styles.xpBarFill,
              { width: `${getXpPercent(user)}%` }
            ]} />
          </View>
          <Text style={styles.xpText}>
            {user?.level_xp} / {user?.xp_to_next_level || 1000} XP
          </Text>
        </View>

        {/* Friend button (other profiles) */}
        {!isOwnProfile && (
          <TouchableOpacity
            style={[
              styles.friendBtn,
              getFriendBtnStyle(friendshipStatus)
            ]}
            onPress={onFriendPress}
          >
            <Text style={[
              styles.friendBtnText,
              friendshipStatus === 'friends' && styles.friendBtnTextGreen
            ]}>
              {getFriendBtnText(friendshipStatus)}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <StatItem
          value={totalBadges || 0}
          label="Badges"
        />
        <View style={styles.statDivider} />
        <StatItem
          value={totalActions || 0}
          label="Actions"
        />
        {isOwnProfile && (
          <>
            <View style={styles.statDivider} />
            <StatItem
              value={totalFriends || 0}
              label="Friends"
            />
          </>
        )}
      </View>
    </View>
  );
}

function StatItem({ value, label }) {
  return (
    <View style={styles.statItem}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function getXpPercent(user) {
  if (!user) return 0;
  const max = user.xp_to_next_level || 1000;
  return Math.min((user.level_xp / max) * 100, 100);
}

function getFriendBtnText(status) {
  switch (status) {
    case 'friends': return '✓ Friends';
    case 'request_sent': return 'Request Sent';
    case 'request_received': return 'Accept Request';
    default: return 'Send Friend Request';
  }
}

function getFriendBtnStyle(status) {
  if (status === 'friends') return { backgroundColor: colors.primaryBg };
  if (status === 'request_sent') return { backgroundColor: colors.bgGreyDark };
  return { backgroundColor: colors.primary };
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.bgWhite,
    paddingBottom: 0,
  },
  avatarSection: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 10,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.primary,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.primary,
  },
  editAvatarBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary,
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.bgWhite,
  },
  username: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  userId: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 10,
  },
  xpBarContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 4,
  },
  levelText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
  xpBarBg: {
    width: '100%',
    height: 8,
    backgroundColor: colors.bgGrey,
    borderRadius: 4,
    overflow: 'hidden',
  },
  xpBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  xpText: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  friendBtn: {
    marginTop: 12,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
  },
  friendBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textWhite,
  },
  friendBtnTextGreen: {
    color: colors.primary,
  },
  statsRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingVertical: 12,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.border,
  },
});