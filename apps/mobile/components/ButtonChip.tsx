import { Pressable, Text } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

type ButtonChipProps = {
	label: string;
	onPress?: () => void;
};

export function ButtonChip({ label, onPress }: ButtonChipProps) {
	return (
		<Pressable onPress={onPress} style={({ pressed }) => styles.container(pressed)}>
			<Text style={styles.text}>{label}</Text>
		</Pressable>
	);
}

const styles = StyleSheet.create((t) => ({
	container: (pressed: boolean) => ({
		paddingHorizontal: t.gap(3),
		backgroundColor: t.colors.background_secondary,
		opacity: pressed ? 0.5 : 1,
		paddingVertical: t.gap(2),
		borderRadius: 999
	}),
	text: {
		fontSize: 16,
		fontWeight: '600',
		color: t.colors.foreground_primary
	}
}));
