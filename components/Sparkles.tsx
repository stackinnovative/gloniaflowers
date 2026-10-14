const sparkles = [
  { className: "left-[10%] top-[200px] size-3 md:left-[22%] md:top-[90px] md:size-[18px]", delay: "0s", fill: "#C9A85C" },
  { className: "right-[10%] top-[320px] size-2.5 md:left-[16%] md:right-auto md:top-[420px] md:size-3", delay: "-1.2s", fill: "#B8913F" },
  { className: "hidden right-[21%] top-[140px] size-4 md:block", delay: "-1.7s", fill: "#C9A85C" },
  { className: "hidden right-[15%] top-[470px] size-3 md:block", delay: "-2.6s", fill: "#B8913F" },
];

export function Sparkles() {
  return sparkles.map((sparkle) => (
    <svg
      key={sparkle.className}
      viewBox="0 0 16 16"
      aria-hidden="true"
      focusable="false"
      className={`gl-tw pointer-events-none absolute ${sparkle.className}`}
      style={{ animationDelay: sparkle.delay }}
    >
      <path d="M8 0L9.6 6.4L16 8L9.6 9.6L8 16L6.4 9.6L0 8L6.4 6.4Z" fill={sparkle.fill} />
    </svg>
  ));
}
