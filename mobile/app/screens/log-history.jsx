import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, RefreshControl, Modal, Platform
} from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

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
  const [filtered, setFiltered] = useState([]);
  const [totalActions, setTotalActions] = useState(0);
  const [totalXp, setTotalXp] = useState(0);

  // Date filter state
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);
  const [filterActive, setFilterActive] = useState(false);

  const loadData = async () => {
    try {
      const data = await actionService.getHistory();
      const hist = data.data.history || [];
      setHistory(hist);
      setFiltered(hist);
      setTotalActions(data.data.total_actions || 0);
      const xp = hist.reduce((sum, h) => sum + (parseInt(h.xp_gained) || 0), 0);
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

  const applyFilter = () => {
    if (!fromDate && !toDate) {
      setFiltered(history);
      setFilterActive(false);
      return;
    }
    const result = history.filter(item => {
      const itemDate = new Date(item.end_time);
      itemDate.setHours(0, 0, 0, 0);
      if (fromDate && toDate) {
        const from = new Date(fromDate); from.setHours(0, 0, 0, 0);
        const to = new Date(toDate); to.setHours(23, 59, 59, 999);
        return itemDate >= from && itemDate <= to;
      }
      if (fromDate) {
        const from = new Date(fromDate); from.setHours(0, 0, 0, 0);
        return itemDate >= from;
      }
      if (toDate) {
        const to = new Date(toDate); to.setHours(23, 59, 59, 999);
        return itemDate <= to;
      }
      return true;
    });
    setFiltered(result);
    setFilterActive(true);
  };

  const clearFilter = () => {
    setFromDate(null);
    setToDate(null);
    setFiltered(history);
    setFilterActive(false);
  };

  if (isLoading) return <LoadingScreen />;

  const grouped = groupByDate(filtered);

  // Stats for filtered data
  const filteredXp = filtered.reduce((sum, h) => sum + (parseInt(h.xp_gained) || 0), 0);

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
        <StatBox
          value={filterActive ? filtered.length : totalActions}
          label={filterActive ? 'Filtered Actions' : 'Total Actions'}
        />
        <View style={styles.statDivider} />
        <StatBox
          value={filterActive ? filteredXp : totalXp}
          label={filterActive ? 'Filtered XP' : 'Total XP'}
        />
      </View>

      {/* ── DATE FILTER ── */}
      <View style={styles.filterSection}>
        <Text style={styles.filterLabel}>Filter by Date</Text>
        <View style={styles.filterRow}>

          {/* From Date */}
          <TouchableOpacity
            style={styles.dateBtn}
            onPress={() => setShowFromPicker(true)}
          >
            <Ionicons name="calendar-outline" size={14} color={colors.primary} />
            <Text style={styles.dateBtnText}>
              {fromDate ? formatShortDate(fromDate) : 'From'}
            </Text>
          </TouchableOpacity>

          <Text style={styles.filterArrow}>→</Text>

          {/* To Date */}
          <TouchableOpacity
            style={styles.dateBtn}
            onPress={() => setShowToPicker(true)}
          >
            <Ionicons name="calendar-outline" size={14} color={colors.primary} />
            <Text style={styles.dateBtnText}>
              {toDate ? formatShortDate(toDate) : 'To'}
            </Text>
          </TouchableOpacity>

          {/* Apply */}
          <TouchableOpacity style={styles.applyBtn} onPress={applyFilter}>
            <Text style={styles.applyBtnText}>Apply</Text>
          </TouchableOpacity>

          {/* Clear */}
          {filterActive && (
            <TouchableOpacity style={styles.clearBtn} onPress={clearFilter}>
              <Ionicons name="close" size={16} color={colors.error} />
            </TouchableOpacity>
          )}
        </View>

        {filterActive && (
          <Text style={styles.filterInfo}>
            Showing results from{' '}
            {fromDate ? formatShortDate(fromDate) : 'earliest'}{' '}
            to {toDate ? formatShortDate(toDate) : 'latest'}
          </Text>
        )}
      </View>

      {/* Date pickers */}
      {showFromPicker && (
        <DateTimePicker
          value={fromDate || new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          maximumDate={toDate || new Date()}
          onChange={(e, date) => {
            setShowFromPicker(false);
            if (date) setFromDate(date);
          }}
        />
      )}
      {showToPicker && (
        <DateTimePicker
          value={toDate || new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          minimumDate={fromDate || undefined}
          maximumDate={new Date()}
          onChange={(e, date) => {
            setShowToPicker(false);
            if (date) setToDate(date);
          }}
        />
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
        {filtered.length === 0 ? (
          <View style={{ padding: 20 }}>
            <EmptyState
              title={filterActive ? 'No actions in this range' : 'No actions logged yet'}
              subtitle={filterActive
                ? 'Try adjusting your date filter'
                : 'Start logging eco-actions to see your history here!'
              }
            />
            {filterActive && (
              <TouchableOpacity style={styles.clearFilterBtn} onPress={clearFilter}>
                <Ionicons name="close-circle-outline" size={16} color={colors.error} />
                <Text style={styles.clearFilterBtnText}>Clear Filter</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.content}>
            {Object.entries(grouped).map(([date, actions]) => (
              <View key={date}>
                <Text style={styles.dateHeader}>{date}</Text>
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
                        Start: {formatTime(action.start_time)} •{' '}
                        {getDuration(action.start_time, action.end_time)}
                      </Text>
                    </View>
                    <View style={styles.historyCardRight}>
                      <Text style={styles.historyXp}>+{action.xp_gained} XP</Text>
                      <Ionicons name="chevron-forward" size={16} color={colors.textLight} />
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
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${days[d.getDay()]}, ${months[d.getMonth()]} ${d.getDate()}`;
}

function formatShortDate(date) {
  const d = new Date(date);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

function formatTime(dateString) {
  if (!dateString) return '';
  const d = new Date(dateString);
  const h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  return `${h % 12 || 12}:${m} ${ampm}`;
}

function getDuration(start, end) {
  if (!start || !end) return '-';
  const diff = Math.floor((new Date(end) - new Date(start)) / 1000);
  const h = Math.floor(diff / 3600);
  const m = Math.floor((diff % 3600) / 60);
  if (h > 0) return `${h}hr ${m}min`;
  return `${m} min`;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgLight },
  header: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 56, paddingBottom: 12, paddingHorizontal: 16,
    backgroundColor: colors.bgWhite,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  headerTitle: { fontSize: 17, fontWeight: '700', color: colors.textPrimary },

  statsRow: {
    flexDirection: 'row', backgroundColor: colors.bgWhite,
    marginHorizontal: 16, marginTop: 12,
    borderRadius: 14, overflow: 'hidden',
    borderWidth: 1, borderColor: colors.border,
  },
  statBox: { flex: 1, alignItems: 'center', paddingVertical: 14 },
  statDivider: { width: 1, backgroundColor: colors.border },
  statValue: { fontSize: 22, fontWeight: '700', color: colors.primary },
  statLabel: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },

  // Filter
  filterSection: {
    backgroundColor: colors.bgWhite,
    marginHorizontal: 16, marginTop: 10,
    borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: colors.border,
  },
  filterLabel: {
    fontSize: 13, fontWeight: '600', color: colors.textPrimary, marginBottom: 10,
  },
  filterRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap',
  },
  dateBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    borderWidth: 1.5, borderColor: colors.primary,
    borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8,
    flex: 1,
  },
  dateBtnText: { fontSize: 13, color: colors.primary, fontWeight: '500' },
  filterArrow: { fontSize: 16, color: colors.textSecondary },
  applyBtn: {
    backgroundColor: colors.primary, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 8,
  },
  applyBtnText: { fontSize: 13, fontWeight: '700', color: '#fff' },
  clearBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#fee2e2',
    alignItems: 'center', justifyContent: 'center',
  },
  filterInfo: {
    fontSize: 11, color: colors.textSecondary,
    marginTop: 8, fontStyle: 'italic',
  },

  clearFilterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#fee2e2',
    borderRadius: 12,
    paddingVertical: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#fca5a5',
  },
  clearFilterBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.error,
  },
  content: { padding: 16 },
  dateHeader: {
    fontSize: 15, fontWeight: '700',
    color: colors.textPrimary, marginBottom: 8, marginTop: 8,
  },
  historyCard: {
    backgroundColor: colors.bgWhite,
    borderRadius: 14, padding: 14,
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 3, elevation: 1,
  },
  historyCardLeft: { flex: 1, gap: 4 },
  historyActionName: {
    fontSize: 14, fontWeight: '600', color: colors.textPrimary,
  },
  historyMeta: { fontSize: 12, color: colors.textSecondary },
  historyCardRight: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
  },
  historyXp: { fontSize: 14, fontWeight: '700', color: colors.xpColor },
});