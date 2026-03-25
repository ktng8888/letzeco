import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet
} from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import actionService from '../../services/actionService';
import LoadingScreen from '../../components/common/LoadingScreen';
import Badge from '../../components/common/Badge';
import colors from '../../constants/colors';

export default function LogHistoryDetailScreen() {
  const router = useRouter();
  const { logId } = useLocalSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [log, setLog] = useState(null);

  useEffect(() => { loadLog(); }, []);

  const loadLog = async () => {
    try {
      const data = await actionService.getHistoryById(logId);
      setLog(data.data);
    } catch (err) {
      console.error('Load log detail error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <LoadingScreen />;
  if (!log) return null;

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Record</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Time Info */}
        <View style={styles.timeCard}>
          <Text style={styles.timeLabel}>
            Start: {formatDateTime(log.start_time)}
          </Text>
          <Text style={styles.timeLabel}>
            Completed: {formatDateTime(log.end_time)}{' '}
            ({getDuration(log.start_time, log.end_time)})
          </Text>
          <View style={styles.rewardRow}>
            <Text style={styles.rewardXp}>Rewards: {log.xp_gained} XP</Text>
          </View>
        </View>

        {/* Log Count Info */}
        <View style={styles.logCountRow}>
          <Text style={styles.logCountText}>
            The {ordinal(log.times_logged_this_action)} time I logged this action
          </Text>
          <Text style={styles.logCountText}>
            The {ordinal(log.total_actions_completed)} my logged action
          </Text>
        </View>

        {/* Category & Action */}
        <Badge
          text={log.category_name}
          bgColor={log.tag_bg_colour_code}
          textColor={log.tag_text_colour_code}
          size="lg"
        />
        <Text style={styles.actionName}>{log.action_name}</Text>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.bodyText}>{log.description}</Text>
        </View>

        {/* Why This Matters */}
        {log.importance && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Why This Matters</Text>
            <Text style={styles.bodyText}>{log.importance}</Text>
          </View>
        )}

        {/* Environmental Impact */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Environmental Impact</Text>
          <View style={styles.impactRow}>
            {log.co2_saved && (
              <ImpactBox value={log.co2_saved} unit="Kg CO₂" icon="🌿" />
            )}
            {log.litre_saved && (
              <ImpactBox value={log.litre_saved} unit="L Water" icon="💧" />
            )}
            {log.kwh_saved && (
              <ImpactBox value={log.kwh_saved} unit="kWh" icon="⚡" />
            )}
          </View>
        </View>

        {/* Calc Info */}
        {log.calc_info && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>How is this calculated?</Text>
            <Text style={styles.bodyText}>{log.calc_info}</Text>
          </View>
        )}

        {/* Source */}
        {log.source && (
          <Text style={styles.source}>Source: {log.source}</Text>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>

    </View>
  );
}

function ImpactBox({ value, unit, icon }) {
  return (
    <View style={styles.impactBox}>
      <Text style={styles.impactIcon}>{icon}</Text>
      <Text style={styles.impactValue}>{value}</Text>
      <Text style={styles.impactUnit}>{unit}</Text>
    </View>
  );
}

function formatDateTime(dateString) {
  if (!dateString) return '';
  const d = new Date(dateString);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()} • ${h % 12 || 12}:${m} ${ampm}`;
}

function getDuration(start, end) {
  if (!start || !end) return '-';
  const diff = Math.floor((new Date(end) - new Date(start)) / 1000);
  const h = Math.floor(diff / 3600);
  const m = Math.floor((diff % 3600) / 60);
  if (h > 0) return `${h} hr ${m} min`;
  return `${m} min`;
}

function ordinal(n) {
  if (!n) return '1st';
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgWhite },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 56,
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  content: { padding: 20 },
  timeCard: {
    backgroundColor: colors.bgGrey,
    borderRadius: 12,
    padding: 14,
    gap: 4,
    marginBottom: 14,
  },
  timeLabel: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  rewardRow: { marginTop: 4 },
  rewardXp: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.xpColor,
  },
  logCountRow: {
    gap: 4,
    marginBottom: 16,
  },
  logCountText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  actionName: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 10,
    marginBottom: 16,
  },
  section: { marginBottom: 20 },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  bodyText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  impactRow: {
    flexDirection: 'row',
    gap: 10,
  },
  impactBox: {
    flex: 1,
    backgroundColor: colors.primaryBg,
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
  },
  impactIcon: { fontSize: 22, marginBottom: 4 },
  impactValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  impactUnit: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  source: {
    fontSize: 11,
    color: colors.textLight,
  },
});