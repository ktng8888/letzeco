import {
  View,
  Text,
  Modal,
  TextInput,
  StyleSheet
} from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '../../../constants/colors';
import SoundTouchableOpacity from '../../common/SoundTouchableOpacity';

export default function CreateTeamModal({ visible, onClose, onSubmit }) {
  const [teamName, setTeamName]     = useState('');
  const [isPrivate, setIsPrivate]   = useState(false);
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, 20);

  const handleSubmit = () => {
    if (!teamName.trim()) return;
    onSubmit(teamName.trim(), isPrivate);
    setTeamName('');
    setIsPrivate(false);
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
            <Text style={styles.title}>Create Team</Text>
            <SoundTouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={22} color={colors.textPrimary} />
            </SoundTouchableOpacity>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>Team Name</Text>
            <TextInput
              style={styles.input}
              value={teamName}
              onChangeText={setTeamName}
              placeholder="The Green Squad"
              placeholderTextColor={colors.textLight}
            />

            {/* Private toggle */}
            <SoundTouchableOpacity
              style={styles.toggle}
              onPress={() => setIsPrivate(!isPrivate)}
            >
              <View style={[styles.checkbox, isPrivate && styles.checkboxChecked]}>
                {isPrivate && (
                  <Ionicons name="checkmark" size={14} color="#fff" />
                )}
              </View>
              <View>
                <Text style={styles.toggleLabel}>Private Team</Text>
                <Text style={styles.toggleHint}>Only people with code can join</Text>
              </View>
            </SoundTouchableOpacity>

            <SoundTouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
              <Text style={styles.submitText}>Create Team & Participate</Text>
            </SoundTouchableOpacity>
          </View>
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
  form: { padding: 16, gap: 12 },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 15,
    color: colors.textPrimary,
    backgroundColor: colors.bgLight,
  },
  toggle: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 4,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  toggleLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  toggleHint: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  submitBtn: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  submitText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});
