import { TouchableOpacity } from 'react-native';
import { playClickSound } from '../../services/audioService';

export default function SoundTouchableOpacity({
  onPress,
  sound = true,
  soundType = 'ui',
  disabled,
  children,
  ...props
}) {
  const handlePress = (event) => {
    if (sound && !disabled) {
      playClickSound(soundType);
    }
    onPress?.(event);
  };

  return (
    <TouchableOpacity
      {...props}
      disabled={disabled}
      onPress={handlePress}
    >
      {children}
    </TouchableOpacity>
  );
}
