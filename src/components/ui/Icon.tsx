// A small, hand-drawn line-icon set — deliberately not an emoji or a third-party
// icon library, so every glyph shares one stroke weight and sits correctly against
// the navy/brass palette (emoji render full-color regardless of surrounding text,
// which is why they were replaced here). Add new icons here rather than reaching
// for an emoji or pulling in an icon package.
import type { SVGProps } from "react";

export type IconName =
  | "grid"
  | "clipboard"
  | "clipboard-check"
  | "calendar"
  | "file"
  | "bell"
  | "chat"
  | "gear"
  | "logout"
  | "star"
  | "receipt"
  | "percent"
  | "shield"
  | "shield-check"
  | "life-ring"
  | "bolt"
  | "stanchion"
  | "target"
  | "person-shield"
  | "check"
  | "arrow-right"
  | "building"
  | "menu"
  | "close"
  | "chevron";

type IconProps = Omit<SVGProps<SVGSVGElement>, "viewBox" | "fill"> & {
  name: IconName;
  size?: number;
};

const PATHS: Record<IconName, string> = {
  grid: "M4 4h6.5v6.5H4V4Zm9.5 0H20v6.5h-6.5V4ZM4 13.5h6.5V20H4v-6.5Zm9.5 0H20V20h-6.5v-6.5Z",
  clipboard:
    "M9 4.5h6a1 1 0 0 1 1 1V6h1.5A1.5 1.5 0 0 1 19 7.5v11A1.5 1.5 0 0 1 17.5 20h-11A1.5 1.5 0 0 1 5 18.5v-11A1.5 1.5 0 0 1 6.5 6H8v-.5a1 1 0 0 1 1-1Zm0 1.5v1.5h6V6H9ZM8.5 12h7M8.5 15.5h7",
  "clipboard-check":
    "M9 4.5h6a1 1 0 0 1 1 1V6h1.5A1.5 1.5 0 0 1 19 7.5v11A1.5 1.5 0 0 1 17.5 20h-11A1.5 1.5 0 0 1 5 18.5v-11A1.5 1.5 0 0 1 6.5 6H8v-.5a1 1 0 0 1 1-1Zm0 1.5v1.5h6V6H9Zm-.75 8.75 1.85 1.85L15.5 12",
  calendar:
    "M7 3.5v3M17 3.5v3M4.5 8.5h15M5.5 6h13A1.5 1.5 0 0 1 20 7.5v11A1.5 1.5 0 0 1 18.5 20h-13A1.5 1.5 0 0 1 4 18.5v-11A1.5 1.5 0 0 1 5.5 6ZM8 12h2M14 12h2M8 15.5h2M14 15.5h2",
  file: "M8 3.5h6l4 4V19a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 6 19V5A1.5 1.5 0 0 1 8 3.5Zm5.5.3V8h4.2M9 12.5h6M9 15.75h6",
  bell: "M12 4a5 5 0 0 0-5 5v3.1c0 .5-.2 1-.55 1.37L5 15h14l-1.45-1.53A2 2 0 0 1 17 12.1V9a5 5 0 0 0-5-5Zm-2 14a2 2 0 0 0 4 0",
  chat: "M5 5.5h14A1.5 1.5 0 0 1 20.5 7v8A1.5 1.5 0 0 1 19 16.5H9.8L6 19.8V16.5H5A1.5 1.5 0 0 1 3.5 15V7A1.5 1.5 0 0 1 5 5.5Z",
  gear: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm7.4-3a7.4 7.4 0 0 1-.1 1.2l1.9 1.5-1.5 2.6-2.25-.75a7.5 7.5 0 0 1-2.05 1.2L15 20h-3l-.4-2.25a7.5 7.5 0 0 1-2.05-1.2l-2.25.75-1.5-2.6 1.9-1.5a7.4 7.4 0 0 1 0-2.4l-1.9-1.5 1.5-2.6 2.25.75a7.5 7.5 0 0 1 2.05-1.2L9 4h3l.4 2.25a7.5 7.5 0 0 1 2.05 1.2l2.25-.75 1.5 2.6-1.9 1.5c.07.39.1.79.1 1.2Z",
  logout: "M9 20H6.5A1.5 1.5 0 0 1 5 18.5v-13A1.5 1.5 0 0 1 6.5 4H9M16 16l4-4-4-4M20 12H9",
  star: "m12 4 2.32 4.7 5.18.76-3.75 3.66.89 5.16L12 15.83l-4.64 2.45.89-5.16-3.75-3.66 5.18-.76L12 4Z",
  receipt:
    "M6.5 3.5h11a.5.5 0 0 1 .5.5v16.2l-2.2-1.3-2 1.3-2-1.3-2 1.3-2-1.3-2.2 1.3V4a.5.5 0 0 1 .5-.5ZM9 8h6M9 11.25h6M9 14.5h4",
  percent:
    "M6 6 18 18M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Zm8 8a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z",
  shield: "M12 3.5 5.5 6v5.2c0 4.2 2.75 7.6 6.5 8.8 3.75-1.2 6.5-4.6 6.5-8.8V6L12 3.5Z",
  "shield-check":
    "M12 3.5 5.5 6v5.2c0 4.2 2.75 7.6 6.5 8.8 3.75-1.2 6.5-4.6 6.5-8.8V6L12 3.5Z M9 12l2 2 4-4",
  "life-ring":
    "M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm0-3.5a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9ZM6.3 6.3l3.2 3.2M17.7 6.3l-3.2 3.2M6.3 17.7l3.2-3.2M17.7 17.7l-3.2-3.2",
  bolt: "M13 3 6 13.5h5L11 21l7-10.5h-5L13 3Z",
  stanchion:
    "M6 20v-7.5a2 2 0 1 1 4 0V20M14 20v-7.5a2 2 0 1 1 4 0V20M10 14.5h4M4.5 20h15",
  target:
    "M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm0-3.5a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9Zm0-3a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z",
  "person-shield":
    "M12 3.5 6.5 5.7v4.4c0 3.55 2.3 6.4 5.5 7.4 3.2-1 5.5-3.85 5.5-7.4V5.7L12 3.5ZM12 8a1.75 1.75 0 1 1 0 3.5A1.75 1.75 0 0 1 12 8Zm-2.5 6c.4-1.2 1.4-2 2.5-2s2.1.8 2.5 2",
  check: "m5 12.5 4.5 4.5L19 7",
  "arrow-right": "M5 12h13M13 6l6 6-6 6",
  building:
    "M6.5 3.5h11a.5.5 0 0 1 .5.5v16h-12V4a.5.5 0 0 1 .5-.5ZM9 7h1.6M13.4 7H15M9 10.5h1.6M13.4 10.5H15M9 14h1.6M13.4 14H15M10 20v-3.5h4V20",
  menu: "M4 7h16M4 12h16M4 17h16",
  close: "M6 6l12 12M18 6 6 18",
  chevron: "M6 9l6 6 6-6",
};

export function Icon({ name, size = 20, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
