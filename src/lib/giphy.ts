import { GiphyFetch } from "@giphy/js-fetch-api";

const key = process.env.NEXT_PUBLIC_GIPHY_API_KEY;
export const gf = key ? new GiphyFetch(key) : null;
