import { Stack } from 'expo-router';
import { ConvexProvider, ConvexReactClient } from 'convex/react';
import { StatusBar } from 'expo-status-bar';

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
			<Stack screenOptions={{ headerShown: false }} />
		</ConvexProvider>
	);
}
