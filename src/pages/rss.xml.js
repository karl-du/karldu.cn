import rss from '@astrojs/rss';
import { SITE_DESCRIPTION, SITE_TITLE } from '../consts';
import { getLocalBlogPostSummaries } from '../data/local-blog';

export async function GET(context) {
	const posts = await getLocalBlogPostSummaries();
	return rss({
		title: SITE_TITLE,
		description: SITE_DESCRIPTION,
		site: context.site,
		items: posts.map((post) => ({
			title: post.title,
			description: post.description,
			pubDate: post.pubDate,
			...(post.updatedDate ? { updatedDate: post.updatedDate } : {}),
			link: `/post/${post.id}/`,
		})),
	});
}
