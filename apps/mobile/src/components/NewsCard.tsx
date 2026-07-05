import { Doc } from '@newsroom/backend/dataModel';
import dayjs from 'dayjs';
import { ReactNode } from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';

type NewsCardProps = Doc<'headlines'> & { onPress?: () => void; hideCategory?: boolean };

export function NewsCard({
	title,
	sourceName,
	onPress,
	image,
	publishedAt,
	category,
	hideCategory = false
}: NewsCardProps) {
	return (
		<Pressable onPress={onPress}>
			{({ pressed }) => (
				<NewsCardContainer pressed={pressed}>
					<View className="p-4">
						<View className="flex-row items-start gap-2">
							<View className="flex-1">
								{!!sourceName && (
									<Text className="text-foreground-primary font-sans text-sm uppercase">
										{sourceName}
									</Text>
								)}
								<Text
									numberOfLines={4}
									className="text-foreground-primary text-lg font-semibold tracking-[-0.2]"
								>
									{title}
								</Text>
							</View>

							{!!image && (
								<Image
									source={{ uri: image }}
									resizeMode="cover"
									className="h-30 w-30 rounded-lg"
								/>
							)}
						</View>
						<View className="mt-8 flex-row items-center justify-between">
							<Text className="text-foreground-secondary text-xs">
								{dayjs(publishedAt).format('MMM D, YYYY h:mm A')}
							</Text>
							{!hideCategory && <CategoryText category={category} />}
						</View>
					</View>
				</NewsCardContainer>
			)}
		</Pressable>
	);
}

function Headline(props: NewsCardProps) {
	return (
		<Pressable onPress={props.onPress}>
			{({ pressed }) => (
				<NewsCardContainer pressed={pressed}>
					{!!props.image && (
						<Image source={{ uri: props.image }} resizeMode="cover" className="h-62.5 w-full" />
					)}
					<View className="p-4">
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
					</View>
				</NewsCardContainer>
			)}
		</Pressable>
	);
}

function NewsCardContainer({ children, pressed }: { children: ReactNode; pressed: boolean }) {
	const styles = useAnimatedStyle(() => ({
		transform: [{ scale: withTiming(pressed ? 1.05 : 1, { duration: 300 }) }]
	}));

	return (
		<Animated.View className="bg-background-primary overflow-hidden rounded-2xl" style={styles}>
			{children}
		</Animated.View>
	);
}

function CategoryText({ category }: { category: string }) {
	return <Text className="text-accent text-xs font-semibold uppercase">{category}</Text>;
}

NewsCard.Headline = Headline;
