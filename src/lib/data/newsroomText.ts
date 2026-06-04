export type NewsCategory = {
	code: string;
	name: string;
};

export type NewsType = {
	code: string;
	name: string;
};

export type TextArticle = {
	title: string;
	summary: string;
	date: string;
	category: string;
	categoryCode: string;
	type: string;
	views: string;
	comments: string;
	readTime: string;
};

export const categories: NewsCategory[] = [
	{ code: 'technology', name: 'Technology' },
	{ code: 'business', name: 'Business' },
	{ code: 'industry-insights', name: 'Industry Insights' },
	{ code: 'events', name: 'Events' },
	{ code: 'lifestyle', name: 'Lifestyle' },
	{ code: 'sport', name: 'Sport' }
];

export const articleTypes: NewsType[] = [
	{ code: 'news', name: 'News' },
	{ code: 'feature', name: 'Feature' },
	{ code: 'analysis', name: 'Analysis' }
];

export const articles: TextArticle[] = [
	{
		title: 'Championship final set after dramatic semi-final clash',
		summary:
			'A late surge reshaped the final minutes and set up a championship meeting with momentum on both sides.',
		date: 'Jan 13, 2026',
		category: 'Sport',
		categoryCode: 'sport',
		type: 'news',
		views: '11.0K',
		comments: '200',
		readTime: '4 min read'
	},
	{
		title: 'Interleague Advanced Analytics for Better Decision-Making',
		summary:
			'Teams are combining match data, fan sentiment, and operational signals to make faster editorial decisions.',
		date: 'Jan 13, 2026',
		category: 'Technology',
		categoryCode: 'technology',
		type: 'analysis',
		views: '9.4K',
		comments: '128',
		readTime: '6 min read'
	},
	{
		title: 'Expanding Our Team to Support Rapid Growth',
		summary:
			'The newsroom is growing its editorial, operations, and audience teams to support a wider publishing cadence.',
		date: 'Jan 13, 2026',
		category: 'Business',
		categoryCode: 'business',
		type: 'feature',
		views: '8.7K',
		comments: '96',
		readTime: '5 min read'
	},
	{
		title: 'National Team Secures Crucial Win in Qualifier Match',
		summary:
			'A tactical shift after halftime helped the national side secure a critical result before the final qualifying round.',
		date: 'Jan 13, 2026',
		category: 'Sport',
		categoryCode: 'sport',
		type: 'news',
		views: '12.6K',
		comments: '244',
		readTime: '3 min read'
	},
	{
		title: 'Creative Off-court Moments Fuel New Audience Growth',
		summary:
			'Behind-the-scenes stories are shaping how readers follow athletes, teams, and cultural moments beyond match day.',
		date: 'Jan 12, 2026',
		category: 'Lifestyle',
		categoryCode: 'lifestyle',
		type: 'feature',
		views: '7.8K',
		comments: '83',
		readTime: '5 min read'
	},
	{
		title: 'Young Player Impresses in First League Appearance',
		summary:
			'Coaches and supporters praised the debut performance after a composed showing under pressure.',
		date: 'Jan 12, 2026',
		category: 'Sport',
		categoryCode: 'sport',
		type: 'news',
		views: '6.9K',
		comments: '71',
		readTime: '3 min read'
	},
	{
		title: 'Flexible Contract Strategy Reshapes Front-office Planning',
		summary:
			'New commercial models are giving organizations more room to balance long-term planning with weekly volatility.',
		date: 'Jan 11, 2026',
		category: 'Industry Insights',
		categoryCode: 'industry-insights',
		type: 'analysis',
		views: '5.2K',
		comments: '44',
		readTime: '7 min read'
	},
	{
		title: 'Star Player Sidelined After Training Injury',
		summary:
			'The team confirmed that their key player will miss upcoming fixtures after sustaining an injury during training.',
		date: 'Jan 11, 2026',
		category: 'Sport',
		categoryCode: 'sport',
		type: 'news',
		views: '10.3K',
		comments: '189',
		readTime: '2 min read'
	},
	{
		title: 'New Season Schedule Officially Announced',
		summary:
			'The full calendar introduces new rivalry fixtures, expanded weekend coverage, and a sharper broadcast rhythm.',
		date: 'Jan 10, 2026',
		category: 'Events',
		categoryCode: 'events',
		type: 'news',
		views: '9.8K',
		comments: '162',
		readTime: '4 min read'
	},
	{
		title: 'Coach Shares Strategy Ahead of Important Home Match',
		summary:
			'The head coach emphasized discipline, pace, and smarter transitions during the pre-match press conference.',
		date: 'Jan 10, 2026',
		category: 'Sport',
		categoryCode: 'sport',
		type: 'feature',
		views: '7.1K',
		comments: '58',
		readTime: '5 min read'
	},
	{
		title: 'Audience Tools Help Editors Spot Emerging Storylines',
		summary:
			'New dashboards are helping editors identify fast-rising reader interest before stories peak across channels.',
		date: 'Jan 9, 2026',
		category: 'Technology',
		categoryCode: 'technology',
		type: 'analysis',
		views: '4.9K',
		comments: '37',
		readTime: '6 min read'
	},
	{
		title: 'Community Event Series Returns With Expanded Lineup',
		summary:
			'The latest event program brings live conversations, workshops, and editorial showcases to more cities.',
		date: 'Jan 9, 2026',
		category: 'Events',
		categoryCode: 'events',
		type: 'feature',
		views: '4.1K',
		comments: '29',
		readTime: '4 min read'
	}
];
