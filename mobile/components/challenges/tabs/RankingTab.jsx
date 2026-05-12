import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import RankRow from '../cards/RankRow';
import colors from '../../../constants/colors';

export default function RankingTab({ ranking, isLoading, challenge }) {
  if (isLoading) {
    return (
      <ActivityIndicator
        color={colors.primary}
        style={{ marginTop: 20 }}
      />
    );
  }

  if (!ranking) {
    return <Text style={styles.empty}>No ranking data yet.</Text>;
  }

  const { type, top = [], your_rank, your_team_rank, your_team_id,
    total_participants, total_teams } = ranking;

  return (
    <View style={styles.container}>
      {/* Your rank banner */}
      {(your_rank || your_team_rank) && (
        <View style={styles.yourRankBanner}>
          <Text style={styles.yourRankLabel}>Your Rank</Text>
          <Text style={styles.yourRankValue}>
            #{your_rank || your_team_rank}
          </Text>
        </View>
      )}

      <Text style={styles.sectionTitle}>
        {type === 'solo'
          ? `Top ${top.length} Participants`
          : `Top ${top.length} Teams`
        }
      </Text>

      {top.length === 0 ? (
        <Text style={styles.empty}>No participants yet.</Text>
      ) : (
        top.map((item, i) => (
          <RankRow
            key={type === 'solo' ? item.user_id : item.team_id}
            item={item}
            index={i}
            type={type}
            isYou={
              type === 'solo'
                ? item.user_id === challenge?.current_user_id
                : item.team_id === your_team_id
            }
            targetType={challenge?.target_type}
            unit={challenge?.unit}
          />
        ))
      )}

      <Text style={styles.total}>
        {type === 'solo'
          ? `${total_participants} total participants`
          : `${total_teams} teams competing`
        }
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 8 },
  empty: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 4,
    marginBottom: 4,
  },
  yourRankBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.primaryBg,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.primaryLight,
  },
  yourRankLabel: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '600',
  },
  yourRankValue: {
    fontSize: 20,
    color: colors.primary,
    fontWeight: '800',
  },
  total: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
});