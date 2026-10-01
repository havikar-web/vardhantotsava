import type {MetadataRoute} from 'next';
export default function sitemap():MetadataRoute.Sitemap {
 return ['','/about','/packages','/vardhantotsava','/how-it-works','/faqs','/gifts'].map(path=>({url:'https://www.mantrakshata.com'+path}));
}
