import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator,
  ScrollView, Image
} from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BASE_URL } from '../../constants/api';
import * as ImagePicker from 'expo-image-picker';

import profileService from '../../services/profileService';
import useAuthStore from '../../store/authStore';
import LoadingScreen from '../../components/common/LoadingScreen';
import colors from '../../constants/colors';

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, updateUser } = useAuthStore();

  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPic, setIsUploadingPic] = useState(false);

  const handleSave = async () => {
    if (!username.trim()) {
      Alert.alert('Error', 'Username cannot be empty.');
      return;
    }

    setIsSaving(true);
    try {
      // Update username if changed
      if (username !== user?.username) {
        const res = await profileService.updateUsername(username.trim());
        updateUser({ username: res.data.username });
      }

      // Update email if changed
      if (email !== user?.email) {
        const res = await profileService.updateEmail(email.trim());
        updateUser({ email: res.data.email });
      }

      Alert.alert('Success', 'Profile updated!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (err) {
      Alert.alert(
        'Error',
        err.response?.data?.message || 'Failed to update profile.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handlePickImage = async () => {
    const { status } = await ImagePicker
      .requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission needed',
        'Photo library permission is required.'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled) return;

    setIsUploadingPic(true);
    try {
      const imageUri = result.assets[0].uri;
      const res = await profileService.uploadProfilePicture(imageUri);
      updateUser({ profile_image: res.data.profile_image });
      Alert.alert('Success', 'Profile picture updated!');
    } catch (err) {
      Alert.alert('Error', 'Failed to upload image.');
    } finally {
      setIsUploadingPic(false);
    }
  };

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity onPress={handleSave} disabled={isSaving}>
          {isSaving ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Text style={styles.saveBtn}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>

        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarWrapper}>
            {user?.profile_image ? (
                <Image
                    source={{ uri: `${BASE_URL}/${user.profile_image}` }}
                    style={styles.avatar}
                />
            ) : (
                <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                    {user?.username?.charAt(0).toUpperCase()}
                </Text>
                </View>
            )}
            {isUploadingPic && (
              <View style={styles.uploadingOverlay}>
                <ActivityIndicator color={colors.textWhite} />
              </View>
            )}
          </View>
          <TouchableOpacity
            style={styles.changePhotoBtn}
            onPress={handlePickImage}
            disabled={isUploadingPic}
          >
            <Text style={styles.changePhotoText}>
              Change Photo
            </Text>
          </TouchableOpacity>

          {/* Level bar (display only) */}
          <Text style={styles.levelDisplay}>
            Lv. {user?.level} •{' '}
            {user?.level_xp} / {getXpToNext(user?.level)} XP
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Text style={styles.label}>Username</Text>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            placeholder="Enter username"
            placeholderTextColor={colors.textLight}
            autoCapitalize="none"
          />

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Enter email"
            placeholderTextColor={colors.textLight}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

      </ScrollView>
    </View>
  );
}

function getXpToNext(level) {
  const table = {
    1: 100, 2: 200, 3: 300, 4: 400, 5: 500,
    6: 600, 7: 700, 8: 800, 9: 900, 10: 1000,
  };
  return table[level] || 1000;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgWhite,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 56,
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  saveBtn: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.primary,
  },
  content: {
    padding: 20,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 28,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 10,
  },
  avatarPlaceholder: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.primary,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 3,
    borderColor: colors.primary,
},
  avatarText: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.primary,
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    borderRadius: 44,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  changePhotoBtn: {
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  changePhotoText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  levelDisplay: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 6,
  },
  form: { gap: 4 },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginTop: 16,
    marginBottom: 6,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 15,
    color: colors.textPrimary,
    backgroundColor: colors.bgLight,
  },
});