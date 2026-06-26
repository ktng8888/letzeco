import { View, Text, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BASE_URL } from '../../../constants/api';
import { formatProgress } from '../../../utils/challengeHelpers';
import colors from '../../../constants/colors';
import SoundTouchableOpacity from '../../common/SoundTouchableOpacity';

export default function RankRow({
  item,
  index,
  type,
  isYou,
  targetType,
  unit,
  onPress,
}) {
  const medal = getMedalMeta(index);
  const RowComponent = onPress ? SoundTouchableOpacity : View;

  return (
    <RowComponent
      style={[styles.row, isYou && styles.rowYou]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      {/* Rank number or medal */}
      <View style={styles.rankNum}>
        {medal ? (
          <Ionicons name={medal.icon} size={18} color={medal.color} />
        ) : (
          <Text style={[styles.rankText, isYou && styles.rankTextYou]}>
            #{item.rank}
          </Text>
        )}
      </View>

      {/* Avatar */}
      {type === 'solo' && (
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
      )}

      {/* Info */}
      <View style={styles.info}>
        <Text style={[styles.name, isYou && styles.nameYou]}>
          {type === 'solo' ? item.username : item.team_name}
          {isYou
            ? type === 'solo' ? ' (You)' : ' (Your Team)'
            : ''
          }
        </Text>
        <Text style={[styles.progress, isYou && styles.progressYou]}>
          {formatProgress(
            type === 'solo' ? item.progress_value : item.team_progress,
            targetType,
            unit,
          )}
          {type === 'team' ? ` · ${item.member_count} members` : ''}
        </Text>
      </View>
    </RowComponent>
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
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  rowYou: {
    backgroundColor: colors.primaryBg,
    borderWidth: 1,
    borderColor: colors.primaryLight,
    borderBottomColor: colors.primaryLight,
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
  rankTextYou: { color: colors.primary },
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
  avatarYou: {
    backgroundColor: colors.bgWhite,
    borderWidth: 1,
    borderColor: colors.primaryLight,
  },
  info: { flex: 1, gap: 2 },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  nameYou: { color: colors.primary },
  progress: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  progressYou: { color: colors.textSecondary },
});
