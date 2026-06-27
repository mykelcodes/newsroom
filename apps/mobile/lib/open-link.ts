import * as WebBrowser from 'expo-web-browser';
import { Alert } from 'react-native';

export async function openLink(url: string) {
	try {
		return await WebBrowser.openBrowserAsync(url);
	} catch (error) {
		Alert.alert(
			'Error opening link',
			error instanceof Error ? error.message : `Unable to open ${url}`
		);
	}
}
