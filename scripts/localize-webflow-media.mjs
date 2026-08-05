import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { extname, join } from "node:path";

const projectRoot = new URL("../", import.meta.url);
const sourceDirectory = new URL("../src/content/pages/", import.meta.url);
const outputDirectory = new URL("../public/assets/webflow/images/captured/", import.meta.url);

const mediaHosts = new Set([
	"cdn.prod.website-files.com",
	"d3e54v103j8qbb.cloudfront.net",
	"i.vimeocdn.com",
	"r2.vidzflow.com",
	"res.cloudinary.com",
]);

const extensionByType = new Map([
	["image/avif", ".avif"],
	["image/gif", ".gif"],
	["image/jpeg", ".jpg"],
	["image/png", ".png"],
	["image/svg+xml", ".svg"],
	["image/webp", ".webp"],
	["video/mp4", ".mp4"],
	["video/webm", ".webm"],
]);
const supportedExtensions = new Set(extensionByType.values());

const files = (await readdir(sourceDirectory, { recursive: true }))
	.filter((file) => file.endsWith(".html"))
	.sort();
const documents = new Map();
const urls = new Set();

for (const file of files) {
	const contents = await readFile(new URL(file, sourceDirectory), "utf8");
	documents.set(file, contents);

	for (const match of contents.matchAll(/https:\/\/[^\s,"'<>]+/g)) {
		const encodedUrl = match[0];
		const requestUrl = encodedUrl.replaceAll("&amp;", "&");
		try {
			if (mediaHosts.has(new URL(requestUrl).hostname)) urls.add(encodedUrl);
		} catch {
			// Ignore malformed text that merely resembles a URL.
		}
	}
}

await mkdir(outputDirectory, { recursive: true });

const replacements = new Map();
const failures = [];

for (const encodedUrl of [...urls].sort()) {
	const requestUrl = encodedUrl.replaceAll("&amp;", "&");
	try {
		const response = await fetch(requestUrl, {
			headers: { "user-agent": "Mozilla/5.0 Max-Space-Astro asset capture" },
		});
		if (!response.ok) throw new Error(`HTTP ${response.status}`);

		const contentType = (response.headers.get("content-type") || "")
			.split(";", 1)[0]
			.trim()
			.toLowerCase();
		const pathExtension = extname(decodeURIComponent(new URL(requestUrl).pathname)).toLowerCase();
		const extension = extensionByType.get(contentType) ||
			(supportedExtensions.has(pathExtension) ? pathExtension : undefined);
		if (!extension) continue;

		const digest = createHash("sha256").update(requestUrl).digest("hex").slice(0, 20);
		const filename = `${digest}${extension}`;
		await writeFile(new URL(filename, outputDirectory), Buffer.from(await response.arrayBuffer()));
		replacements.set(encodedUrl, `/assets/webflow/images/captured/${filename}`);
	} catch (error) {
		failures.push({ url: requestUrl, reason: error instanceof Error ? error.message : String(error) });
	}
}

for (const [file, original] of documents) {
	let localized = original;
	for (const [remoteUrl, localUrl] of replacements) {
		localized = localized.replaceAll(remoteUrl, localUrl);
	}
	if (localized !== original) {
		await writeFile(new URL(file, sourceDirectory), localized);
	}
}

const summary = {
	projectRoot: projectRoot.pathname,
	documents: files.length,
	discoveredUrls: urls.size,
	localizedAssets: replacements.size,
	failures,
};

console.log(JSON.stringify(summary, null, 2));
