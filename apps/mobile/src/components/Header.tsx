import dayjs from 'dayjs';
import { Text, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

export function Header() {
	return (
		<View style={styles.container}>
			<Text style={styles.date}>{dayjs().format('dddd, MMMM D')}</Text>
			<Text style={styles.newsroom}>Newsroom</Text>
		</View>
	);
}

const styles = StyleSheet.create((t) => ({
	container: {
		paddingHorizontal: t.gap(4),
		paddingBottom: t.gap(2.5),
		marginBottom: t.gap(4.5)
	},
	date: {
		textTransform: 'uppercase',
		color: t.colors.foreground_disabled,
		fontSize: 13,
		lineHeight: 18,
		fontWeight: '600'
	},
	newsroom: {
		textTransform: 'uppercase',
		color: t.colors.foreground_primary,
		fontSize: 34,
		lineHeight: 41,
		fontWeight: '700'
	}
}));
