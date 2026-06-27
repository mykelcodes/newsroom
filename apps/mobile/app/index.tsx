import { api } from '@newsroom/backend/api';
import { Doc } from '@newsroom/backend/dataModel';
import { usePaginatedQuery } from 'convex/react';
import { ActivityIndicator, FlatList, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { Header } from '../components/Header';
import { NewsCard } from '../components/NewsCard';
import { openLink } from '../lib/open-link';

export default function Home() {
	const { theme } = useUnistyles();
	const news = usePaginatedQuery(api.headlines.getAll, {}, { initialNumItems: 20 });
	const headline = news.results[0];
	const results = news.results.slice(1);

	if (news.status === 'LoadingFirstPage') {
		return (
			<View style={styles.indicator}>
				<ActivityIndicator color={theme.colors.accent} size="large" />
			</View>
		);
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
			ListHeaderComponent={<HeaderComponent headline={headline} />}
		/>
	);
}

const HeaderComponent = ({ headline }: { headline?: Doc<'headlines'> }) => {
	return (
		<View style={styles.topSection}>
			<Header />
			{!!headline && <NewsCard.Headline {...headline} onPress={() => openLink(headline.url)} />}
		</View>
	);
};

const styles = StyleSheet.create((t, rt) => ({
	indicator: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center'
	},
	topSection: {
		paddingHorizontal: t.gap(4),
		paddingBottom: t.gap(4)
	},
	flatList: {
		paddingTop: t.gap(6) + rt.insets.top,
		paddingBottom: rt.insets.bottom
	},
	itemWrapper: { paddingHorizontal: t.gap(4), marginBottom: t.gap(4) }
}));
