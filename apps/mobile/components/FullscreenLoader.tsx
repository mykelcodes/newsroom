import { ActivityIndicator, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

export function FullscreenLoader() {
	const { theme } = useUnistyles();
	return (
		<View style={styles.indicator}>
			<ActivityIndicator color={theme.colors.accent} size="large" />
		</View>
	);
}

const styles = StyleSheet.create(() => ({
	indicator: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center'
	}
}));
