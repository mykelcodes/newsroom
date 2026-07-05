import { useCSSVariable } from 'uniwind';

export function useThemeVars() {
	const colorForegroundPrimary = useCSSVariable('--color-foreground-primary')?.toString();

	return {
		colorForegroundPrimary
	};
}
