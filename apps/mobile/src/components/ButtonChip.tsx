import { Platform, Pressable, Text, TouchableNativeFeedback, View } from 'react-native';

type ButtonChipProps = {
	label: string;
	onPress?: () => void;
};

export function ButtonChip({ label, onPress }: ButtonChipProps) {
	if (Platform.OS === 'android') {
		return (
			<View className="border-border-primary rounded-lg border bg-transparent">
				<TouchableNativeFeedback onPress={onPress}>
					<View className="px-4 py-1.5">
						<Text className="text-foreground-primary text-base font-semibold">{label}</Text>
					</View>
				</TouchableNativeFeedback>
			</View>
		);
	}

	return (
		<Pressable
			className="bg-background-primary rounded-full px-3 py-2 active:opacity-50"
			onPress={onPress}
		>
			<Text className="text-foreground-primary text-base font-semibold">{label}</Text>
		</Pressable>
	);
}
