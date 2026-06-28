import { api } from '@newsroom/backend/api';
import { Doc } from '@newsroom/backend/dataModel';
import { usePaginatedQuery, useQuery } from 'convex/react';
import { router } from 'expo-router';
import { ActivityIndicator, FlatList, ScrollView, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { ButtonChip } from '../components/ButtonChip';
import { FullscreenLoader } from '../components/FullscreenLoader';
import { Header } from '../components/Header';
import { NewsCard } from '../components/NewsCard';
import { openLink } from '../lib/open-link';

export default function HomeScreen() {
	const { theme } = useUnistyles();
	const news = usePaginatedQuery(api.headlines.getAll, {}, { initialNumItems: 20 });
	const categories = useQuery(api.categories.getAll);
	const headline = news.results[0];
	const results = news.results.slice(1);

	if (news.status === 'LoadingFirstPage') {
		return <FullscreenLoader />;
	}

	return (
		<FlatList
			data={results}
			renderItem={({ item }) => (
				<View style={styles.itemWrapper}>
					<NewsCard {...item} onPress={() => openLink(item.url)} />
				</View>
			)}
			keyExtractor={(item) => item._id}
			contentContainerStyle={styles.flatList}
			onEndReachedThreshold={0.7}
			onEndReached={news.status === 'CanLoadMore' ? () => news.loadMore(20) : undefined}
			ListFooterComponent={
				news.status === 'LoadingMore' ? (
					<ActivityIndicator color={theme.colors.accent} size="large" />
				) : null
			}
			ListHeaderComponent={<HeaderComponent headline={headline} categories={categories} />}
		/>
	);
}

const HeaderComponent = ({
	headline,
	categories
}: {
	headline?: Doc<'headlines'>;
	categories?: Doc<'categories'>[];
}) => {
	return (
		<View style={styles.topSection}>
			<Header />
			<ScrollView
				horizontal
				showsHorizontalScrollIndicator={false}
				contentContainerStyle={styles.categoriesScrollView}
			>
				<View style={styles.categoriesContainer}>
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
				<View style={styles.headlineContainer}>
					<NewsCard.Headline {...headline} onPress={() => openLink(headline.url)} />
				</View>
			)}
		</View>
	);
};

const styles = StyleSheet.create((t, rt) => ({
	topSection: {
		paddingBottom: t.gap(4)
	},
	flatList: {
		paddingTop: t.gap(6) + rt.insets.top,
		paddingBottom: rt.insets.bottom
	},
	itemWrapper: { paddingHorizontal: t.gap(4), marginBottom: t.gap(4) },
	headlineContainer: { paddingHorizontal: t.gap(4) },
	categoriesContainer: { flexDirection: 'row', alignItems: 'center', gap: t.gap(4) },
	categoriesScrollView: {
		paddingHorizontal: t.gap(4),
		paddingBottom: t.gap(8)
	}
}));
