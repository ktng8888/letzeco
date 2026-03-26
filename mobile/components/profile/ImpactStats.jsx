import { View, Text, StyleSheet } from 'react-native';
import colors from '../../constants/colors';

export default function ImpactStats({ user }) {
  const items = [
    {
      icon: '🌿',
      value: user?.total_co2_saved || 0,
      unit: 'Kg',
      label: 'CO₂ Saved',
      equiv: `${Math.round((user?.total_co2_saved || 0) / 1.0)} young trees`,
    },
    {
      icon: '💧',
      value: user?.total_litre_saved || 0,
      unit: 'L',
      label: 'Water Saved',
      equiv: `${Math.round((user?.total_litre_saved || 0) / 9.5)} showers`,
    },
    {
      icon: '⚡',
      value: user?.total_kwh_saved || 0,
      unit: 'kWh',
      label: 'Energy Saved',
      equiv: `${Math.round((user?.total_kwh_saved || 0) * 66.7)} phone charges`,
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
              {parseFloat(item.value).toFixed(1)}
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