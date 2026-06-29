import { Doc } from '@newsroom/backend/dataModel';
import dayjs from 'dayjs';
import { ReactNode } from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { StyleSheet } from 'react-native-unistyles';
import { useAnimatedTheme } from 'react-native-unistyles/reanimated';

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
					<View style={styles.mainContent}>
						<View style={styles.topContent}>
							<View style={{ flex: 1 }}>
								{!!sourceName && <Text style={styles.source}>{sourceName}</Text>}
								<Text numberOfLines={4} style={styles.newsCardTitle}>
									{title}
								</Text>
							</View>

							{!!image && (
								<Image source={{ uri: image }} resizeMode="cover" style={styles.newsCardImage} />
							)}
						</View>
						<View style={styles.footer}>
							<Text style={styles.createdAt}>
								{dayjs(publishedAt).format('MMM D, YYYY h:mm A')}
							</Text>
							{!hideCategory && <Text style={styles.category}>{category}</Text>}
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
						<Image source={{ uri: props.image }} resizeMode="cover" style={styles.image} />
					)}
					<View style={styles.mainContent}>
						{!!props.sourceName && <Text style={styles.source}>{props.sourceName}</Text>}
						<Text style={styles.title} numberOfLines={3}>
							{props.title}
						</Text>
						<View style={styles.footer}>
							<Text style={styles.createdAt}>
								{dayjs(props.publishedAt).format('MMM D, YYYY h:mm A')}
							</Text>
							<Text style={styles.category}>{props.category}</Text>
						</View>
					</View>
				</NewsCardContainer>
			)}
		</Pressable>
	);
}

function NewsCardContainer({ children, pressed }: { children: ReactNode; pressed: boolean }) {
	const theme = useAnimatedTheme();
	const themedStyle = useAnimatedStyle(() => ({
		backgroundColor: theme.value.colors.background_primary
	}));

	return <Animated.View style={[styles.container(pressed), themedStyle]}>{children}</Animated.View>;
}

NewsCard.Headline = Headline;

const styles = StyleSheet.create((t) => ({
	container: (pressed: boolean) => ({
		borderRadius: 16,
		overflow: 'hidden',
		transitionProperty: ['transform'],
		transitionDuration: 300,
		transform: [{ scale: pressed ? 1.05 : 1 }]
	}),
	source: {
		fontFamily: 'Monoton-Regular',
		textTransform: 'uppercase',
		fontSize: 14,
		color: t.colors.foreground_primary
	},
	mainContent: { padding: 16 },
	topContent: {
		flexDirection: 'row',
		alignItems: 'flex-start',
		gap: t.gap(2)
	},
	category: {
		fontSize: 12,
		color: t.colors.accent,
		fontWeight: '600',
		textTransform: 'uppercase'
	},
	newsCardImage: {
		height: 120,
		width: 120,
		borderRadius: 8
	},
	newsCardTitle: {
		color: t.colors.foreground_primary,
		fontSize: 18,
		letterSpacing: -0.2,
		fontWeight: '600'
	},
	title: {
		color: t.colors.foreground_primary,
		fontSize: 20,
		lineHeight: 28,
		letterSpacing: -0.2,
		fontWeight: '700'
	},
	footer: {
		marginTop: t.gap(8),
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between'
	},
	createdAt: {
		fontSize: 12,
		color: t.colors.foreground_secondary
	},
	image: {
		width: '100%',
		height: 250
	}
}));
