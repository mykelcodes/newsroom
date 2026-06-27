import { Platform } from 'react-native';

export const isIOS26Above = Platform.OS === 'ios' && parseInt(Platform.Version, 10) >= 26;

export const isAndroid = Platform.OS === 'android';

export const isIOS = Platform.OS === 'ios';

export const isIOS26Below = Platform.OS === 'ios' && parseInt(Platform.Version, 10) < 26;
