import '../../unistyles';

import { isIOS, isIOS26Above, isIOS26Below } from '#/lib/platform';
import { ConvexProvider, ConvexReactClient } from 'convex/react';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { useUnistyles } from 'react-native-unistyles';

const convexUrl = process.env.EXPO_PUBLIC_CONVEX_URL;

if (!convexUrl) {
	throw new Error('Missing EXPO_PUBLIC_CONVEX_URL. Set it in apps/mobile/.env');
}

const convex = new ConvexReactClient(convexUrl, {
	unsavedChangesWarning: false
});

export default function RootLayout() {
	const { theme } = useUnistyles();
	const isDark = useColorScheme() === 'dark';

	return (
		<ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
			<ConvexProvider client={convex}>
				<StatusBar style={isDark ? 'light' : 'dark'} />
				<Stack
					screenOptions={{
						headerBackButtonDisplayMode: 'minimal',
						headerShadowVisible: false,
						headerTransparent: isIOS,
						headerBlurEffect: isIOS26Below ? 'light' : undefined,
						scrollEdgeEffects: isIOS26Above ? { top: 'automatic' } : undefined,
						headerTintColor: theme.colors.foreground_primary
					}}
				>
					<Stack.Screen name="index" options={{ headerTitle: '', headerShown: isIOS26Above }} />
					<Stack.Screen name="news/[category]" options={{ headerLargeTitleEnabled: true }} />
				</Stack>
			</ConvexProvider>
		</ThemeProvider>
	);
}
