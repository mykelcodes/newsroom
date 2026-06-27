import '../unistyles';

import { ConvexProvider, ConvexReactClient } from 'convex/react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { isIOS, isIOS26Above, isIOS26Below } from '../lib/platform';

const convexUrl = process.env.EXPO_PUBLIC_CONVEX_URL;

if (!convexUrl) {
	throw new Error('Missing EXPO_PUBLIC_CONVEX_URL. Set it in apps/mobile/.env');
}

const convex = new ConvexReactClient(convexUrl, {
	unsavedChangesWarning: false
});

export default function RootLayout() {
	return (
		<ConvexProvider client={convex}>
			<StatusBar style="dark" />
			<Stack
				screenOptions={{
					headerBackButtonDisplayMode: 'minimal',
					headerShadowVisible: false,
					headerTransparent: isIOS,
					headerBlurEffect: isIOS26Below ? 'light' : undefined,
					scrollEdgeEffects: isIOS26Above ? { top: 'automatic' } : undefined
				}}
			>
				<Stack.Screen name="index" options={{ headerTitle: '', headerShown: isIOS26Above }} />
			</Stack>
		</ConvexProvider>
	);
}
