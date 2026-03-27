import {
  View, Text, TouchableOpacity, StyleSheet
} from 'react-native';
import { useRouter } from 'expo-router';
import Badge from '../common/Badge';
import colors from '../../constants/colors';

export default function EligibleActionsList({ actions }) {
  const router = useRouter();

  if (!actions || actions.length === 0) {
    return (
      <Text style={styles.empty}>No eligible actions defined</Text>
    );
  }

  return (
    <View style={styles.container}>
      {actions.map((action) => (
        <TouchableOpacity
          key={action.id}
          style={styles.actionRow}
          onPress={() => router.push({
            pathname: '/screens/action-detail',
            params: { actionId: action.action_id }
          })}
        >
          <View style={styles.actionLeft}>
            <Badge
              text={action.category_name}
              size="sm"
            />
            <Text style={styles.actionName}>
              {action.action_name}
            </Text>
          </View>
          <Text style={styles.actionXp}>10 XP+</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 8 },
  empty: {
    fontSize: 13,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.bgGrey,
    borderRadius: 10,
    padding: 12,
  },
  actionLeft: { gap: 4, flex: 1 },
  actionName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  actionXp: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.xpColor,
  },
});