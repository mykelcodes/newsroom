import { ButtonChip } from '#/components/ButtonChip';
import { FullscreenLoader } from '#/components/FullscreenLoader';
import { Header } from '#/components/Header';
import { NewsCard } from '#/components/NewsCard';
import { openLink } from '#/lib/open-link';
import { api } from '@newsroom/backend/api';
import { Doc } from '@newsroom/backend/dataModel';
import { usePaginatedQuery, useQuery } from 'convex/react';
import { FunctionReturnType } from 'convex/server';
import { router } from 'expo-router';
import { ActivityIndicator, FlatList, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HomeScreen() {
	const news = usePaginatedQuery(api.headlines.getAll, {}, { initialNumItems: 20 });
	const categories = useQuery(api.categories.getAll);
	const headline = news.results[0];
	const results = news.results.slice(1);
	const { bottom: paddingBottom, top } = useSafeAreaInsets();

	if (news.status === 'LoadingFirstPage') {
		return <FullscreenLoader />;
	}

	return (
		<FlatList
			data={results}
			renderItem={({ item }) => (
				<View className="android:mb-0 mb-4 px-4">
					<NewsCard {...item} onPress={() => openLink(item.url)} />
				</View>
			)}
			keyExtractor={(item) => item._id}
			contentContainerStyle={{ paddingBottom, paddingTop: top + SCREEN_TOP_PADDING }}
			contentContainerClassName="android:bg-background-primary"
			onEndReachedThreshold={0.7}
			onEndReached={news.status === 'CanLoadMore' ? () => news.loadMore(20) : undefined}
			ListFooterComponent={
				news.status === 'LoadingMore' ? (
					<ActivityIndicator colorClassName="accent-accent" size="large" />
				) : null
			}
			ListHeaderComponent={<HeaderComponent headline={headline} categories={categories} />}
		/>
	);
}

const SCREEN_TOP_PADDING = 24;

const HeaderComponent = ({
	headline,
	categories
}: {
	headline?: Doc<'headlines'>;
	categories?: FunctionReturnType<typeof api.categories.getAll>;
}) => {
	return (
		<View className="android:pb-0 pb-4">
			<Header />
			<ScrollView
				horizontal
				showsHorizontalScrollIndicator={false}
				contentContainerClassName="px-4 pb-8"
			>
				<View className="flex-row items-center gap-4">
					{categories?.map((c) => (
						<ButtonChip
							label={c.name}
							key={c._id}
							onPress={() => router.navigate(`/news/${c.code}`)}
						/>
					))}
				</View>
			</ScrollView>
			{!!headline && (
				<View className="px-4">
					<NewsCard.Headline {...headline} onPress={() => openLink(headline.url)} />
				</View>
			)}
		</View>
	);
};
