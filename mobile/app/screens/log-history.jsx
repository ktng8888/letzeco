import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, RefreshControl
} from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import actionService from '../../services/actionService';
import LoadingScreen from '../../components/common/LoadingScreen';
import EmptyState from '../../components/common/EmptyState';
import Badge from '../../components/common/Badge';
import colors from '../../constants/colors';

export default function LogHistoryScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [history, setHistory] = useState([]);
  const [totalActions, setTotalActions] = useState(0);
  const [totalXp, setTotalXp] = useState(0);

  const loadData = async () => {
    try {
      const data = await actionService.getHistory();
      setHistory(data.data.history || []);
      setTotalActions(data.data.total_actions || 0);

      // Calculate total XP from history
      const xp = data.data.history?.reduce(
        (sum, h) => sum + (parseInt(h.xp_gained) || 0), 0
      ) || 0;
      setTotalXp(xp);

    } catch (err) {
      console.error('Load history error:', err);
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

  if (isLoading) return <LoadingScreen />;

  // Group history by date
  const grouped = groupByDate(history);

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Log History</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <StatBox value={totalActions} label="Total Actions" />
        <View style={styles.statDivider} />
        <StatBox value={totalXp} label="Total XP" />
      </View>

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
        {history.length === 0 ? (
          <View style={{ padding: 20 }}>
            <EmptyState
              title="No actions logged yet"
              subtitle="Start logging eco-actions to see your history here!"
            />
          </View>
        ) : (
          <View style={styles.content}>
            {Object.entries(grouped).map(([date, actions]) => (
              <View key={date}>
                {/* Date Header */}
                <Text style={styles.dateHeader}>{date}</Text>

                {/* Actions for this date */}
                {actions.map((action) => (
                  <TouchableOpacity
                    key={action.id}
                    style={styles.historyCard}
                    onPress={() => router.push({
                      pathname: '/screens/log-history-detail',
                      params: { logId: action.id }
                    })}
                  >
                    <View style={styles.historyCardLeft}>
                      <Badge
                        text={action.category_name}
                        bgColor={action.tag_bg_colour_code}
                        textColor={action.tag_text_colour_code}
                      />
                      <Text style={styles.historyActionName}>
                        {action.action_name}
                      </Text>
                      <Text style={styles.historyMeta}>
                        Start at: {formatTime(action.start_time)} •{' '}
                        Duration: {getDuration(action.start_time, action.end_time)}
                      </Text>
                    </View>
                    <View style={styles.historyCardRight}>
                      <Text style={styles.historyXp}>
                        +{action.xp_gained} XP
                      </Text>
                      <Ionicons
                        name="chevron-forward"
                        size={16}
                        color={colors.textLight}
                      />
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            ))}
            <View style={{ height: 20 }} />
          </View>
        )}
      </ScrollView>

    </View>
  );
}

function StatBox({ value, label }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function groupByDate(history) {
  const groups = {};
  history.forEach((item) => {
    const date = formatDate(item.end_time);
    if (!groups[date]) groups[date] = [];
    groups[date].push(item);
  });
  return groups;
}

function formatDate(dateString) {
  const d = new Date(dateString);
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday',
    'Thursday', 'Friday', 'Saturday'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${days[d.getDay()]}, ${months[d.getMonth()]} ${d.getDate()}`;
}

function formatTime(dateString) {
  if (!dateString) return '';
  const d = new Date(dateString);
  const h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  return `${h % 12 || 12}:${m}${ampm}`;
}

function getDuration(start, end) {
  if (!start || !end) return '-';
  const diff = Math.floor(
    (new Date(end) - new Date(start)) / 1000
  );
  const h = Math.floor(diff / 3600);
  const m = Math.floor((diff % 3600) / 60);
  if (h > 0) return `${h} hr ${m} min`;
  return `${m} min`;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgLight },
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
  statsRow: {
    flexDirection: 'row',
    backgroundColor: colors.bgWhite,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.border,
  },
  content: { padding: 16 },
  dateHeader: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: 12,
    marginBottom: 8,
  },
  historyCard: {
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
  historyCardLeft: { flex: 1, gap: 4 },
  historyActionName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  historyMeta: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  historyCardRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  historyXp: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.xpColor,
  },
});