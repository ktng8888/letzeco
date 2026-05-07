import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../constants/colors';

export default function ImpactStats({ impact }) {
  const items = [
    {
      icon: 'cloud-outline',
      equivIcon: 'leaf-outline',
      color: colors.primary,
      value: impact?.co2_saved || 0,
      unit: 'Kg',
      label: 'CO\u2082 Saved',
      equiv: `${Math.round((impact?.co2_saved || 0) / 1.0)} young trees`,
    },
    {
      icon: 'water-outline',
      equivIcon: 'water-outline',
      color: '#3b82f6',
      value: impact?.litre_saved || 0,
      unit: 'L',
      label: 'Water Saved',
      equiv: `${Math.round((impact?.litre_saved || 0) / 9.5)} showers`,
    },
    {
      icon: 'flash-outline',
      equivIcon: 'battery-charging-outline',
      color: '#f59e0b',
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
            <View style={[styles.impactIconWrap, { borderColor: item.color }]}>
              <Ionicons name={item.icon} size={28} color={item.color} />
            </View>
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
        <Text style={styles.equivTitle}>
          Your Eco Equivalents {'\uD83C\uDF0D'}
        </Text>
        {items.map((item, i) => (
          <View key={i} style={styles.equivRow}>
            <Ionicons name={item.equivIcon} size={18} color={item.color} />
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
    backgroundColor: colors.bgWhite,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    gap: 2,
  },
  impactIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  value: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  unit: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
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
  equivText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
});
