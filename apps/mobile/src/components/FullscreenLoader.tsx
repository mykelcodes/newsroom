import { ActivityIndicator, View } from 'react-native';

export function FullscreenLoader() {
	return (
		<View className="flex-1 items-center justify-center">
			<ActivityIndicator colorClassName="accent-accent" size="large" />
		</View>
	);
}
