import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import colors from '../../constants/colors';

export default function SectionHeader({ title, linkText, onPress }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {linkText && onPress && (
        <TouchableOpacity onPress={onPress}>
          <Text style={styles.link}>{linkText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  link: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '500',
  },
});