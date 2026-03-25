import { View, Text, StyleSheet } from 'react-native';
import colors from '../../constants/colors';

export default function Badge({ text, bgColor, textColor, size = 'sm' }) {
  return (
    <View style={[
      styles.badge,
      { backgroundColor: bgColor || colors.primaryBg },
      size === 'lg' && styles.badgeLg
    ]}>
      <Text style={[
        styles.text,
        { color: textColor || colors.primary },
        size === 'lg' && styles.textLg
      ]}>
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeLg: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
  },
  text: {
    fontSize: 11,
    fontWeight: '600',
  },
  textLg: {
    fontSize: 13,
  },
});