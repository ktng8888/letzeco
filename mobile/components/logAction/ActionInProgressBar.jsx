import {
  View, Text, TouchableOpacity, StyleSheet
} from 'react-native';
import { useRouter } from 'expo-router';
import { useCountdown, timeLimitToSeconds } from '../../hooks/useCountdown';
import colors from '../../constants/colors';

export default function ActionInProgressBar({ currentAction }) {
  const router = useRouter();
  const seconds = timeLimitToSeconds(currentAction?.time_limit);
  const { formatted, isExpired } = useCountdown(
    currentAction?.start_time,
    seconds
  );

  if (!currentAction) return null;

  return (
    <TouchableOpacity
      style={styles.bar}
      onPress={() => router.push({
        pathname: '/screens/action-in-progress',
        params: { userActionId: currentAction.id }
      })}
    >
      <View style={styles.left}>
        <Text style={styles.dot}>●</Text>
        <View>
          <Text style={styles.label}>Action in Progress</Text>
          <Text style={styles.name} numberOfLines={1}>
            {currentAction.action_name}
          </Text>
        </View>
      </View>
      <View style={styles.right}>
        <Text style={[
          styles.timer,
          isExpired && styles.timerExpired
        ]}>
          {isExpired ? 'Time Up!' : formatted}
        </Text>
        <Text style={styles.tapText}>Tap to view</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  dot: {
    color: colors.textWhite,
    fontSize: 10,
  },
  label: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
  },
  name: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textWhite,
  },
  right: { alignItems: 'flex-end' },
  timer: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textWhite,
  },
  timerExpired: {
    color: colors.xpColor,
  },
  tapText: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.7)',
  },
});