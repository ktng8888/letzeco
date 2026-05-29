import {
  View,
  Text,
  StyleSheet,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import colors from '../../constants/colors';
import { getImageUrl } from '../../utils/imageUrl';
import SoundTouchableOpacity from '../common/SoundTouchableOpacity';

export default function TodayActionsSection({
  actions,
  loggedCount,
  onLogMorePress,
  onActionPress,
}) {
  return (
    <View style={styles.card}>
      <View style={styles.sectionRow}>
        <View style={styles.sectionTitleRow}>
          <Ionicons name="flash-outline" size={16} color={colors.xpColor} />
          <Text style={styles.sectionTitle}>Today's Actions</Text>
        </View>
        <SoundTouchableOpacity onPress={onLogMorePress}>
          <Text style={styles.logMore}>Log More</Text>
        </SoundTouchableOpacity>
      </View>

      {actions.length === 0 ? (
        <SoundTouchableOpacity style={styles.emptyBox} onPress={onLogMorePress}>
          <Ionicons name="leaf-outline" size={34} color={colors.primary} />
          <Text style={styles.emptyTitle}>Start logging today!</Text>
          <Text style={styles.emptySub}>Tap to log your first eco-action</Text>
        </SoundTouchableOpacity>
      ) : (
        <>
          <Text style={styles.actionCount}>{loggedCount} logged today</Text>
          {actions.map(action => (
            <TodayActionRow
              key={action.id}
              action={action}
              onPress={() => onActionPress(action)}
            />
          ))}
        </>
      )}
    </View>
  );
}

function TodayActionRow({ action, onPress }) {
  const canOpenLogDetail = action?.status === 'completed' && !!action?.id;

  return (
    <SoundTouchableOpacity
      style={styles.actionRow}
      activeOpacity={canOpenLogDetail ? 0.75 : 1}
      disabled={!canOpenLogDetail}
      onPress={onPress}
    >
      {action.action_image ? (
        <Image
          source={{ uri: getImageUrl(action.action_image) ?? undefined }}
          style={styles.actionImg}
        />
      ) : (
        <View
          style={[
            styles.actionImg,
            styles.actionImgFallback,
            { backgroundColor: action.tag_bg_colour_code || colors.primaryBg },
          ]}
        >
          <Ionicons
            name="leaf-outline"
            size={20}
            color={action.tag_text_colour_code || colors.primary}
          />
        </View>
      )}
      <View style={styles.actionInfo}>
        <Text style={styles.actionName} numberOfLines={1}>
          {action.action_name}
        </Text>
        <Text style={styles.actionTime}>{formatActionTime(action)}</Text>
        <View
          style={[
            styles.catTag,
            { backgroundColor: action.tag_bg_colour_code || colors.primaryBg },
          ]}
        >
          <Text
            style={[
              styles.catTagText,
              { color: action.tag_text_colour_code || colors.primary },
            ]}
          >
            {action.category_name}
          </Text>
        </View>
      </View>
      <View>
        {action.status === 'in_progress' ? (
          <View style={styles.loggingPill}>
            <Text style={styles.loggingText}>Logging</Text>
          </View>
        ) : (
          <Text style={styles.actionXp}>
            +{action.xp_gained || action.xp_reward} XP
          </Text>
        )}
      </View>
    </SoundTouchableOpacity>
  );
}

function formatActionTime(action) {
  const raw =
    action?.end_time ||
    action?.completed_at ||
    action?.logged_at ||
    action?.start_time ||
    action?.created_at;

  if (!raw) return 'Time unavailable';
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return 'Time unavailable';

  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  return `${hours % 12 || 12}:${minutes} ${ampm}`;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 18,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  logMore: { fontSize: 13, color: colors.primary, fontWeight: '600' },
  actionCount: { fontSize: 12, color: colors.textSecondary, marginBottom: 10 },
  emptyBox: {
    alignItems: 'center',
    paddingVertical: 20,
    gap: 6,
    backgroundColor: colors.primaryBg,
    borderRadius: 14,
  },
  emptyTitle: { fontSize: 14, fontWeight: '700', color: colors.primary },
  emptySub: { fontSize: 12, color: colors.textSecondary },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  actionImg: { width: 44, height: 44, borderRadius: 12 },
  actionImgFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionInfo: { flex: 1, gap: 4 },
  actionName: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  actionTime: { fontSize: 11, color: colors.textSecondary, marginTop: -1 },
  catTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  catTagText: { fontSize: 11, fontWeight: '600' },
  actionXp: { fontSize: 14, fontWeight: '700', color: colors.xpColor },
  loggingPill: {
    backgroundColor: colors.streakBg,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  loggingText: { fontSize: 12, fontWeight: '600', color: colors.streakColor },
});
