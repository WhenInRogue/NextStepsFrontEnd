interface CoastalSceneProps {
  className?: string;
}

/** Original Riviera cove — lighthouse headland, umbrella pines, lateen boat. */
const CoastalScene = ({ className }: CoastalSceneProps) => (
  <svg
    viewBox="0 0 1600 900"
    className={className}
    preserveAspectRatio="xMidYMid slice"
    aria-hidden
  >
    <defs>
      <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="var(--color-sand)" />
        <stop offset="52%" stopColor="var(--color-cream)" />
        <stop offset="100%" stopColor="var(--color-azure2)" />
      </linearGradient>
      <linearGradient id="sea" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="var(--color-azure2)" />
        <stop offset="100%" stopColor="var(--color-azure)" />
      </linearGradient>
    </defs>

    <rect width="1600" height="900" fill="url(#sky)" />

    <circle cx="980" cy="200" r="195" fill="var(--color-ochre)" />

    <path
      d="M0 390 C 180 350 320 375 480 345 C 680 305 820 360 1020 330 C 1180 308 1320 350 1600 320 L 1600 520 L 0 520 Z"
      fill="var(--color-azure)"
      opacity="0.38"
    />

    <path
      d="M0 430 C 200 395 380 470 620 435 C 860 400 1080 480 1320 440 C 1460 418 1540 455 1600 438 L 1600 900 L 0 900 Z"
      fill="url(#sea)"
    />
    <path
      d="M0 520 C 220 485 420 560 680 522 C 940 484 1160 575 1400 530 C 1500 512 1560 548 1600 532 L 1600 900 L 0 900 Z"
      fill="var(--color-azure)"
      opacity="0.88"
    />
    <path
      d="M0 610 C 240 575 460 655 740 612 C 1020 570 1240 668 1480 620 L 1600 640 L 1600 900 L 0 900 Z"
      fill="var(--color-ink)"
      opacity="0.22"
    />

    <path
      d="M80 540 Q 280 512 480 545 T 900 538 T 1280 558"
      fill="none"
      stroke="var(--color-cream)"
      strokeWidth="6"
      strokeLinecap="round"
      opacity="0.4"
    />
    <path
      d="M200 605 Q 460 575 720 608 T 1240 602"
      fill="none"
      stroke="var(--color-cream)"
      strokeWidth="4"
      strokeLinecap="round"
      opacity="0.28"
    />

    <path
      d="M0 740 C 260 680 520 722 780 688 C 980 662 1080 720 1180 705 L 1220 900 L 0 900 Z"
      fill="var(--color-sand)"
    />
    <path
      d="M0 808 C 250 770 520 800 790 778 C 980 762 1080 800 1160 790 L 1180 900 L 0 900 Z"
      fill="var(--color-cream2)"
    />

    {/* Headland + lighthouse — sits in the login panel crop (~440–1160) */}
    <path
      d="M1048 355 L 1600 250 L 1600 900 L 1008 900 C 1020 740 1038 560 1050 470 C 1056 422 1038 375 1048 355 Z"
      fill="var(--color-ink)"
    />
    <path
      d="M1120 445 L 1600 360 L 1600 800 L 1088 800 C 1100 650 1116 520 1120 445 Z"
      fill="var(--color-azure)"
      opacity="0.28"
    />
    <rect x="1078" y="248" width="42" height="148" rx="5" fill="var(--color-cream)" />
    <rect x="1070" y="216" width="58" height="42" rx="5" fill="var(--color-terra)" />
    <polygon points="1099,176 1070,218 1128,218" fill="var(--color-ink)" />
    <circle cx="1099" cy="237" r="10" fill="var(--color-ochre)" />

    {/* Umbrella pines */}
    <rect x="522" y="575" width="12" height="95" rx="4" fill="var(--color-ink)" />
    <ellipse cx="528" cy="555" rx="92" ry="40" fill="var(--color-ink)" />
    <ellipse cx="528" cy="532" rx="60" ry="26" fill="var(--color-azure)" opacity="0.5" />

    <rect x="658" y="630" width="10" height="78" rx="4" fill="var(--color-ink)" />
    <ellipse cx="663" cy="616" rx="64" ry="30" fill="var(--color-ink)" />
    <ellipse cx="663" cy="598" rx="42" ry="18" fill="var(--color-azure)" opacity="0.4" />

    {/* Lateen sailboat */}
    <path d="M790 655 L 950 655 C 934 676 900 688 870 688 C 840 688 808 676 790 655 Z" fill="var(--color-ink)" />
    <path d="M872 655 L 872 530" stroke="var(--color-ink)" strokeWidth="5" strokeLinecap="round" />
    <path d="M878 536 L 960 640 L 878 632 Z" fill="var(--color-cream)" />
    <path d="M866 548 L 798 638 L 866 630 Z" fill="var(--color-sand)" />
  </svg>
);

export default CoastalScene;
