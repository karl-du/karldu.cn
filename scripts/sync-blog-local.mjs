import { mkdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REMOTE_SITE_ORIGIN = 'https://karldu.cn';
const REMOTE_POST_VIEW_ID = '463BE7FE-5435-4841-A365-C9C946C0D655';
const REMOTE_PAGE_SIZE = 100;
const IGNORED_IMAGE_PATTERNS = ['/img/pic_err.', '/img/pic_err'];
const REMOTE_SITE_ALIAS_PATTERN = /^https?:\/\/(?:www\.)?karldu\.cn/i;
const LEGACY_INTERNAL_POST_URL_PATTERN = /^(?:https?:\/\/(?:www\.)?(?:karldu\.cn|dumiaoxin\.top)(?::\d+)?)?\/#\/blog\/([^/?#]+)\/?$/i;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const blogDataOutputFile = path.join(projectRoot, 'src', 'data', 'blog-posts.json');
const blogImageFailuresOutputFile = path.join(projectRoot, 'src', 'data', 'blog-image-failures.json');
const blogMarkdownOutputDir = path.join(projectRoot, 'src', 'content', 'blog');
const blogImagesOutputDir = path.join(projectRoot, 'src', 'assets', 'blog-images');
const legacyPublicBlogImagesOutputDir = path.join(projectRoot, 'public', 'blog-images');

const failedImageDownloads = [];

function buildPostSearchUrl(pageIndex, pageSize = REMOTE_PAGE_SIZE) {
	const params = new URLSearchParams({
		orderBy: '',
		pageSize: String(pageSize),
		pageIndex: String(pageIndex),
		searchList: '',
		viewId: REMOTE_POST_VIEW_ID,
		searchValue: '',
	});

	return `${REMOTE_SITE_ORIGIN}/api/post/search?${params.toString()}`;
}

async function fetchJson(url) {
	const response = await fetch(url);
	if (!response.ok) {
		throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
	}

	return response.json();
}

function canonicalizeRemoteUrl(value) {
	if (!value) return value;
	return value.replace(REMOTE_SITE_ALIAS_PATTERN, REMOTE_SITE_ORIGIN);
}

function normalizeInternalPostRoute(value) {
	if (!value) return value;
	const normalizedValue = value.trim();
	const matchedLegacyUrl = normalizedValue.match(LEGACY_INTERNAL_POST_URL_PATTERN);
	if (matchedLegacyUrl) {
		return `/post/${matchedLegacyUrl[1]}/`;
	}

	const matchedCurrentPath = normalizedValue.match(/^\/blog\/([^/?#]+)\/?$/i);
	if (matchedCurrentPath) {
		return `/post/${matchedCurrentPath[1]}/`;
	}

	return value;
}

function parseRemoteDate(value) {
	if (!value) return undefined;

	const match = value.match(/^(\d{4})\/(\d{2})\/(\d{2})\s+(\d{2}):(\d{2})(?::(\d{2}))?$/);
	if (!match) {
		const fallbackDate = new Date(value);
		return Number.isNaN(fallbackDate.valueOf()) ? undefined : fallbackDate;
	}

	const [, year, month, day, hour, minute, second = '00'] = match;
	return new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}+08:00`);
}

function parseTags(value) {
	if (!value) return [];

	try {
		const parsed = JSON.parse(value);
		return Array.isArray(parsed)
			? parsed.filter((item) => typeof item === 'string' && item.length > 0)
			: [];
	} catch {
		return value
			.split(',')
			.map((item) => item.trim())
			.filter(Boolean);
	}
}

function toAbsoluteUrl(value) {
	if (!value) return undefined;
	if (/^https?:\/\//i.test(value)) return canonicalizeRemoteUrl(value);
	if (value.startsWith('//')) return canonicalizeRemoteUrl(`https:${value}`);
	if (value.startsWith('/')) return canonicalizeRemoteUrl(new URL(value, REMOTE_SITE_ORIGIN).toString());
	return canonicalizeRemoteUrl(new URL(value, `${REMOTE_SITE_ORIGIN}/`).toString());
}

function normalizeContentUrl(value) {
	if (!value || value.startsWith('#')) {
		return value;
	}

	const normalizedInternalPostRoute = normalizeInternalPostRoute(value);
	if (normalizedInternalPostRoute !== value) {
		return normalizedInternalPostRoute;
	}

	if (/^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(value)) {
		return toAbsoluteUrl(value);
	}

	if (value.startsWith('/')) {
		return toAbsoluteUrl(value);
	}

	return canonicalizeRemoteUrl(new URL(value, `${REMOTE_SITE_ORIGIN}/post/`).toString());
}

function normalizeContentHtml(value) {
	if (!value) return '';

	return value.replace(/\b(href|src)=(["'])([^"']+)\2/g, (_match, attribute, quote, url) => {
		return `${attribute}=${quote}${normalizeContentUrl(url)}${quote}`;
	});
}

function normalizeMarkdownUrls(markdown) {
	if (!markdown) return '';

	return markdown.replace(/(!?)\[([^\]]*)\]\(([^)\s]+)([^)]*)\)/g, (_match, prefix, label, url, suffix) => {
		return `${prefix}[${label}](${normalizeContentUrl(url)}${suffix})`;
	});
}

function sanitizeFileNameSegment(value) {
	return (value || 'untitled')
		.replace(/#/g, '＃')
		.replace(/</g, '＜')
		.replace(/>/g, '＞')
		.replace(/:/g, '：')
		.replace(/"/g, '”')
		.replace(/\//g, '／')
		.replace(/\\/g, '＼')
		.replace(/\|/g, '｜')
		.replace(/\?/g, '？')
		.replace(/\*/g, '＊')
		.replace(/[\u0000-\u001F]/g, '')
		.replace(/\s+/g, '')
		.slice(0, 80);
}

function formatFileDate(dateValue) {
	const date = new Date(dateValue);
	if (Number.isNaN(date.valueOf())) {
		return '1970-01-01';
	}

	return date.toISOString().slice(0, 10);
}

function buildMarkdownBaseFileName(summary) {
	const fileDate = formatFileDate(summary.pubDate);
	const safeTitle = sanitizeFileNameSegment(summary.title);
	return `${fileDate}-${safeTitle || '未命名文章'}`;
}

function buildShortFileSuffix(value) {
	return String(value).replace(/[^a-z0-9]/gi, '').slice(0, 8).toLowerCase() || 'post';
}

function buildMarkdownFileName(summary, usedFileNames) {
	const baseFileName = buildMarkdownBaseFileName(summary);
	const primaryFileName = `${baseFileName}.md`;

	if (!usedFileNames.has(primaryFileName)) {
		usedFileNames.add(primaryFileName);
		return primaryFileName;
	}

	const fallbackFileName = `${baseFileName}-${buildShortFileSuffix(summary.id)}.md`;
	if (!usedFileNames.has(fallbackFileName)) {
		usedFileNames.add(fallbackFileName);
		return fallbackFileName;
	}

	let collisionIndex = 2;
	let candidateFileName = `${baseFileName}-${collisionIndex}.md`;
	while (usedFileNames.has(candidateFileName)) {
		collisionIndex += 1;
		candidateFileName = `${baseFileName}-${collisionIndex}.md`;
	}

	usedFileNames.add(candidateFileName);
	return candidateFileName;
}

function stripCoverImagesFromMarkdown(markdown, coverUrls) {
	if (!markdown) return '';

	let nextMarkdown = markdown.replace(/!\[([^\]]*)\]\(([^)\s]+)([^)]*)\)/g, (match, _alt, url) => {
		const normalizedUrl = normalizeContentUrl(url);
		return coverUrls.has(normalizedUrl) ? '' : match;
	});

	nextMarkdown = nextMarkdown.replace(/<img\b[^>]*\bsrc=(["'])([^"']+)\1[^>]*>/gi, (match, _quote, src) => {
		const normalizedSrc = normalizeContentUrl(src);
		return coverUrls.has(normalizedSrc) ? '' : match;
	});

	return nextMarkdown.replace(/\n{3,}/g, '\n\n').trim();
}

function collectMarkdownImageUrls(markdown) {
	const markdownImageUrls = [...markdown.matchAll(/!\[[^\]]*\]\(([^)\s]+)(?:[^)]*)\)/g)].map((match) => match[1]);
	const htmlImageUrls = collectImageUrls(markdown);
	return [...markdownImageUrls, ...htmlImageUrls];
}

function rewriteMarkdownImages(markdown, downloadedImageMap) {
	if (!markdown) return '';

	return markdown.replace(/!\[([^\]]*)\]\(([^)\s]+)([^)]*)\)/g, (_match, alt, url, suffix) => {
		const normalizedUrl = normalizeContentUrl(url);
		const localImagePath = downloadedImageMap.get(normalizedUrl);
		const targetUrl = localImagePath ?? normalizedUrl;
		return `![${alt}](${targetUrl}${suffix})`;
	});
}

function buildMarkdownDocument(summary, markdownContent) {
	const frontmatterLines = [
		'---',
		`title: ${JSON.stringify(summary.title)}`,
		`description: ${JSON.stringify(summary.description)}`,
		`pubDate: ${JSON.stringify(summary.pubDate)}`,
	];

	if (summary.updatedDate) {
		frontmatterLines.push(`updatedDate: ${JSON.stringify(summary.updatedDate)}`);
	}

	if (summary.category) {
		frontmatterLines.push(`category: ${JSON.stringify(summary.category)}`);
	}

	if (summary.tags.length > 0) {
		frontmatterLines.push('tags:');
		for (const tag of summary.tags) {
			frontmatterLines.push(`  - ${JSON.stringify(tag)}`);
		}
	} else {
		frontmatterLines.push('tags: []');
	}

	frontmatterLines.push(`readingTimes: ${summary.readingTimes}`);
	frontmatterLines.push(`author: ${JSON.stringify(summary.author)}`);
	frontmatterLines.push(`remoteId: ${JSON.stringify(summary.id)}`);
	frontmatterLines.push('---', '');

	const normalizedMarkdownContent = markdownContent.trim();
	return `${frontmatterLines.join('\n')}${normalizedMarkdownContent ? `${normalizedMarkdownContent}\n` : ''}`;
}

function mapPostSummary(item) {
	const title = item.title?.trim() || '未命名文章';
	const description = item.brief?.trim() || `${title} · ${item.post_type_name || item.post_type || '博客'}`;

	return {
		id: item.id,
		title,
		description,
		pubDate: parseRemoteDate(item.created_at)?.toISOString() ?? new Date().toISOString(),
		updatedDate: parseRemoteDate(item.updated_at)?.toISOString(),
		category: item.post_type_name || item.post_type || undefined,
		tags: parseTags(item.tags),
		readingTimes: Number(item.reading_times || 0),
		author: item.created_by_name || 'Karl Du',
	};
}

function stripCoverImagesFromHtml(html, coverUrls) {
	if (!html) return '';

	let nextHtml = html.replace(/<img\b[^>]*\bsrc=(["'])([^"']+)\1[^>]*>/gi, (match, _quote, src) => {
		const normalizedSrc = normalizeContentUrl(src);
		return coverUrls.has(normalizedSrc) ? '' : match;
	});

	nextHtml = nextHtml
		.replace(/<p>\s*(?:&nbsp;|<br\s*\/?\s*>|\s)*<\/p>/gi, '')
		.replace(/<figure>\s*<\/figure>/gi, '')
		.replace(/<div>\s*<\/div>/gi, '');

	return nextHtml;
}

function collectImageUrls(html) {
	return [...html.matchAll(/<img\b[^>]*\bsrc=(["'])([^"']+)\1[^>]*>/gi)].map((match) => match[2]);
}

function detectImageExtensionFromBuffer(buffer) {
	if (!buffer || buffer.length === 0) return undefined;
	if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return 'jpg';
	if (
		buffer[0] === 0x89 &&
		buffer[1] === 0x50 &&
		buffer[2] === 0x4e &&
		buffer[3] === 0x47 &&
		buffer[4] === 0x0d &&
		buffer[5] === 0x0a &&
		buffer[6] === 0x1a &&
		buffer[7] === 0x0a
	) {
		return 'png';
	}
	if (buffer.subarray(0, 6).toString('ascii') === 'GIF87a' || buffer.subarray(0, 6).toString('ascii') === 'GIF89a') {
		return 'gif';
	}
	if (buffer.subarray(0, 4).toString('ascii') === 'RIFF' && buffer.subarray(8, 12).toString('ascii') === 'WEBP') {
		return 'webp';
	}
	if (buffer.subarray(0, 256).toString('utf-8').includes('<svg')) {
		return 'svg';
	}
	return undefined;
}

function getFileExtension(url, contentType, imageBuffer) {
	const parsedUrl = new URL(url);
	const pathname = parsedUrl.pathname;
	const extensionFromPath = path.extname(pathname).replace('.', '').toLowerCase();
	if (extensionFromPath) return extensionFromPath;

	const objectId = parsedUrl.searchParams.get('objectId') ?? '';
	const extensionFromObjectId = path.extname(objectId).replace('.', '').toLowerCase();
	if (extensionFromObjectId) return extensionFromObjectId;

	const normalizedContentType = contentType?.split(';')[0].trim().toLowerCase();
	const extensionByContentType = {
		'image/jpeg': 'jpg',
		'image/jpg': 'jpg',
		'image/png': 'png',
		'image/gif': 'gif',
		'image/webp': 'webp',
		'image/svg+xml': 'svg',
	};

	return extensionByContentType[normalizedContentType] ?? detectImageExtensionFromBuffer(imageBuffer) ?? 'bin';
}

function buildMarkdownAssetPath(postId, imageFileName) {
	return path.posix.join('..', '..', 'assets', 'blog-images', postId, imageFileName);
}

async function downloadImage(url, postId, imageIndex) {
	const response = await fetch(url);
	if (!response.ok) {
		throw new Error(`Failed to download image ${url}: ${response.status} ${response.statusText}`);
	}

	const contentType = response.headers.get('content-type') ?? undefined;
	const imageBuffer = Buffer.from(await response.arrayBuffer());
	const extension = getFileExtension(url, contentType, imageBuffer);
	const imageFileName = `${String(imageIndex + 1).padStart(2, '0')}.${extension}`;
	const imageDir = path.join(blogImagesOutputDir, postId);
	const imageFilePath = path.join(imageDir, imageFileName);
	const relativeImagePath = buildMarkdownAssetPath(postId, imageFileName);

	await mkdir(imageDir, { recursive: true });
	await writeFile(imageFilePath, imageBuffer);

	return relativeImagePath;
}

async function fetchPostSearchPage(pageIndex) {
	return fetchJson(buildPostSearchUrl(pageIndex));
}

async function getAllPostSummaries() {
	const firstPage = await fetchPostSearchPage(1);
	const totalPages = Math.max(1, Math.ceil(firstPage.RecordCount / REMOTE_PAGE_SIZE));
	const restPages =
		totalPages > 1
			? await Promise.all(
					Array.from({ length: totalPages - 1 }, (_, index) => fetchPostSearchPage(index + 2)),
				)
			: [];

	return [firstPage, ...restPages]
		.flatMap((page) => page.DataList)
		.map(mapPostSummary)
		.sort((a, b) => new Date(b.pubDate).valueOf() - new Date(a.pubDate).valueOf());
}

async function buildLocalPost(summary, usedMarkdownFileNames) {
	const detail = await fetchJson(`${REMOTE_SITE_ORIGIN}/api/post/${summary.id}`);
	const coverUrls = new Set(
		[toAbsoluteUrl(detail.surface_url), toAbsoluteUrl(detail.big_surface_url)]
			.filter(Boolean)
			.filter((url) => !IGNORED_IMAGE_PATTERNS.some((pattern) => url.includes(pattern))),
	);
	let contentHtml = stripCoverImagesFromHtml(normalizeContentHtml(detail.html_content), coverUrls);
	let markdownContent = stripCoverImagesFromMarkdown(
		normalizeMarkdownUrls(normalizeContentHtml(detail.content?.trim() || detail.html_content || '')),
		coverUrls,
	);
	const rawImageUrls = [...collectImageUrls(contentHtml), ...collectMarkdownImageUrls(markdownContent)]
		.map((url) => normalizeContentUrl(url))
		.filter(Boolean)
		.filter((url) => !coverUrls.has(url))
		.filter((url) => !IGNORED_IMAGE_PATTERNS.some((pattern) => url.includes(pattern)));
	const uniqueImageUrls = [...new Set(rawImageUrls)];
	const downloadedImageMap = new Map();
	const unavailableImageUrls = new Set();

	for (const [index, imageUrl] of uniqueImageUrls.entries()) {
		try {
			const localImagePath = await downloadImage(imageUrl, summary.id, index);
			downloadedImageMap.set(imageUrl, localImagePath);
		} catch (error) {
			unavailableImageUrls.add(imageUrl);
			const message = error instanceof Error ? error.message : String(error);
			failedImageDownloads.push({
				postId: summary.id,
				postTitle: summary.title,
				imageUrl,
				error: message,
			});
			console.warn(`Skipped image for ${summary.id}: ${imageUrl}`);
		}
	}

	contentHtml = stripCoverImagesFromHtml(contentHtml, unavailableImageUrls);
	markdownContent = stripCoverImagesFromMarkdown(markdownContent, unavailableImageUrls);

	markdownContent = rewriteMarkdownImages(markdownContent, downloadedImageMap);

	const markdownFilePath = path.join(blogMarkdownOutputDir, buildMarkdownFileName(summary, usedMarkdownFileNames));
	await writeFile(markdownFilePath, buildMarkdownDocument(summary, markdownContent), 'utf-8');

	return {
		...summary,
		contentHtml,
	};
}

async function main() {
	await rm(legacyPublicBlogImagesOutputDir, { recursive: true, force: true });
	await rm(blogImagesOutputDir, { recursive: true, force: true });
	await rm(blogMarkdownOutputDir, { recursive: true, force: true });
	await mkdir(path.dirname(blogDataOutputFile), { recursive: true });
	await mkdir(blogMarkdownOutputDir, { recursive: true });

	const summaries = await getAllPostSummaries();
	const localPosts = [];
	const usedMarkdownFileNames = new Set();

	for (const summary of summaries) {
		const localPost = await buildLocalPost(summary, usedMarkdownFileNames);
		localPosts.push(localPost);
		console.log(`Synced ${summary.id} - ${summary.title}`);
	}

	await writeFile(blogDataOutputFile, `${JSON.stringify(localPosts, null, 2)}\n`, 'utf-8');
	await writeFile(blogImageFailuresOutputFile, `${JSON.stringify(failedImageDownloads, null, 2)}\n`, 'utf-8');
	console.log(`Saved ${localPosts.length} posts to ${path.relative(projectRoot, blogDataOutputFile)}`);
	console.log(`Exported markdown files to ${path.relative(projectRoot, blogMarkdownOutputDir)}`);
	console.log(`Downloaded markdown images to ${path.relative(projectRoot, blogImagesOutputDir)}`);
	if (failedImageDownloads.length > 0) {
		console.log(
			`Skipped ${failedImageDownloads.length} unavailable images; details saved to ${path.relative(projectRoot, blogImageFailuresOutputFile)}`,
		);
	}
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});