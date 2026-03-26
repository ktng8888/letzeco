import {
  View, Text, TouchableOpacity, StyleSheet,
  Switch, Alert
} from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import useAuthStore from '../../store/authStore';
import colors from '../../constants/colors';

export default function SettingsScreen() {
  const router = useRouter();
  const { logout } = useAuthStore();
  const [streakReminder, setStreakReminder] = useState(true);
  const [deadlineReminder, setDeadlineReminder] = useState(true);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>

        {/* Account Section */}
        <Text style={styles.sectionLabel}>Account</Text>
        <View style={styles.card}>
          <SettingRow
            icon="person-outline"
            label="Edit Profile"
            onPress={() => router.push('/screens/edit-profile')}
          />
          <View style={styles.divider} />
          <SettingRow
            icon="lock-closed-outline"
            label="Reset Password"
            onPress={() => router.push('/screens/reset-password')}
          />
        </View>

        {/* Push Notifications Section */}
        <Text style={styles.sectionLabel}>
          Push Notification Preferences
        </Text>
        <View style={styles.card}>
          <ToggleRow
            icon="flame-outline"
            label="Streak Reminder"
            value={streakReminder}
            onToggle={setStreakReminder}
          />
          <View style={styles.divider} />
          <ToggleRow
            icon="time-outline"
            label="Deadline Reminder"
            value={deadlineReminder}
            onToggle={setDeadlineReminder}
          />
        </View>

        {/* Logout */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={20} color={colors.error} />
          <Text style={styles.logoutText}>LOGOUT</Text>
        </TouchableOpacity>

      </View>
    </View>
  );
}

function SettingRow({ icon, label, onPress }) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress}>
      <View style={styles.rowLeft}>
        <Ionicons name={icon} size={20} color={colors.textSecondary} />
        <Text style={styles.rowLabel}>{label}</Text>
      </View>
      <Ionicons
        name="chevron-forward"
        size={18}
        color={colors.textLight}
      />
    </TouchableOpacity>
  );
}

function ToggleRow({ icon, label, value, onToggle }) {
  return (
    <View style={styles.row}>
      <View style={styles.rowLeft}>
        <Ionicons name={icon} size={20} color={colors.textSecondary} />
        <Text style={styles.rowLabel}>{label}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{
          false: colors.bgGrey,
          true: colors.primaryLight
        }}
        thumbColor={value ? colors.primary : colors.textLight}
      />
    </View>
  );
}

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
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  content: {
    padding: 16,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 16,
    marginBottom: 6,
    marginLeft: 4,
  },
  card: {
    backgroundColor: colors.bgWhite,
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rowLabel: {
    fontSize: 15,
    color: colors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: 16,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 32,
    backgroundColor: colors.bgWhite,
    borderRadius: 14,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: colors.error,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.error,
    letterSpacing: 0.5,
  },
});