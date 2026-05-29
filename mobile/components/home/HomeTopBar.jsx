import {
  View,
  Text,
  StyleSheet,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { BASE_URL } from '../../constants/api';
import colors from '../../constants/colors';
import SoundTouchableOpacity from '../common/SoundTouchableOpacity';

export default function HomeTopBar({
  user,
  xpToNextLevel,
  xpPercent,
  giftCount,
  unreadCount,
  onProfilePress,
  onGiftsPress,
  onNotificationsPress,
}) {
  const avatarUri = user?.profile_image ? `${BASE_URL}/${user.profile_image}` : null;

  return (
    <View style={styles.topBar}>
      <SoundTouchableOpacity style={styles.topLeft} onPress={onProfilePress}>
        <View style={styles.avatarWrap}>
          <View style={styles.avatarRing}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.topAvatar} />
            ) : (
              <View style={styles.topAvatarFallback}>
                <Text style={styles.topAvatarInitial}>
                  {user?.username?.charAt(0).toUpperCase() || '?'}
                </Text>
              </View>
            )}
          </View>
          <View style={styles.lvlChip}>
            <Text style={styles.lvlChipText}>Lv.{user?.level}</Text>
          </View>
        </View>

        <View style={styles.topNameBlock}>
          <Text style={styles.topName}>{user?.username}</Text>
          <View style={styles.topXpBarBg}>
            <View style={[styles.topXpBarFill, { width: `${xpPercent}%` }]} />
          </View>
          <Text style={styles.topXpLabel}>
            {user?.level_xp} / {xpToNextLevel} XP
          </Text>
        </View>
      </SoundTouchableOpacity>

      <View style={styles.topRight}>
        <View style={styles.xpStack}>
          <View style={styles.xpStackChip}>
            <Text style={styles.xpStackVal}>{user?.weekly_xp || 0}</Text>
            <Text style={styles.xpStackLabel}> Weekly XP</Text>
          </View>
          <View style={styles.xpStackChip}>
            <Text style={styles.xpStackVal}>{user?.total_xp || 0}</Text>
            <Text style={styles.xpStackLabel}> Total XP</Text>
          </View>
        </View>

        <SoundTouchableOpacity style={styles.bellBtn} onPress={onGiftsPress}>
          <Ionicons name="gift-outline" size={22} color={colors.textPrimary} />
          {giftCount > 0 && <View style={styles.bellDot} />}
        </SoundTouchableOpacity>

        <SoundTouchableOpacity style={styles.bellBtn} onPress={onNotificationsPress}>
          <Ionicons name="notifications-outline" size={20} color={colors.textPrimary} />
          {unreadCount > 0 && <View style={styles.bellDot} />}
        </SoundTouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 52,
    paddingBottom: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    gap: 8,
  },
  topLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
  },
  avatarWrap: {
    alignItems: 'center',
    marginBottom: 6,
  },
  avatarRing: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2.5,
    borderColor: colors.primary,
    overflow: 'hidden',
    backgroundColor: colors.primaryBg,
  },
  topAvatar: { width: '100%', height: '100%' },
  topAvatarFallback: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryBg,
  },
  topAvatarInitial: { fontSize: 18, fontWeight: '700', color: colors.primary },
  lvlChip: {
    position: 'absolute',
    bottom: -8,
    alignSelf: 'center',
    backgroundColor: colors.primary,
    borderRadius: 6,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderWidth: 1.5,
    borderColor: '#fff',
  },
  lvlChipText: { fontSize: 9, fontWeight: '700', color: '#fff' },
  topNameBlock: { flex: 1 },
  topName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 3,
  },
  topXpBarBg: {
    height: 5,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    overflow: 'hidden',
  },
  topXpBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  topXpLabel: { fontSize: 10, color: colors.textSecondary, marginTop: 2 },
  topRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  xpStack: { gap: 4 },
  xpStackChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  xpStackVal: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  xpStackLabel: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  bellBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.error,
  },
});
