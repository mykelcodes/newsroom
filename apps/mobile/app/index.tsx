import { useQuery } from 'convex/react';
import { api } from '@newsroom/backend/api';
import type { Doc } from '@newsroom/backend/dataModel';
import {
	ActivityIndicator,
	FlatList,
	Image,
	StyleSheet,
	Text,
	View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Home() {
	const headlines = useQuery(api.headlines.getLatest, { count: 20 });

	return (
		<SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
			<View style={styles.header}>
				<Text style={styles.kicker}>NEWSROOM</Text>
				<Text style={styles.title}>Latest Headlines</Text>
			</View>

			{headlines === undefined ? (
				<View style={styles.center}>
					<ActivityIndicator size="large" color="#111" />
				</View>
			) : headlines.length === 0 ? (
				<View style={styles.center}>
					<Text style={styles.empty}>No headlines yet.</Text>
				</View>
			) : (
				<FlatList
					data={headlines}
					keyExtractor={(item) => item._id}
					contentContainerStyle={styles.list}
					renderItem={({ item }) => <HeadlineCard headline={item} />}
				/>
			)}
		</SafeAreaView>
	);
}

function HeadlineCard({ headline }: { headline: Doc<'headlines'> }) {
	return (
		<View style={styles.card}>
			{headline.image ? (
				<Image source={{ uri: headline.image }} style={styles.image} />
			) : null}
			<Text style={styles.category}>{headline.category.toUpperCase()}</Text>
			<Text style={styles.cardTitle}>{headline.title}</Text>
			<Text style={styles.source}>{headline.sourceName}</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: '#fff' },
	header: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 },
	kicker: { fontSize: 12, letterSpacing: 2, color: '#c00', fontWeight: '700' },
	title: { fontSize: 28, fontWeight: '800', color: '#111' },
	center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
	empty: { color: '#666', fontSize: 16 },
	list: { padding: 16, gap: 20 },
	card: { gap: 6 },
	image: { width: '100%', height: 180, borderRadius: 10, backgroundColor: '#eee' },
	category: { fontSize: 11, letterSpacing: 1, color: '#c00', fontWeight: '700' },
	cardTitle: { fontSize: 18, fontWeight: '700', color: '#111', lineHeight: 24 },
	source: { fontSize: 13, color: '#777' }
});
