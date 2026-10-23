// Line icons from the design reference (16×16 grid, 1px stroke).

type IconProps = { size?: number; className?: string; stroke?: string };

function Svg({ size = 16, className, stroke = "currentColor", children }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke={stroke}
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}

export function WhatsAppIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M2.5 13.5l.9-2.6A6 6 0 1 1 5.6 13z" />
    </Svg>
  );
}

export function CartIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M3 5h10l-1 9H4L3 5zM6 5V3.5a2 2 0 0 1 4 0V5" />
    </Svg>
  );
}

export function PhoneIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M3 2.5h3l1.2 3-1.7 1.1a8 8 0 0 0 3.9 3.9l1.1-1.7 3 1.2v3c0 .5-.4 1-1 1A12 12 0 0 1 2 3.5c0-.6.5-1 1-1z" />
    </Svg>
  );
}

export function PinIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M8 14.5s5-4.6 5-8.6a5 5 0 0 0-10 0c0 4 5 8.6 5 8.6z" />
      <circle cx="8" cy="6" r="1.8" />
    </Svg>
  );
}

export function DirectionsIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M14 2L2 7.2l5.2 1.6L8.8 14z" />
    </Svg>
  );
}

export function InstagramIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="2.5" y="2.5" width="11" height="11" rx="3.2" />
      <circle cx="8" cy="8" r="2.6" />
    </Svg>
  );
}

export function MenuIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M2 4.5h12M2 8h12M2 11.5h8" />
    </Svg>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M3 3l10 10M13 3L3 13" />
    </Svg>
  );
}

export function GridIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M2.5 2.5h4.5v4.5H2.5zM9 2.5h4.5v4.5H9zM2.5 9h4.5v4.5H2.5zM9 9h4.5v4.5H9z" />
    </Svg>
  );
}

export function MoonIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M11 2.5a5.5 5.5 0 1 0 2.5 9.5A6 6 0 0 1 11 2.5z" />
    </Svg>
  );
}

/** Filled gold leaf used as a bullet and divider. */
export function LeafIcon({ size = 16, className, fill = "#B8913F" }: { size?: number; className?: string; fill?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" className={className} aria-hidden="true" focusable="false">
      <path d="M2 14C2 6 7 2 14 2C14 9 9 14 2 14Z" fill={fill} />
    </svg>
  );
}
