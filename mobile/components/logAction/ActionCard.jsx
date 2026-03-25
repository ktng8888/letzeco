import {
  View, Text, TouchableOpacity, StyleSheet
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Badge from '../common/Badge';
import colors from '../../constants/colors';

export default function ActionCard({
  action,
  onPress,
  onFavouriteToggle,
  isLogging = false,
  timeLeft = null
}) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.top}>
        {/* Category + Favourite */}
        <View style={styles.topRow}>
          <Badge
            text={action.category_name}
            bgColor={action.tag_bg_colour_code}
            textColor={action.tag_text_colour_code}
          />
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              onFavouriteToggle && onFavouriteToggle(action);
            }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={action.is_favourite ? 'heart' : 'heart-outline'}
              size={20}
              color={action.is_favourite ? colors.error : colors.textLight}
            />
          </TouchableOpacity>
        </View>

        {/* Action Name */}
        <Text style={styles.name} numberOfLines={2}>
          {action.name}
        </Text>

        {/* Bottom Row */}
        <View style={styles.bottomRow}>
          <View style={styles.metaRow}>
            {/* XP */}
            <View style={styles.metaItem}>
              <Ionicons name="star" size={12} color={colors.xpColor} />
              <Text style={styles.metaText}>{action.xp_reward} XP</Text>
            </View>
            {/* User log count */}
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={12} color={colors.textLight} />
              <Text style={styles.metaText}>
                I logged {action.user_log_count} times
              </Text>
            </View>
          </View>

          {/* Status button */}
          {isLogging ? (
            <View style={styles.loggingBadge}>
              <Text style={styles.loggingText}>
                {timeLeft || 'Logging...'}
              </Text>
            </View>
          ) : (
            <View style={styles.selectBtn}>
              <Text style={styles.selectText}>Select</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bgWhite,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  top: { gap: 8 },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaRow: {
    flexDirection: 'row',
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  metaText: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  selectBtn: {
    backgroundColor: colors.primaryBg,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },
  selectText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  loggingBadge: {
    backgroundColor: colors.streakBg,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  loggingText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.streakColor,
  },
});