import { FullscreenLoader } from '#/components/FullscreenLoader';
import { NewsCard } from '#/components/NewsCard';
import { PAGINATION_LIMIT } from '#/lib/constants';
import { openLink } from '#/lib/open-link';
import { toTitleCase } from '#/lib/utils/string-utils';
import { api } from '@newsroom/backend/api';
import { usePaginatedQuery } from 'convex/react';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { useLayoutEffect } from 'react';
import { ActivityIndicator, FlatList } from 'react-native';

export default function NewsByCategoryScreen() {
	const { category } = useLocalSearchParams<{ category: string }>();
	const { results, status, loadMore } = usePaginatedQuery(
		api.headlines.getByCategory,
		{ category },
		{ initialNumItems: PAGINATION_LIMIT }
	);

	const navigation = useNavigation();
	useLayoutEffect(() => {
		navigation.setOptions({ headerTitle: toTitleCase(category) });
	}, [category]);

	if (status === 'LoadingFirstPage') {
		return <FullscreenLoader />;
	}

	return (
		<FlatList
			data={results}
			renderItem={({ item }) => (
				<NewsCard {...item} hideCategory onPress={() => openLink(item.url)} />
			)}
			keyExtractor={(item) => item._id}
			onEndReachedThreshold={0.7}
			onEndReached={status === 'CanLoadMore' ? () => loadMore(PAGINATION_LIMIT) : undefined}
			ListFooterComponent={
				status === 'LoadingMore' ? (
					<ActivityIndicator colorClassName="accent-accent" size="large" />
				) : null
			}
			contentContainerClassName="pt-4 px-4 gap-4 android:gap-0 android:bg-background-primary"
			contentInsetAdjustmentBehavior="automatic"
		/>
	);
}
