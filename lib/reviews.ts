import reviewsData from "@/data/reviews.json";

export type Review = {
  author: string;
  authorUrl: string | null;
  photo: string | null;
  rating: number;
  text: string;
  /** Google's relative time, e.g. "5 months ago". */
  time: string;
  url: string | null;
};

export type GoogleReviews = {
  placeId: string | null;
  rating: number | null;
  count: number;
  /** The listing on Google Maps. */
  url: string | null;
  reviews: Review[];
};

/** Written by scripts/sync-reviews.mjs at build time; empty when reviews are off or unavailable. */
export const googleReviews: GoogleReviews = reviewsData;

export function writeReviewUrl(placeId: string): string {
  return `https://search.google.com/local/writereview?placeid=${encodeURIComponent(placeId)}`;
}
