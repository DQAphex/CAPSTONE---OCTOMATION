interface OctomationLogoProps {
  className?: string;
}

export default function OctomationLogo({
  className = "size-12",
}: OctomationLogoProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      aria-hidden="true"
      className={`shrink-0 ${className}`}
    >
      <defs>
        <linearGradient id="octo-gradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fdba74" />
          <stop offset="55%" stopColor="#f472b6" />
          <stop offset="100%" stopColor="#c026d3" />
        </linearGradient>
      </defs>
      <path
        fill="url(#octo-gradient)"
        d="M24 4c8.3 0 14 6.2 14 14 0 4.6-1.9 8.2-4.6 10.6 2.8 1.6 6.5 1.8 9.6.4-1.6 4.4-6.3 6.6-10.8 5.6 1.4 2.6 4.2 4.4 7.3 4.8-3.6 2.8-8.8 2.4-12-.8-.9 3-3.1 5.2-3.5 5.4-.4-.2-2.6-2.4-3.5-5.4-3.2 3.2-8.4 3.6-12 .8 3.1-.4 5.9-2.2 7.3-4.8-4.5 1-9.2-1.2-10.8-5.6 3.1 1.4 6.8 1.2 9.6-.4C11.9 26.2 10 22.6 10 18c0-7.8 5.7-14 14-14Z"
      />
      <circle cx="19" cy="18" r="2" fill="#1a1422" />
      <circle cx="29" cy="18" r="2" fill="#1a1422" />
    </svg>
  );
}
