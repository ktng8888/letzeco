import {
  View, Text, TouchableOpacity, StyleSheet
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../constants/colors';

export default function NotificationCard({
  notification,
  onPress,
  onDelete
}) {
  const isUnread = !notification.is_read;
  const config = getNotifConfig(notification.type);

  return (
    <TouchableOpacity
      style={[styles.card, isUnread && styles.cardUnread]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Unread dot */}
      {isUnread && <View style={styles.unreadDot} />}

      {/* Icon */}
      <View style={[
        styles.iconContainer,
        { backgroundColor: config.bgColor }
      ]}>
        <Text style={styles.iconEmoji}>{config.emoji}</Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={[
          styles.title,
          isUnread && styles.titleUnread
        ]}>
          {notification.title}
        </Text>
        <Text style={styles.message} numberOfLines={2}>
          {notification.message}
        </Text>
        <Text style={styles.time}>
          {formatTime(notification.created_at)}
        </Text>
      </View>

      {/* Delete Button */}
      <TouchableOpacity
        style={styles.deleteBtn}
        onPress={onDelete}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons
          name="close"
          size={16}
          color={colors.textLight}
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

function getNotifConfig(type) {
  const configs = {
    level_up: {
      emoji: '🎉',
      bgColor: '#fef3c7',
    },
    badge_unlocked: {
      emoji: '🏅',
      bgColor: '#fef3c7',
    },
    streak_reward: {
      emoji: '🔥',
      bgColor: '#fff7ed',
    },
    streak_reminder: {
      emoji: '⚠️',
      bgColor: '#fff7ed',
    },
    friend_request: {
      emoji: '👫',
      bgColor: '#eff6ff',
    },
    friend_approved: {
      emoji: '✅',
      bgColor: '#f0fdf4',
    },
    challenge_completed: {
      emoji: '🏆',
      bgColor: '#fef3c7',
    },
    action_deadline: {
      emoji: '⏰',
      bgColor: '#fef2f2',
    },
    new_challenge: {
      emoji: '🌟',
      bgColor: '#f0fdf4',
    },
  };
  return configs[type] || { emoji: '🔔', bgColor: colors.bgGrey };
}

function formatTime(dateString) {
  if (!dateString) return '';
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${date.getDate()} ${months[date.getMonth()]}`;
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.bgWhite,
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
    position: 'relative',
  },
  cardUnread: {
    backgroundColor: '#f8fff8',
    borderWidth: 1,
    borderColor: colors.primaryLight,
  },
  unreadDot: {
    position: 'absolute',
    top: 14,
    left: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  iconEmoji: { fontSize: 22 },
  content: { flex: 1 },
  title: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textPrimary,
    marginBottom: 3,
  },
  titleUnread: {
    fontWeight: '700',
  },
  message: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: 4,
  },
  time: {
    fontSize: 11,
    color: colors.textLight,
  },
  deleteBtn: {
    padding: 2,
    marginTop: 2,
  },
});