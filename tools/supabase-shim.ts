// La vraie bibliothèque Supabase est chargée par une balise <script> (CDN) dans index.html.
export type Session = any;
export const createClient = (...args: any[]) => (window as any).supabase.createClient(...args);
