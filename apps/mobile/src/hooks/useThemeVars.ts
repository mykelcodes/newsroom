import { useCSSVariable } from 'uniwind';

export function useThemeVars() {
	const fontSans = useCSSVariable('--font-sans')?.toString();
	const colorBackgroundPrimary = useCSSVariable('--color-background-primary')?.toString();
	const colorForegroundPrimary = useCSSVariable('--color-foreground-primary')?.toString();
	const colorForegroundSecondary = useCSSVariable('--color-foreground-secondary')?.toString();
	const colorForegroundDisabled = useCSSVariable('--color-foreground-disabled')?.toString();
	const colorBorderPrimary = useCSSVariable('--color-border-primary')?.toString();
	const colorAccent = useCSSVariable('--color-accent')?.toString();

	return {
		fontSans,
		colorBackgroundPrimary,
		colorForegroundPrimary,
		colorForegroundSecondary,
		colorForegroundDisabled,
		colorBorderPrimary,
		colorAccent
	};
}
