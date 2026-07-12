import dayjs from 'dayjs';
import { Text, View } from 'react-native';

export function CategoryText({ category }: { category: string }) {
	return <Text className="text-accent text-xs font-semibold uppercase">{category}</Text>;
}

type HeadlineContentProps = {
	sourceName?: string;
	title: string;
	publishedAt: string;
	category: string;
};
export function HeadlineContent(props: HeadlineContentProps) {
	return (
		<>
			{!!props.sourceName && (
				<Text className="text-foreground-primary font-sans text-sm uppercase">
					{props.sourceName}
				</Text>
			)}
			<Text
				className="text-foreground-primary text-xl leading-7 font-bold tracking-[-0.2]"
				numberOfLines={3}
			>
				{props.title}
			</Text>
			<View className="mt-8 flex-row items-center justify-between">
				<Text className="text-foreground-secondary text-xs">
					{dayjs(props.publishedAt).format('MMM D, YYYY h:mm A')}
				</Text>
				<CategoryText category={props.category} />
			</View>
		</>
	);
}
