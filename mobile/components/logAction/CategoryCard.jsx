import { TouchableOpacity, Text, View, Image, StyleSheet } from 'react-native';
import colors from '../../constants/colors';
import { getImageUrl } from '../../utils/imageUrl';

export default function CategoryCard({ category, onPress }) {
  const imageUrl = getImageUrl(category.image);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.iconContainer}>
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={styles.image}
            resizeMode="contain"
          />
        ) : (
          <Text style={styles.fallbackIcon}>🌍</Text>
        )}
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
    overflow: 'hidden',
  },
  image: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  fallbackIcon: {
    fontSize: 26,
  },
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