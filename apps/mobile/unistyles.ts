import { StyleSheet } from 'react-native-unistyles';

const lightTheme = {
	colors: {
		background_primary: '#fff',
		background_secondary: '#f2f2f7',
		foreground_primary: '#000',
		foreground_secondary: 'rgba(0, 0, 0, 0.4)',
		foreground_disabled: '#999',
		border_primary: 'rgba(0, 0, 0, 0.2)',
		accent: '#007AFF'
	},
	gap: (v: number) => v * 4
};

const darkTheme = {
	colors: {
		background_primary: '#000',
		background_secondary: '#2c2c2e',
		foreground_primary: '#fff',
		foreground_secondary: 'rgba(255, 255, 255, 0.5)',
		foreground_disabled: '#666',
		border_primary: 'rgba(255, 255, 255, 0.2)',
		accent: '#0A84FF'
	},
	gap: (v: number) => v * 4
};

const appThemes = {
	light: lightTheme,
	dark: darkTheme
};

const breakpoints = {
	xs: 0,
	sm: 300,
	md: 500,
	lg: 800,
	xl: 1200
};

StyleSheet.configure({
	themes: appThemes,
	breakpoints,
	settings: { adaptiveThemes: true }
});

type AppThemes = typeof appThemes;
type AppBreakpoints = typeof breakpoints;

declare module 'react-native-unistyles' {
	export interface UnistylesThemes extends AppThemes {}
	export interface UnistylesBreakpoints extends AppBreakpoints {}
}
