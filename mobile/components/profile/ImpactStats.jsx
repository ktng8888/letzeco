import { View, Text, StyleSheet } from 'react-native';
import colors from '../../constants/colors';

export default function ImpactStats({ impact }) {
  const items = [
    {
      icon: '🌿',
      value: impact?.co2_saved || 0,
      unit: 'Kg',
      label: 'CO₂ Saved',
      equiv: `${Math.round((impact?.co2_saved || 0) / 1.0)} young trees`,
    },
    {
      icon: '💧',
      value: impact?.litre_saved || 0,
      unit: 'L',
      label: 'Water Saved',
      equiv: `${Math.round((impact?.litre_saved || 0) / 9.5)} showers`,
    },
    {
      icon: '⚡',
      value: impact?.kwh_saved || 0,
      unit: 'kWh',
      label: 'Energy Saved',
      equiv: `${Math.round((impact?.kwh_saved || 0) * 66.7)} phone charges`,
    },
  ];

  return (
    <View style={styles.container}>
      {/* Impact Row */}
      <View style={styles.impactRow}>
        {items.map((item, i) => (
          <View key={i} style={styles.impactCard}>
            <Text style={styles.icon}>{item.icon}</Text>
            <Text style={styles.value}>
              {formatImpactValue(item.value)}
            </Text>
            <Text style={styles.unit}>{item.unit}</Text>
            <Text style={styles.label}>{item.label}</Text>
          </View>
        ))}
      </View>

      {/* Eco Equivalents */}
      <View style={styles.equivSection}>
        <Text style={styles.equivTitle}>Your Eco Equivalents 🌍</Text>
        {items.map((item, i) => (
          <View key={i} style={styles.equivRow}>
            <Text style={styles.equivIcon}>{item.icon}</Text>
            <Text style={styles.equivText}>{item.equiv}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function formatImpactValue(value) {
  if (!value && value !== 0) return '0';
  const num = Number(value);
  if (Number.isNaN(num)) return '0';
  return num.toString();
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  impactRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  impactCard: {
    flex: 1,
    backgroundColor: colors.primaryBg,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    gap: 2,
  },
  icon: { fontSize: 22 },
  value: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
  },
  unit: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  label: {
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  equivSection: {
    backgroundColor: colors.bgGrey,
    borderRadius: 14,
    padding: 16,
    gap: 10,
  },
  equivTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  equivRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  equivIcon: { fontSize: 18 },
  equivText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
});