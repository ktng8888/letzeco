import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView
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
          <View style={styles.emptyIconBadge}>
            <Ionicons name="leaf-outline" size={28} color={colors.primary} />
          </View>
          <View style={styles.emptyCopy}>
            <Text style={styles.emptyTitle}>Start logging today!</Text>
            <Text
              style={styles.emptySub}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.82}
            >
              Add your first eco-action and keep the streak alive
            </Text>
          </View>
          <View style={styles.emptyHintRow}>
            <View style={styles.emptyHint}>
              <Ionicons name="flash-outline" size={12} color={colors.xpColor} />
              <Text style={styles.emptyHintText}>Earn XP</Text>
            </View>
            <View style={[styles.emptyHint, styles.emptyHintStreak]}>
              <Ionicons name="flame-outline" size={12} color={colors.streakColor} />
              <Text style={styles.emptyHintText}>Build streak</Text>
            </View>
          </View>
        </SoundTouchableOpacity>
      ) : (
        <>
          <Text style={styles.actionCount}>{loggedCount} logged today</Text>
          <ScrollView
            style={styles.actionsList}
            nestedScrollEnabled
            showsVerticalScrollIndicator={actions.length > 4}
          >
            {actions.map((action, index) => (
              <TodayActionRow
                key={action.id}
                action={action}
                isLast={index === actions.length - 1}
                onPress={() => onActionPress(action)}
              />
            ))}
          </ScrollView>
        </>
      )}
    </View>
  );
}

function TodayActionRow({ action, onPress, isLast }) {
  const canOpenLogDetail = action?.status === 'completed' && !!action?.id;

  return (
    <SoundTouchableOpacity
      style={[styles.actionRow, isLast && styles.actionRowLast]}
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
  actionsList: {
    maxHeight: 294,
  },
  emptyBox: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 18,
    gap: 13,
    backgroundColor: '#f2fff6',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#d9fbe5',
  },
  emptyIconBadge: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: colors.bgWhite,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.primaryLight,
  },
  emptyCopy: {
    alignItems: 'center',
    gap: 7,
  },
  emptyTitle: { fontSize: 15, fontWeight: '800', color: colors.primary },
  emptySub: {
    fontSize: 11,
    lineHeight: 17,
    color: colors.textSecondary,
    textAlign: 'center',
    width: '100%',
  },
  emptyHintRow: {
    flexDirection: 'row',
    gap: 7,
    marginTop: 1,
  },
  emptyHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.bgWhite,
    borderWidth: 1,
    borderColor: '#fde68a',
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  emptyHintStreak: {
    borderColor: '#fed7aa',
  },
  emptyHintText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  actionRowLast: {
    marginBottom: 0,
    paddingBottom: 0,
    borderBottomWidth: 0,
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
