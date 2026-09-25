// ============================================================
//  SEO SETTINGS — the only file you need to edit for SEO.
//  If your domain ever changes, change SITE_URL and rebuild.
// ============================================================

export const SITE_URL = "https://hnuprmatric.com"; // no trailing slash

export const SCHOOL = {
  name: "HNUPR Matriculation Higher Secondary School",
  shortName: "HNUPR Matric Hr Sec School",
  alternateName: ["HNUPR Matriculation Hr Sec School", "HNUPR Matric School Nilakottai"],
  foundingDate: "1973",
  phone: ["+91-99449-33624", "+91-82707-87387"],
  email: "hnuprmatric@gmail.com",
  street: "HNUPR Matriculation Hr Sec School",
  locality: "Nilakottai",
  district: "Dindigul",
  region: "Tamil Nadu",
  postalCode: "624208",
  country: "IN",
  lat: 10.16407,
  lng: 77.850418,
  hours: { days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"], opens: "08:00", closes: "17:30" },
  // Add real profile links here when you have them (Facebook, Instagram, YouTube):
  sameAs: [],
  image: "/og-image.jpg", // served from /public
  logo: "/logo.jpg",       // served from /public
  keywords:
    "HNUPR, HNUPR Matriculation, HNUPR school, matriculation school Nilakottai, Nilakkottai school, best school in Nilakottai, higher secondary school Dindigul, matric school Dindigul, State Board school, Samacheer Kalvi, Pre-KG to XII, school admission Nilakottai, HNUPR Matric Hr Sec School",
};

// Every page in the site, in sitemap order.
// path "/" = home. changefreq/priority are hints for search engines.
export const PAGES = [
  { file: "index.html",     path: "/",               name: "Home",      changefreq: "weekly",  priority: "1.0" },
  { file: "about.html",     path: "/about.html",     name: "About",     changefreq: "monthly", priority: "0.8" },
  { file: "academics.html", path: "/academics.html", name: "Academics", changefreq: "monthly", priority: "0.8" },
  { file: "admission.html", path: "/admission.html", name: "Admission", changefreq: "weekly",  priority: "0.9" },
  { file: "gallery.html",   path: "/gallery.html",   name: "Gallery",   changefreq: "monthly", priority: "0.7" },
  { file: "contact.html",   path: "/contact.html",   name: "Contact",   changefreq: "yearly",  priority: "0.7" },
];
