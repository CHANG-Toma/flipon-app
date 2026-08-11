/**
 * Types minimaux CustomerInfo (évite d’importer react-native-purchases dans le bundle Expo Go).
 */
export type CustomerInfo = {
  entitlements: {
    active: Record<string, unknown>;
  };
};
