import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, RefreshControl
} from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import progressService from '../../services/progressService';
import useAuthStore from '../../store/authStore';

import LoadingScreen from '../../components/common/LoadingScreen';
import ScreenHeader from '../../components/common/ScreenHeader';
import SectionHeader from '../../components/common/SectionHeader';
import ImpactCard from '../../components/progress/ImpactCard';
import CategoryBreakdown from '../../components/progress/CategoryBreakdown';
import ActivityChart from '../../components/progress/ActivityChart';
import ComparisonCard from '../../components/progress/ComparisonCard';
import TrendChart from '../../components/progress/TrendChart';
import MonthlyGoals from '../../components/progress/MonthlyGoals';
import colors from '../../constants/colors';

const PERIODS = [
  { key: 'today', label: 'Today' },
  { key: 'this_week', label: 'This Week' },
  { key: 'this_month', label: 'This Month' },
  { key: 'all_time', label: 'All Time' },
];

const ACTIVITY_CONFIG = {
  today: {
    title: 'Today Activity',
    subtitle: '00:00 - 23:59',
    summaryLabel: 'today',
  },
  this_week: {
    title: 'Weekly Activity',
    subtitle: 'Sun to Sat',
    summaryLabel: 'this week',
  },
  this_month: {
    title: 'Monthly Activity',
    subtitle: 'Week 1 to Week 4',
    summaryLabel: 'this month',
  },
  all_time: {
    title: 'All Time Activity',
    subtitle: 'Jan to Dec',
    summaryLabel: 'all time',
  },
};

export default function ProgressScreen() {
  const router = useRouter();
  const { user } = useAuthStore();

  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [period, setPeriod] = useState('this_week');
  const [progress, setProgress] = useState(null);
  const [comparison, setComparison] = useState(null);
  const [trend, setTrend] = useState(null);

  const loadData = async () => {
    try {
      const [progressData, comparisonData, trendData] = await Promise.all([
        progressService.getProgress(period),
        progressService.getComparison(),
        progressService.getTrend(),
      ]);

      setProgress(progressData.data);
      setComparison(comparisonData.data);
      setTrend(trendData.data);

    } catch (err) {
      console.error('Load progress error:', err);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    loadData();
  }, [period]);

  useFocusEffect(
  useCallback(() => {
    setIsLoading(true);
    loadData();
  }, [period]));

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [period]);

  if (isLoading) return <LoadingScreen />;

  const impact = progress?.environmental_impact;
  const activityConfig = ACTIVITY_CONFIG[period] || ACTIVITY_CONFIG.this_week;

  return (
    <View style={styles.container}>

      <ScreenHeader
        title="Progress"
        subtitle="Track your environmental impact"
      />

      {/* Period Selector */}
      <View style={styles.periodRow}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.periodScroll}
        >
          {PERIODS.map((p) => (
            <TouchableOpacity
              key={p.key}
              style={[
                styles.periodBtn,
                period === p.key && styles.periodBtnActive
              ]}
              onPress={() => setPeriod(p.key)}
            >
              <Text style={[
                styles.periodText,
                period === p.key && styles.periodTextActive
              ]}>
                {p.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
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

        {/* Environmental Impact */}
        <View style={styles.section}>
          <SectionHeader title="Environmental Impact" />
          <View style={styles.impactRow}>
            <ImpactCard
              icon="🌿"
              value={impact?.co2_saved}
              unit="Kg"
              label="CO₂ Saved"
              onPress={() => router.push({
                pathname: '/screens/eco-impact-detail',
                params: { type: 'co2', period }
              })}
            />
            <ImpactCard
              icon="💧"
              value={impact?.litre_saved}
              unit="L"
              label="Water Saved"
              onPress={() => router.push({
                pathname: '/screens/eco-impact-detail',
                params: { type: 'litre', period }
              })}
            />
            <ImpactCard
              icon="⚡"
              value={impact?.kwh_saved}
              unit="kWh"
              label="Energy Saved"
              onPress={() => router.push({
                pathname: '/screens/eco-impact-detail',
                params: { type: 'kwh', period }
              })}
            />
          </View>

          {/* XP + Actions summary */}
          <View style={styles.summaryRow}>
            <SummaryBox
              value={impact?.total_actions || 0}
              label="Total Actions"
            />
            <SummaryBox
              value={impact?.xp_earned || 0}
              label="XP Earned"
            />
          </View>
        </View>

        {/* Activity */}
        <View style={styles.section}>
          <View style={styles.activityHeader}>
            <View>
              <Text style={styles.activityTitle}>{activityConfig.title}</Text>
              <Text style={styles.activitySubtitle}>{activityConfig.subtitle}</Text>
            </View>
            <TouchableOpacity
              style={styles.historyBtn}
              onPress={() => router.push('/screens/log-history')}
            >
              <Ionicons name="time-outline" size={15} color={colors.primary} />
              <Text style={styles.historyBtnText}>History</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.card}>
            <ActivityChart
              data={progress?.activity || progress?.weekly_activity || []}
              period={period}
              summaryLabel={activityConfig.summaryLabel}
            />
          </View>
        </View>

        {/* Category Breakdown */}
        <View style={styles.section}>
          <SectionHeader title="Category Breakdown" />
          <View style={styles.card}>
            <CategoryBreakdown
              data={progress?.category_breakdown || []}
            />
          </View>
        </View>

        {/* Monthly Goals */}
        <View style={styles.section}>
          <SectionHeader title="Monthly Goals" />
          <View style={styles.card}>
            <MonthlyGoals goals={progress?.monthly_goals} />
          </View>
        </View>

        {/* Comparison */}
        <View style={styles.section}>
          <SectionHeader title="Comparison" />
          <ComparisonCard data={comparison} />
        </View>

        {/* 6 Month Trend */}
        <View style={styles.section}>
          <SectionHeader title="6-Month Trend" />
          <View style={styles.card}>
            <TrendChart
              data={trend?.trend || []}
              growthPercent={trend?.growth_percent || 0}
            />
          </View>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>

    </View>
  );
}

function SummaryBox({ value, label }) {
  return (
    <View style={styles.summaryBox}>
      <Text style={styles.summaryValue}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgLight,
  },
  periodRow: {
    backgroundColor: colors.bgWhite,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  periodScroll: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  periodBtn: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: colors.bgGrey,
  },
  periodBtnActive: {
    backgroundColor: colors.primaryBg,
  },
  periodText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  periodTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  section: {
    marginHorizontal: 16,
    marginTop: 16,
  },
  impactRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  summaryBox: {
    flex: 1,
    backgroundColor: colors.bgWhite,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  summaryLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  card: {
    backgroundColor: colors.bgWhite,
    borderRadius: 14,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  activitySubtitle: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  historyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  historyBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
});
