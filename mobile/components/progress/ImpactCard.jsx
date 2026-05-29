import {
  View,
  Text,
  StyleSheet
} from 'react-native';
import { Ionicons } from '@expo/vector-icons'; 
import colors from '../../constants/colors';
import SoundTouchableOpacity from '../common/SoundTouchableOpacity';

export default function ImpactCard({ icon, value, unit, label, onPress }) { 
  const getIcon = () => {
    if (icon === 'co2') return (
      <Ionicons name="cloud-outline" size={28} color={colors.primary} />
    );
    if (icon === 'water') return (
      <Ionicons name="water-outline" size={28} color="#3b82f6" />
    );
    if (icon === 'flash') return (
      <Ionicons name="flash-outline" size={28} color="#f59e0b" />
    );
  };

  const getColor = () => {
    if (icon === 'co2') return colors.primary;
    if (icon === 'water') return '#3b82f6';
    if (icon === 'flash') return '#f59e0b';
    return colors.primary;
  };

  const color = getColor();

return (
  <SoundTouchableOpacity
    style={styles.impactCard}
    onPress={onPress}
  >
    <View style={[styles.impactIconWrap, { borderColor: color }]}>
      {getIcon()}
    </View>
    <Text style={styles.value}>{formatValue(value)}</Text>
    <Text style={styles.impactUnit}>{unit}</Text>
    <Text style={styles.impactLabel}>{label}</Text>
    <Text style={styles.tapHint}>Tap for details</Text>
  </SoundTouchableOpacity>
);
}

function formatValue(val) {
  if (!val && val !== 0) return '-';
  const num = Number(val);
  if (Number.isNaN(num)) return '-';
  return num.toString();
}

const styles = StyleSheet.create({
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
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  impactUnit: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  impactLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
    textAlign: 'center',
  },
  tapHint: {
    fontSize: 10,
    color: colors.primary,
    marginTop: 4,
  },
});