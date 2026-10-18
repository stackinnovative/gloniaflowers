import Image from "next/image";
import { googleReviews, writeReviewUrl, type Review } from "@/lib/reviews";

function Stars({ rating, size }: { rating: number; size: number }) {
  return (
    <span className="flex gap-0.5 text-gold-500" aria-hidden="true">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg key={star} width={size} height={size} viewBox="0 0 16 16" className={star <= Math.round(rating) ? "" : "opacity-25"}>
          <path fill="currentColor" d="M8 1.2l2 4.3 4.7.5-3.5 3.2 1 4.6L8 11.5l-4.2 2.3 1-4.6L1.3 6l4.7-.5z" />
        </svg>
      ))}
    </span>
  );
}

function ReviewCard({ review }: { review: Review }) {
  return (
    // relative: keeps the sr-only labels inside the scroll row instead of widening the page.
    <li className="relative flex w-[82vw] max-w-[340px] shrink-0 snap-start flex-col gap-3 border border-line border-t-[3px] border-t-gold-400 bg-white p-5 sm:w-[340px] sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <Stars rating={review.rating} size={16} />
        <span className="sr-only">{review.rating} out of 5 stars</span>
        <span aria-hidden="true" className="font-display text-[44px] leading-[0.6] text-gold-300">&ldquo;</span>
      </div>
      <blockquote className="m-0 flex-1">
        <p className="m-0 line-clamp-6 text-[15px] leading-[1.6] text-[#4A443D]">{review.text}</p>
      </blockquote>
      {review.url && (
        <a href={review.url} target="_blank" rel="noopener noreferrer" className="self-start text-[13px] font-semibold text-gold-text underline underline-offset-[3px]">
          Read on Google<span className="sr-only"> (review by {review.author})</span>
        </a>
      )}
      <div className="flex items-center gap-3 border-t border-line pt-3">
        {/* The initial shows until the photo loads, and stays if Google's photo server fails. */}
        <span aria-hidden="true" className="relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-champagne font-display text-[18px] text-gold-text">
          {review.author.charAt(0).toUpperCase()}
          {review.photo && (
            // Eager: lazy images inside a horizontal scroller can stall in Chrome; these are tiny.
            <Image src={review.photo} alt="" width={40} height={40} loading="eager" referrerPolicy="no-referrer" className="absolute inset-0 size-full object-cover" />
          )}
        </span>
        <div className="min-w-0">
          <p className="m-0 truncate text-[14px] font-bold capitalize">{review.author}</p>
          <p className="m-0 text-[12px] text-muted">{review.time} · Google</p>
        </div>
      </div>
    </li>
  );
}

/** Google rating and reviews, fetched at build time. Hidden when there are none. */
export function GoogleReviews() {
  const { rating, count, url, placeId, reviews } = googleReviews;
  if (rating === null || !reviews.length) return null;

  return (
    <section id="reviews" aria-labelledby="reviews-heading" className="bg-champagne py-[60px] lg:py-[110px]">
      <div className="mx-auto flex max-w-site flex-col items-center gap-3 px-5 text-center lg:gap-4 lg:px-7">
        <p className="m-0 font-script text-[30px] leading-none text-gold-text lg:text-[36px]">Kind words</p>
        <h2 id="reviews-heading" className="m-0 font-display text-[34px] font-normal leading-[1.08] lg:text-[clamp(40px,5vw,66px)] lg:leading-[1.05]">
          Loved in <span className="italic">Kozhikode</span>
        </h2>
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 pt-1">
          <span className="font-display text-[30px] leading-none">{rating.toFixed(1)}</span>
          <Stars rating={rating} size={20} />
          <span className="text-[14px] text-muted">
            <span className="sr-only">out of 5 stars, from </span>
            {count} Google reviews
          </span>
        </div>
      </div>

      <ul
        role="list"
        aria-label="Google reviews"
        tabIndex={0}
        className="gl-row m-0 mx-auto mt-8 flex max-w-site list-none snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-2 lg:mt-12 lg:gap-[18px] lg:px-7"
      >
        {reviews.map((review) => <ReviewCard key={`${review.author}-${review.time}`} review={review} />)}
      </ul>

      <div className="mx-auto mt-8 flex max-w-site flex-wrap items-center justify-center gap-3 px-5 lg:mt-10">
        {url && (
          <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center bg-ink px-6 py-3.5 font-caps text-[12px] font-semibold uppercase tracking-[0.14em] text-white hover:text-gold-200">
            Read all {count} reviews
          </a>
        )}
        {placeId && (
          <a href={writeReviewUrl(placeId)} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center border border-gold-500 bg-white px-6 py-3.5 font-caps text-[12px] font-semibold uppercase tracking-[0.14em] text-ink hover:text-gold-text">
            Write a review
          </a>
        )}
      </div>
      <p className="m-0 mt-4 px-5 text-center text-[12px] text-muted">Reviews from Google</p>
    </section>
  );
}
