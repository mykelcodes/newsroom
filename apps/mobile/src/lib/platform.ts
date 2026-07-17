import { Platform } from 'react-native';

const iOSMajorVersion = Platform.OS === 'ios' ? parseInt(Platform.Version, 10) : null;

export const isIOS = Platform.OS === 'ios';

export const isAndroid = Platform.OS === 'android';

export const isIOS26Above = iOSMajorVersion !== null && iOSMajorVersion >= 26;

export const isIOS26Below = iOSMajorVersion !== null && iOSMajorVersion < 26;
