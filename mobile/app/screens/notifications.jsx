import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, RefreshControl, Alert
} from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import notificationService from '../../services/notificationService';
import LoadingScreen from '../../components/common/LoadingScreen';
import NotificationCard from '../../components/notifications/NotificationCard';
import colors from '../../constants/colors';

export default function NotificationsScreen() {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadData = async () => {
    try {
      const data = await notificationService.getAll();
      setNotifications(data.data.notifications || []);
      setUnreadCount(data.data.unread_count || 0);
    } catch (err) {
      console.error('Load notifications error:', err);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Mark as read error:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev =>
        prev.map(n => ({ ...n, is_read: true }))
      );
      setUnreadCount(0);
    } catch (err) {
      console.error('Mark all as read error:', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await notificationService.delete(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      // Update unread count if it was unread
      const wasUnread = notifications.find(
        n => n.id === id && !n.is_read
      );
      if (wasUnread) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Delete notification error:', err);
    }
  };

  const handleDeleteAll = () => {
    Alert.alert(
      'Delete All Notifications',
      'Are you sure you want to delete all notifications?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: async () => {
            try {
              await notificationService.deleteAll();
              setNotifications([]);
              setUnreadCount(0);
            } catch (err) {
              console.error('Delete all error:', err);
            }
          }
        }
      ]
    );
  };

  const handleNotifPress = async (notification) => {
    // Mark as read first
    if (!notification.is_read) {
      await handleMarkAsRead(notification.id);
    }

    // Navigate based on type
    switch (notification.type) {
      case 'level_up':
        router.push('/(tabs)/profile');
        break;
      case 'badge_unlocked':
        router.push('/(tabs)/profile');
        break;
      case 'streak_reward':
        router.push('/(tabs)/profile');
        break;
      case 'friend_request':
      case 'friend_approved':
        router.push('/screens/friends');
        break;
      case 'challenge_completed':
        router.push('/screens/challenges');
        break;
      default:
        break;
    }
  };

  if (isLoading) return <LoadingScreen />;

  // Group by today vs earlier
  const today = notifications.filter(n => isToday(n.created_at));
  const earlier = notifications.filter(n => !isToday(n.created_at));

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons
            name="arrow-back"
            size={24}
            color={colors.textPrimary}
          />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Notifications</Text>
          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>
        <View style={styles.headerActions}>
          {unreadCount > 0 && (
            <TouchableOpacity
              onPress={handleMarkAllAsRead}
              style={styles.headerBtn}
            >
              <Ionicons
                name="checkmark-done"
                size={20}
                color={colors.primary}
              />
            </TouchableOpacity>
          )}
          {notifications.length > 0 && (
            <TouchableOpacity
              onPress={handleDeleteAll}
              style={styles.headerBtn}
            >
              <Ionicons
                name="trash-outline"
                size={20}
                color={colors.error}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Mark all as read hint */}
      {unreadCount > 0 && (
        <TouchableOpacity
          style={styles.markAllRow}
          onPress={handleMarkAllAsRead}
        >
          <Ionicons
            name="checkmark-done-outline"
            size={14}
            color={colors.primary}
          />
          <Text style={styles.markAllText}>
            Mark all as read ({unreadCount} unread)
          </Text>
        </TouchableOpacity>
      )}

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {notifications.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🔔</Text>
            <Text style={styles.emptyTitle}>No notifications yet</Text>
            <Text style={styles.emptySubtitle}>
              Complete eco-actions to earn rewards and see notifications here!
            </Text>
          </View>
        ) : (
          <View style={styles.content}>

            {/* Today */}
            {today.length > 0 && (
              <View style={styles.group}>
                <Text style={styles.groupLabel}>Today</Text>
                {today.map((notif) => (
                  <NotificationCard
                    key={notif.id}
                    notification={notif}
                    onPress={() => handleNotifPress(notif)}
                    onDelete={() => handleDelete(notif.id)}
                  />
                ))}
              </View>
            )}

            {/* Earlier */}
            {earlier.length > 0 && (
              <View style={styles.group}>
                <Text style={styles.groupLabel}>Earlier</Text>
                {earlier.map((notif) => (
                  <NotificationCard
                    key={notif.id}
                    notification={notif}
                    onPress={() => handleNotifPress(notif)}
                    onDelete={() => handleDelete(notif.id)}
                  />
                ))}
              </View>
            )}

          </View>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>

    </View>
  );
}

// ─────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────
function isToday(dateString) {
  if (!dateString) return false;
  const date = new Date(dateString);
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

// ─────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgLight,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 56,
    paddingBottom: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.bgWhite,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  unreadBadge: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  unreadBadgeText: {
    color: colors.textWhite,
    fontSize: 11,
    fontWeight: '700',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 4,
  },
  headerBtn: {
    padding: 4,
  },
  markAllRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: colors.primaryBg,
    borderBottomWidth: 1,
    borderBottomColor: colors.primaryLight,
  },
  markAllText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '500',
  },
  content: {
    padding: 16,
  },
  group: {
    marginBottom: 16,
  },
  groupLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginLeft: 4,
  },
  empty: {
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: 40,
    gap: 12,
  },
  emptyIcon: { fontSize: 52 },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});