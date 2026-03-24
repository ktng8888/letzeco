import { View, Text, StyleSheet } from 'react-native';
import colors from '../../constants/colors';

export default function TodayActionCard({ action }) {
  const isInProgress = action.status === 'in_progress';

  return (
    <View style={styles.card}>
      <View style={styles.left}>
        <View style={[
          styles.categoryTag,
          { backgroundColor: action.tag_bg_colour_code || colors.primaryBg }
        ]}>
          <Text style={[
            styles.categoryText,
            { color: action.tag_text_colour_code || colors.primary }
          ]}>
            {action.category_name}
          </Text>
        </View>
        <Text style={styles.actionName} numberOfLines={1}>
          {action.action_name}
        </Text>
        {isInProgress && (
          <Text style={styles.inProgress}>● Logging...</Text>
        )}
      </View>
      <Text style={styles.xp}>
        +{action.xp_gained || action.xp_reward} XP
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bgWhite,
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  left: { flex: 1, gap: 4 },
  categoryTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  categoryText: { fontSize: 11, fontWeight: '600' },
  actionName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  inProgress: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '500',
  },
  xp: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.xpColor,
  },
});