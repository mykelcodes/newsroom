import dayjs from 'dayjs';
import { Text, View } from 'react-native';

export function Header() {
	return (
		<View className="mb-4.5 px-4 pb-2.5">
			<Text className="text-foreground-disabled text-[13px] leading-4.5 font-semibold uppercase">
				{dayjs().format('dddd, MMMM D')}
			</Text>
			<Text className="text-foreground-primary text-[34px] leading-10.25 font-bold uppercase">
				Newsroom
			</Text>
		</View>
	);
}
