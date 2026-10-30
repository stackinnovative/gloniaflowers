import Image from "./SiteImage";

type Corner = "tl" | "tr" | "bl" | "br";

const IMAGES = {
  tl: { src: "/images/floral-corner-tl.jpg", width: 552, height: 652 },
  br: { src: "/images/floral-corner-br.jpg", width: 564, height: 635 },
};

const POSITION: Record<Corner, string> = {
  tl: "left-0 top-0",
  tr: "right-0 top-0",
  bl: "left-0 bottom-0",
  br: "right-0 bottom-0",
};

const MIRROR = { x: "-scale-x-100", y: "-scale-y-100", xy: "-scale-100" };

type Props = {
  /** Where it sits; also picks the sway pivot. */
  corner: Corner;
  /** Which artwork to use. */
  src: keyof typeof IMAGES;
  mirror?: keyof typeof MIRROR;
  /** Fade the artwork into the hero's white background. */
  masked?: boolean;
  /** Width classes, e.g. "w-[120px] sm:w-[clamp(140px,19vw,270px)]". */
  className: string;
};

/** Decorative floral corner with a slow sway. Multiply blend drops the white background. */
export function FloralCorner({ corner, src, mirror, masked = false, className }: Props) {
  const img = IMAGES[src];
  return (
    <span
      aria-hidden="true"
      className={`gl-sway-${corner} pointer-events-none absolute block mix-blend-multiply ${POSITION[corner]} ${className}`}
    >
      {/* Mirror about the image centre; the wrapper keeps the sway pivot at its corner. */}
      <Image
        src={img.src}
        width={img.width}
        height={img.height}
        alt=""
        aria-hidden="true"
        style={masked ? {
          maskImage: "linear-gradient(to bottom, transparent 0%, #000 14%, #000 82%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, #000 14%, #000 82%, transparent 100%)",
        } : undefined}
        className={`block h-auto w-full ${mirror ? MIRROR[mirror] : ""}`}
      />
    </span>
  );
}
