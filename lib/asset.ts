const BASE = process.env.NEXT_PUBLIC_BASE_PATH || "";
/** Prefix a public asset path with the optional base path. */
export const asset = (path: string) => `${BASE}${path.startsWith("/") ? path : `/${path}`}`;
