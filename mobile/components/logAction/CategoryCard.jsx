import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../constants/colors';

export default function CategoryCard({ category, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{getCategoryIcon(category.name)}</Text>
      </View>
      <Text style={styles.name} numberOfLines={2}>
        {category.name}
      </Text>
      <Text style={styles.count}>
        {category.action_count} Actions
      </Text>
    </TouchableOpacity>
  );
}

function getCategoryIcon(name) {
  const icons = {
    'Water Conservation': '💧',
    'Energy Conservation': '⚡',
    'Recycling & Waste': '♻️',
    'Sustainable Mobility': '🚌',
    'Sustainable Food': '🥗',
    'Environment': '🌿',
  };
  // Match by partial name
  for (const key of Object.keys(icons)) {
    if (name?.includes(key.split(' ')[0])) return icons[key];
  }
  return '🌍';
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bgWhite,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    width: '47%',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  icon: { fontSize: 26 },
  name: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 4,
  },
  count: {
    fontSize: 11,
    color: colors.textSecondary,
  },
});