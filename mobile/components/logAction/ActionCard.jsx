import {
  View, Text, TouchableOpacity, StyleSheet, Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Badge from '../common/Badge';
import colors from '../../constants/colors';
import { getImageUrl } from '../../utils/imageUrl';

export default function ActionCard({
  action,
  onPress,
  onFavouriteToggle,
  isLogging = false,
  timeLeft = null
}) {
  const imageUrl = getImageUrl(action.image);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.top}>

        {/* Favourite button - top right */}
        <TouchableOpacity
          onPress={(e) => {
            e.stopPropagation();
            onFavouriteToggle && onFavouriteToggle(action);
          }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={styles.favouriteBtn}
        >
          <Ionicons
            name={action.is_favourite ? 'heart' : 'heart-outline'}
            size={20}
            color={action.is_favourite ? colors.error : colors.textLight}
          />
        </TouchableOpacity>

        {/* Body Row: Image + (Badge + Name) */}
        <View style={styles.bodyRow}>
          <View style={styles.imageContainer}>
            {imageUrl ? (
              <Image
                source={{ uri: imageUrl }}
                style={styles.actionImage}
                resizeMode="contain"
              />
            ) : (
              <Text style={styles.fallbackIcon}>🌿</Text>
            )}
          </View>

          {/* Badge + Name stacked */}
          <View style={styles.textCol}>
            <Badge
              text={action.category_name}
              bgColor={action.tag_bg_colour_code}
              textColor={action.tag_text_colour_code}
            />
            <Text style={styles.name} numberOfLines={2}>
              {action.name}
            </Text>
          </View>
        </View>

        {/* Bottom Row: XP + log count + Select */}
        <View style={styles.bottomRow}>
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="star" size={12} color={colors.xpColor} />
              <Text style={styles.metaText}>{action.xp_reward} XP</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={12} color={colors.textLight} />
              <Text style={styles.metaText}>
                I logged {action.user_log_count} times
              </Text>
            </View>
          </View>

          {isLogging ? (
            <View style={styles.loggingBadge}>
              <Text style={styles.loggingText}>
                {timeLeft || 'In Progress'}
              </Text>
            </View>
          ) : (
            <Text style={styles.selectText}>Select</Text>
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
  top: {
    gap: 10,
    position: 'relative',
  },
  favouriteBtn: {
    position: 'absolute',
    top: 0,
    right: 0,
    zIndex: 1,
  },
  bodyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  imageContainer: {
    width: 56,
    height: 56,
    borderRadius: 10,
    backgroundColor: colors.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    flexShrink: 0,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionImage: {
    width: 56,
    height: 56,
  },
  fallbackIcon: {
    fontSize: 26,
  },
  textCol: {
    flex: 1,
    gap: 6,
  },
  name: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
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
  loggingBadge: {
    backgroundColor: colors.primaryBg,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  loggingText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
  },
  selectText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '600',
  },
});