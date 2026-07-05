import { Pressable, Text } from 'react-native';

type ButtonChipProps = {
	label: string;
	onPress?: () => void;
};

export function ButtonChip({ label, onPress }: ButtonChipProps) {
	return (
		<Pressable
			className="bg-background-primary rounded-full px-3 py-2 active:opacity-50"
			onPress={onPress}
		>
			<Text className="text-foreground-primary text-base font-semibold">{label}</Text>
		</Pressable>
	);
}
