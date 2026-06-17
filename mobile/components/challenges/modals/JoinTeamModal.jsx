import {
  View,
  Text,
  Modal,
  TextInput,
  ScrollView,
  ActivityIndicator,
  StyleSheet
} from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import TeamCard from '../TeamCard';
import colors from '../../../constants/colors';
import SoundTouchableOpacity from '../../common/SoundTouchableOpacity';

export default function JoinTeamModal({
  visible,
  onClose,
  publicTeams,
  isLoading,
  onJoinPublic,
  onJoinByCode,
}) {
  const [joinTab, setJoinTab] = useState('public');
  const [teamCode, setTeamCode] = useState('');
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, 20);

  const handleJoinByCode = () => {
    if (!teamCode.trim()) return;
    onJoinByCode(teamCode.trim().toUpperCase());
    setTeamCode('');
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.modal, { paddingBottom: bottomPadding }]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Join Team</Text>
            <SoundTouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={22} color={colors.textPrimary} />
            </SoundTouchableOpacity>
          </View>

          {/* Tabs */}
          <View style={styles.tabs}>
            {['public', 'code'].map((t) => (
              <SoundTouchableOpacity
                key={t}
                style={[styles.tab, joinTab === t && styles.tabActive]}
                onPress={() => setJoinTab(t)}
              soundType="tab"
              >
                <Text style={[styles.tabText, joinTab === t && styles.tabTextActive]}>
                  {t === 'public' ? 'Public Team' : 'Enter Code'}
                </Text>
              </SoundTouchableOpacity>
            ))}
          </View>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
          >
            {joinTab === 'public' && (
              <View style={styles.section}>
                {isLoading ? (
                  <ActivityIndicator color={colors.primary} />
                ) : publicTeams.length === 0 ? (
                  <Text style={styles.empty}>No public teams yet. Create one!</Text>
                ) : (
                  publicTeams.map((team) => (
                    <TeamCard
                      key={team.id}
                      team={team}
                      showJoinBtn
                      onJoin={() => onJoinPublic(team.id)}
                    />
                  ))
                )}
              </View>
            )}

            {joinTab === 'code' && (
              <View style={styles.section}>
                <Text style={styles.codeLabel}>Enter 6-character code</Text>
                <TextInput
                  style={styles.codeInput}
                  value={teamCode}
                  onChangeText={setTeamCode}
                  placeholder="ABC123"
                  placeholderTextColor={colors.textLight}
                  autoCapitalize="characters"
                  maxLength={6}
                />
                <SoundTouchableOpacity
                  style={styles.joinBtn}
                  onPress={handleJoinByCode}
                >
                  <Text style={styles.joinBtnText}>Join Team</Text>
                </SoundTouchableOpacity>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: colors.bgWhite,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: { borderBottomColor: colors.primary },
  tabText: { fontSize: 14, color: colors.textSecondary },
  tabTextActive: { color: colors.primary, fontWeight: '700' },
  scroll: { maxHeight: 400 },
  scrollContent: { paddingBottom: 4 },
  section: { padding: 16, gap: 12 },
  empty: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingVertical: 20,
  },
  codeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  codeInput: {
    height: 52,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 22,
    letterSpacing: 6,
    textAlign: 'center',
    color: colors.textPrimary,
    backgroundColor: colors.bgLight,
    fontWeight: '700',
  },
  joinBtn: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  joinBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});
