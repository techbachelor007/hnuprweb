import { defineConfig } from "vite";
import { resolve, basename, join } from "path";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { SITE_URL, SCHOOL, PAGES } from "./seo.config.js";

// ---------- SEO plugin ----------
// Adds canonical / Open Graph / Twitter / structured data tags to every page,
// and writes sitemap.xml + robots.txt into dist on build.
// Page content and design are not touched.
const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const abs = (p) => SITE_URL + p;

function schoolSchema() {
  return {
    "@type": ["School", "EducationalOrganization", "LocalBusiness"],
    "@id": abs("/#school"),
    name: SCHOOL.name,
    alternateName: SCHOOL.alternateName,
    url: abs("/"),
    logo: abs(SCHOOL.logo),
    image: abs(SCHOOL.image),
    foundingDate: SCHOOL.foundingDate,
    telephone: SCHOOL.phone[0],
    email: SCHOOL.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: SCHOOL.street,
      addressLocality: SCHOOL.locality,
      addressRegion: SCHOOL.region,
      postalCode: SCHOOL.postalCode,
      addressCountry: SCHOOL.country,
    },
    geo: { "@type": "GeoCoordinates", latitude: SCHOOL.lat, longitude: SCHOOL.lng },
    hasMap: `https://www.google.com/maps?q=${SCHOOL.lat},${SCHOOL.lng}`,
    areaServed: [SCHOOL.locality, SCHOOL.district, SCHOOL.region],
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: SCHOOL.hours.days,
        opens: SCHOOL.hours.opens,
        closes: SCHOOL.hours.closes,
      },
    ],
    contactPoint: SCHOOL.phone.map((t) => ({
      "@type": "ContactPoint",
      telephone: t,
      contactType: "admissions",
      areaServed: "IN",
      availableLanguage: ["English", "Tamil"],
    })),
    ...(SCHOOL.sameAs.length ? { sameAs: SCHOOL.sameAs } : {}),
  };
}

function seoTags(page, title, description) {
  const url = abs(page.path);
  const graph = [
    {
      "@type": "WebSite",
      "@id": abs("/#website"),
      url: abs("/"),
      name: SCHOOL.name,
      inLanguage: "en-IN",
      publisher: { "@id": abs("/#school") },
    },
    schoolSchema(),
    {
      "@type": page.path === "/contact.html" ? "ContactPage" : page.path === "/about.html" ? "AboutPage" : page.path === "/gallery.html" ? "CollectionPage" : "WebPage",
      "@id": url + "#webpage",
      url,
      name: title,
      description,
      inLanguage: "en-IN",
      isPartOf: { "@id": abs("/#website") },
      about: { "@id": abs("/#school") },
      primaryImageOfPage: abs(SCHOOL.image),
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: abs("/") },
        ...(page.path === "/" ? [] : [{ "@type": "ListItem", position: 2, name: page.name, item: url }]),
      ],
    },
  ];
  const t = esc(title), d = esc(description);
  return `
  <!-- SEO (generated from seo.config.js) -->
  <link rel="canonical" href="${url}" />
  <meta name="robots" content="index, follow, max-image-preview:large" />
  <meta name="keywords" content="${esc(SCHOOL.keywords)}" />
  <meta name="author" content="${esc(SCHOOL.name)}" />
  <meta name="theme-color" content="#0a2540" />
  <meta name="geo.region" content="IN-TN" />
  <meta name="geo.placename" content="${esc(SCHOOL.locality + ", " + SCHOOL.district)}" />
  <meta name="geo.position" content="${SCHOOL.lat};${SCHOOL.lng}" />
  <meta name="ICBM" content="${SCHOOL.lat}, ${SCHOOL.lng}" />
  <link rel="apple-touch-icon" href="/logo.jpg" />
  <link rel="sitemap" type="application/xml" href="/sitemap.xml" />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="${esc(SCHOOL.name)}" />
  <meta property="og:locale" content="en_IN" />
  <meta property="og:title" content="${t}" />
  <meta property="og:description" content="${d}" />
  <meta property="og:url" content="${url}" />
  <meta property="og:image" content="${abs(SCHOOL.image)}" />
  <meta property="og:image:width" content="800" />
  <meta property="og:image:height" content="531" />
  <meta property="og:image:alt" content="${esc(SCHOOL.name)} campus" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${t}" />
  <meta name="twitter:description" content="${d}" />
  <meta name="twitter:image" content="${abs(SCHOOL.image)}" />
  <script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@graph": graph })}</script>
`;
}

function seoPlugin() {
  return {
    name: "hnupr-seo",
    transformIndexHtml(html, ctx) {
      const file = basename(ctx.filename || ctx.path || "index.html");
      const page = PAGES.find((p) => p.file === file);
      if (!page || html.includes('rel="canonical"')) return html;
      const title = (html.match(/<title>([\s\S]*?)<\/title>/i) || [])[1]?.trim() || SCHOOL.name;
      const description =
        (html.match(/<meta\s+name="description"\s+content="([^"]*)"/i) || [])[1] || "";
      return html.replace(/<\/head>/i, seoTags(page, title, description) + "</head>");
    },
    writeBundle(opts) {
      const outDir = opts.dir || resolve(__dirname, "dist");
      const today = new Date().toISOString().slice(0, 10);
      const urls = PAGES.map((p) => {
        const f = join(outDir, p.file);
        const html = existsSync(f) ? readFileSync(f, "utf8") : "";
        const seen = new Set();
        const images = [...html.matchAll(/<img\b[^>]*>/gi)]
          .map((m) => {
            const src = (m[0].match(/\ssrc="([^"]+)"/) || [])[1];
            const alt = (m[0].match(/\salt="([^"]*)"/) || [])[1] || "";
            return src && !src.startsWith("data:") ? { src: src.startsWith("http") ? src : abs(src.startsWith("/") ? src : "/" + src), alt } : null;
          })
          .filter((i) => i && !seen.has(i.src) && seen.add(i.src));
        const imgXml = images
          .map((i) => `\n    <image:image><image:loc>${esc(i.src)}</image:loc>${i.alt ? `<image:title>${esc(i.alt)}</image:title>` : ""}</image:image>`)
          .join("");
        return `  <url>\n    <loc>${abs(p.path)}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${p.changefreq}</changefreq>\n    <priority>${p.priority}</priority>${imgXml}\n  </url>`;
      }).join("\n");
      writeFileSync(join(outDir, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${urls}\n</urlset>\n`);
      writeFileSync(join(outDir, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${abs("/sitemap.xml")}\n`);
    },
  };
}

export default defineConfig({
  plugins: [seoPlugin()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        about: resolve(__dirname, "about.html"),
        academics: resolve(__dirname, "academics.html"),
        admission: resolve(__dirname, "admission.html"),
        gallery: resolve(__dirname, "gallery.html"),
        contact: resolve(__dirname, "contact.html"),
      },
    },
  },
});
