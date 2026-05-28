import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

const useAudioStore = create(
  persist(
    (set) => ({
      bgmEnabled: true,
      sfxEnabled: true,
      bgmVolume: 0.16,
      sfxVolume: 0.45,

      setBgmEnabled: (enabled) => set({ bgmEnabled: enabled }),
      setSfxEnabled: (enabled) => set({ sfxEnabled: enabled }),
      setBgmVolume: (volume) => set({ bgmVolume: volume }),
      setSfxVolume: (volume) => set({ sfxVolume: volume }),
    }),
    {
      name: 'letzeco-audio-settings',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default useAudioStore;
