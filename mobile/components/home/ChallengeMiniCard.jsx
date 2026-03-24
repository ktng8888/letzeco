import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import colors from '../../constants/colors';

export default function ChallengeMiniCard({ challenge, onPress }) {
  const isTeam = challenge.type === 'team';
  const daysLeft = getDaysLeft(challenge.end_date);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.left}>
        <View style={[
          styles.typeBadge,
          { backgroundColor: isTeam ? '#eff6ff' : colors.primaryBg }
        ]}>
          <Text style={[
            styles.typeText,
            { color: isTeam ? '#3b82f6' : colors.primary }
          ]}>
            {isTeam ? 'Tea' : 'Sol'}
          </Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>
            {challenge.challenge_name}
          </Text>
          <Text style={styles.date}>
            {daysLeft > 0 ? `${daysLeft} days left` : 'Ends today'}
          </Text>
        </View>
      </View>
      <View style={styles.right}>
        <Text style={styles.progress}>{challenge.progress_value}</Text>
        <Text style={styles.status}>Participating</Text>
      </View>
    </TouchableOpacity>
  );
}

function getDaysLeft(endDate) {
  if (!endDate) return 0;
  const diff = Math.ceil(
    (new Date(endDate) - new Date()) / (1000 * 60 * 60 * 24)
  );
  return Math.max(0, diff);
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bgWhite,
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  typeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  info: { flex: 1 },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  date: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  right: { alignItems: 'flex-end' },
  progress: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  status: {
    fontSize: 11,
    color: colors.textSecondary,
  },
});