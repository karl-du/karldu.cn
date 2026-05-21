import { getCollection, type CollectionEntry } from 'astro:content';

type BlogCollectionEntry = CollectionEntry<'blog'>;

export interface LocalBlogPostSummary {
	id: string;
	title: string;
	description: string;
	pubDate: Date;
	updatedDate?: Date;
	category?: string;
	tags: string[];
}

export interface LocalBlogPost extends LocalBlogPostSummary {
	entry: BlogCollectionEntry;
}

function mapEntryToSummary(entry: BlogCollectionEntry): LocalBlogPostSummary {
	return {
		id: entry.data.remoteId,
		title: entry.data.title,
		description: entry.data.description,
		pubDate: entry.data.pubDate,
		updatedDate: entry.data.updatedDate,
		category: entry.data.category,
		tags: entry.data.tags,
	};
}

async function loadEntries() {
	const entries = await getCollection('blog');
	return entries.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

export async function getLocalBlogPostSummaries(): Promise<LocalBlogPostSummary[]> {
	const entries = await loadEntries();
	return entries.map(mapEntryToSummary);
}

export async function getLocalBlogPosts(): Promise<LocalBlogPost[]> {
	const entries = await loadEntries();
	return entries.map((entry) => ({
		...mapEntryToSummary(entry),
		entry,
	}));
}