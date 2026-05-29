import { View, Text, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BASE_URL } from '../../../constants/api';
import { formatProgress } from '../../../utils/challengeHelpers';
import colors from '../../../constants/colors';

export default function RankRow({ item, index, type, isYou, targetType, unit }) {
  const medal = getMedalMeta(index);

  return (
    <View style={styles.row}>
      {/* Rank number or medal */}
      <View style={styles.rankNum}>
        {medal ? (
          <Ionicons name={medal.icon} size={18} color={medal.color} />
        ) : (
          <Text style={styles.rankText}>#{item.rank}</Text>
        )}
      </View>

      {/* Avatar */}
      {type === 'solo' ? (
        <View style={styles.avatar}>
          {item.profile_image ? (
            <Image
              source={{ uri: `${BASE_URL}/${item.profile_image}` }}
              style={styles.avatarImg}
            />
          ) : (
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarInitial}>
                {item.username?.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
        </View>
      ) : (
        <View style={[styles.avatar, styles.teamAvatarBg]}>
          <Ionicons name="people-outline" size={17} color={colors.primary} />
        </View>
      )}

      {/* Info */}
      <View style={styles.info}>
        <Text style={styles.name}>
          {type === 'solo' ? item.username : item.team_name}
          {isYou
            ? type === 'solo' ? ' (You)' : ' (Your Team)'
            : ''
          }
        </Text>
        <Text style={styles.progress}>
          {formatProgress(
            type === 'solo' ? item.progress_value : item.team_progress,
            targetType,
            unit,
          )}
          {type === 'team' ? ` · ${item.member_count} members` : ''}
        </Text>
      </View>
    </View>
  );
}

function getMedalMeta(index) {
  if (index === 0) return { icon: 'trophy', color: colors.xpColor };
  if (index === 1) return { icon: 'medal-outline', color: colors.textLight };
  if (index === 2) return { icon: 'ribbon-outline', color: '#c2763b' };
  return null;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  rankNum: {
    width: 32,
    alignItems: 'center',
  },
  rankText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textSecondary,
    textAlign: 'center',
  },
  rankFirst:  { color: '#f59e0b', fontSize: 20 },
  rankSecond: { color: '#9ca3af', fontSize: 20 },
  rankThird:  { color: '#b45309', fontSize: 20 },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
  avatarImg: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarFallback: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  teamAvatarBg: {
    backgroundColor: colors.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: { flex: 1, gap: 2 },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  progress: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});
