import dayjs from 'dayjs';
import { Image, Text, TouchableNativeFeedback, View } from 'react-native';
import { CategoryText, HeadlineContent } from './NewsCard.components';
import type { NewsCardProps } from './NewsCard.types';

export function NewsCard(props: NewsCardProps) {
	return (
		<View className="-mx-4">
			<TouchableNativeFeedback onPress={props.onPress}>
				<View className="px-4 pt-4">
					<View className="flex-row items-start gap-2">
						<View className="flex-1">
							{!!props.sourceName && (
								<Text className="text-foreground-primary font-sans text-sm uppercase">
									{props.sourceName}
								</Text>
							)}
							<Text
								numberOfLines={4}
								className="text-foreground-primary text-lg font-semibold tracking-[-0.2]"
							>
								{props.title}
							</Text>
						</View>

						{!!props.image && (
							<Image
								source={{ uri: props.image }}
								resizeMode="cover"
								className="h-26 w-26 rounded-lg"
							/>
						)}
					</View>
					<View className="mt-8 flex-row items-center justify-between pb-4">
						<Text className="text-foreground-secondary text-xs">
							{dayjs(props.publishedAt).format('MMM D, YYYY h:mm A')}
						</Text>
						{!props.hideCategory && <CategoryText category={props.category} />}
					</View>
					<View className="bg-border-primary h-px w-full" />
				</View>
			</TouchableNativeFeedback>
		</View>
	);
}

function Headline(props: NewsCardProps) {
	return (
		<View className="-mx-4">
			<TouchableNativeFeedback onPress={props.onPress}>
				<View className="px-4 pt-4">
					{!!props.image && (
						<Image
							source={{ uri: props.image }}
							resizeMode="cover"
							className="h-62.5 w-full rounded-xl"
						/>
					)}

					<View className="py-4">
						<HeadlineContent
							title={props.title}
							category={props.category}
							publishedAt={props.publishedAt}
							sourceName={props.sourceName}
						/>
					</View>

					<View className="bg-border-primary h-px w-full" />
				</View>
			</TouchableNativeFeedback>
		</View>
	);
}

NewsCard.Headline = Headline;
