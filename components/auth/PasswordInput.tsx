import { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { FlipOn } from '@/constants/flipon';

type Props = Omit<TextInputProps, 'secureTextEntry'> & {
  /** Affiche le champ masqué par défaut. */
  defaultHidden?: boolean;
};

/** Champ mot de passe avec œil afficher / masquer. */
export function PasswordInput({
  defaultHidden = true,
  style,
  editable = true,
  ...rest
}: Props) {
  const [hidden, setHidden] = useState(defaultHidden);

  return (
    <View style={styles.wrap}>
      <TextInput
        {...rest}
        editable={editable}
        secureTextEntry={hidden}
        style={[styles.input, style]}
        placeholderTextColor={rest.placeholderTextColor ?? FlipOn.muted}
      />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={hidden ? 'Afficher le mot de passe' : 'Masquer le mot de passe'}
        onPress={() => setHidden((v) => !v)}
        disabled={editable === false}
        hitSlop={8}
        style={styles.eye}>
        <MaterialIcons
          name={hidden ? 'visibility' : 'visibility-off'}
          size={22}
          color={FlipOn.muted}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'relative',
    justifyContent: 'center',
  },
  input: {
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: FlipOn.line,
    paddingHorizontal: 14,
    paddingRight: 48,
    fontSize: 15,
    color: FlipOn.ink,
    backgroundColor: FlipOn.surface,
  },
  eye: {
    position: 'absolute',
    right: 10,
    height: 48,
    width: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
