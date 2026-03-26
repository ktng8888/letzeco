import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator
} from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import progressService from '../../services/progressService';
import colors from '../../constants/colors';

export default function EcoImpactDetailScreen() {
  const router = useRouter();
  const { type, period } = useLocalSearchParams();
  // type: 'co2' | 'litre' | 'kwh'

  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      let result;
      if (type === 'co2') {
        result = await progressService.getCo2Breakdown(period);
      } else if (type === 'litre') {
        result = await progressService.getLitreBreakdown(period);
      } else {
        result = await progressService.getKwhBreakdown(period);
      }
      setData(result.data);
    } catch (err) {
      console.error('Load eco impact detail error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const config = getConfig(type);

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{config.title}</Text>
        <View style={{ width: 24 }} />
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : !data ? null : (
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Main Value */}
          <View style={styles.mainValueCard}>
            <Text style={styles.mainIcon}>{config.icon}</Text>
            <Text style={styles.mainValue}>
              {parseFloat(data[config.valueKey] || 0).toFixed(1)}
            </Text>
            <Text style={styles.mainUnit}>{config.unit}</Text>
            <Text style={styles.mainLabel}>Saved</Text>
          </View>

          {/* Eco Equivalents */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              What this means 🌍
            </Text>
            <View style={styles.equivalentsGrid}>
              {Object.entries(data.eco_equivalents || {}).map(
                ([key, value]) => (
                  <EquivalentCard
                    key={key}
                    label={formatEquivalentLabel(key)}
                    value={value}
                    icon={getEquivalentIcon(key)}
                  />
                )
              )}
            </View>
          </View>

          {/* Comparison with Others */}
          {data.comparison && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Compared to Others
              </Text>
              <View style={styles.comparisonCard}>
                <ComparisonBar
                  label="You"
                  value={data.comparison[`user_${type}`] || 0}
                  unit={config.unit}
                  isYou
                />
                <ComparisonBar
                  label="Average"
                  value={data.comparison[`average_${type}`] || 0}
                  unit={config.unit}
                />

                {/* Percent diff */}
                <View style={styles.diffRow}>
                  {(() => {
                    const diff = data.comparison.percent_diff || 0;
                    const isAbove = diff > 0;
                    return (
                      <>
                        <Ionicons
                          name={isAbove ? 'arrow-up' : 'arrow-down'}
                          size={16}
                          color={isAbove ? colors.success : colors.error}
                        />
                        <Text style={[
                          styles.diffText,
                          { color: isAbove ? colors.success : colors.error }
                        ]}>
                          {Math.abs(diff)}%{' '}
                          {isAbove ? 'above' : 'below'} average
                        </Text>
                      </>
                    );
                  })()}
                </View>
              </View>
            </View>
          )}

          <View style={{ height: 20 }} />
        </ScrollView>
      )}
    </View>
  );
}

function EquivalentCard({ label, value, icon }) {
  return (
    <View style={styles.equivCard}>
      <Text style={styles.equivIcon}>{icon}</Text>
      <Text style={styles.equivValue}>{value}</Text>
      <Text style={styles.equivLabel}>{label}</Text>
    </View>
  );
}

function ComparisonBar({ label, value, unit, isYou }) {
  return (
    <View style={styles.comparisonRow}>
      <Text style={[
        styles.comparisonLabel,
        isYou && styles.comparisonLabelYou
      ]}>
        {label}
      </Text>
      <Text style={[
        styles.comparisonValue,
        isYou && styles.comparisonValueYou
      ]}>
        {parseFloat(value).toFixed(1)} {unit}
      </Text>
    </View>
  );
}

function getConfig(type) {
  const configs = {
    co2: {
      title: 'CO₂ Saved',
      icon: '🌿',
      unit: 'kg',
      valueKey: 'co2_saved',
    },
    litre: {
      title: 'Water Saved',
      icon: '💧',
      unit: 'L',
      valueKey: 'litre_saved',
    },
    kwh: {
      title: 'Energy Saved',
      icon: '⚡',
      unit: 'kWh',
      valueKey: 'kwh_saved',
    },
  };
  return configs[type] || configs.co2;
}

function formatEquivalentLabel(key) {
  const labels = {
    young_trees: 'Young trees planted',
    car_km_avoided: 'Car km avoided',
    showers_worth: 'Showers worth',
    household_energy_days: 'Days of household energy',
    smartphone_charges: 'Smartphone charges',
    toilet_flushes: 'Toilet flushes',
    drinking_days: 'Drinking water days',
    washing_machine_loads: 'Washing machine loads',
    led_bulb_hours: 'LED bulb hours',
    laptop_hours: 'Laptop hours',
  };
  return labels[key] || key;
}

function getEquivalentIcon(key) {
  const icons = {
    young_trees: '🌱',
    car_km_avoided: '🚗',
    showers_worth: '🚿',
    household_energy_days: '🏠',
    smartphone_charges: '📱',
    toilet_flushes: '🚽',
    drinking_days: '🥤',
    washing_machine_loads: '👕',
    led_bulb_hours: '💡',
    laptop_hours: '💻',
  };
  return icons[key] || '✅';
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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { padding: 20 },
  mainValueCard: {
    alignItems: 'center',
    backgroundColor: colors.primaryBg,
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
  },
  mainIcon: { fontSize: 48, marginBottom: 8 },
  mainValue: {
    fontSize: 48,
    fontWeight: '700',
    color: colors.primary,
  },
  mainUnit: {
    fontSize: 18,
    color: colors.primary,
    fontWeight: '500',
  },
  mainLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  section: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  equivalentsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  equivCard: {
    backgroundColor: colors.bgGrey,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    width: '47%',
    gap: 4,
  },
  equivIcon: { fontSize: 24 },
  equivValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  equivLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  comparisonCard: {
    backgroundColor: colors.bgGrey,
    borderRadius: 14,
    padding: 16,
    gap: 10,
  },
  comparisonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  comparisonLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  comparisonLabelYou: {
    fontWeight: '700',
    color: colors.textPrimary,
  },
  comparisonValue: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  comparisonValueYou: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 16,
  },
  diffRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingTop: 4,
  },
  diffText: {
    fontSize: 14,
    fontWeight: '600',
  },
});