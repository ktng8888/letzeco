import { Modal, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import SoundTouchableOpacity from '../../common/SoundTouchableOpacity';
import colors from '../../../constants/colors';

export default function ChallengeRulesModal({ visible, type, onClose }) {
  const isTeam = type === 'team';
  const accentColor = isTeam ? colors.info : colors.primary;
  const accentBg = isTeam ? '#eff6ff' : colors.primaryBg;
  const title = isTeam ? 'Team Challenge Rules' : 'Solo Challenge Rules';
  const intro = isTeam
    ? 'Work with a team to reach the challenge goal and compete with other teams.'
    : 'Complete eligible actions yourself to reach the challenge goal and compete with other participants.';
  const rules = isTeam ? TEAM_RULES : SOLO_RULES;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.header}>
            <View style={[styles.iconCircle, { backgroundColor: accentBg }]}>
              <Ionicons
                name={isTeam ? 'people-outline' : 'person-outline'}
                size={24}
                color={accentColor}
              />
            </View>
            <SoundTouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </SoundTouchableOpacity>
          </View>

          <Text style={styles.title}>{title}</Text>
          <Text style={styles.intro}>{intro}</Text>

          <View style={styles.rules}>
            {rules.map((rule) => (
              <View key={rule.title} style={styles.ruleRow}>
                <View style={[styles.ruleIcon, { backgroundColor: rule.bg }]}>
                  <Ionicons name={rule.icon} size={18} color={rule.color} />
                </View>
                <View style={styles.ruleCopy}>
                  <Text style={styles.ruleTitle}>{rule.title}</Text>
                  <Text style={styles.ruleText}>{rule.text}</Text>
                </View>
              </View>
            ))}
          </View>

          <SoundTouchableOpacity
            style={[styles.doneBtn, { backgroundColor: accentColor }]}
            onPress={onClose}
          >
            <Text style={styles.doneText}>Got it</Text>
          </SoundTouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const SOLO_RULES = [
  {
    icon: 'checkmark-circle-outline',
    color: colors.primary,
    bg: colors.primaryBg,
    title: 'Reach the goal',
    text: 'Only eligible actions logged after you join count toward your progress.',
  },
  {
    icon: 'gift-outline',
    color: colors.warning,
    bg: '#fffbeb',
    title: 'Claim rewards',
    text: 'When you reach the goal, claim the completion reward from Gifts.',
  },
  {
    icon: 'trophy-outline',
    color: colors.xpColor,
    bg: colors.xpBg,
    title: 'Compete for ranking',
    text: 'Only participants who reach the goal are eligible for ranking rewards. Keep logging actions until the challenge ends.',
  },
];

const TEAM_RULES = [
  {
    icon: 'people-outline',
    color: colors.info,
    bg: '#eff6ff',
    title: 'Contribute together',
    text: 'Team progress is shared. Your actions add to the team total after you join.',
  },
  {
    icon: 'gift-outline',
    color: colors.warning,
    bg: '#fffbeb',
    title: 'Completion reward',
    text: 'Members who joined before the team goal was reached can claim the completion reward.',
  },
  {
    icon: 'trophy-outline',
    color: colors.xpColor,
    bg: colors.xpBg,
    title: 'Ranking reward',
    text: 'Only teams that reach the goal are eligible for ranking rewards. Keep contributing until the challenge ends.',
  },
  {
    icon: 'lock-closed-outline',
    color: colors.textSecondary,
    bg: colors.bgGrey,
    title: 'Team privacy',
    text: 'The team leader can switch the team between public and private.',
  },
];

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(17,24,39,0.58)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: colors.bgWhite,
    borderRadius: 22,
    padding: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 8,
  },
  header: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtn: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.bgGrey,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  intro: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 21,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  rules: {
    marginTop: 18,
    gap: 14,
  },
  ruleRow: {
    flexDirection: 'row',
    gap: 12,
  },
  ruleIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ruleCopy: {
    flex: 1,
    minWidth: 0,
  },
  ruleTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  ruleText: {
    marginTop: 3,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textSecondary,
  },
  doneBtn: {
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 22,
  },
  doneText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
  },
});
