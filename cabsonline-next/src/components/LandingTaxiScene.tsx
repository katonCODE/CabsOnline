function TaxiTopDown({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 36 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <rect x="6" y="8" width="24" height="42" rx="7" fill="#ca8a04" />
      <rect x="8" y="6" width="20" height="42" rx="6" fill="#eab308" />
      <path d="M24 8 L28 8 L28 46 L24 46 Z" fill="#fde047" fillOpacity="0.55" />
      <rect x="10" y="8" width="16" height="11" rx="2.5" fill="#3f3f46" />
      <rect x="10" y="8" width="16" height="4" rx="2" fill="#71717a" fillOpacity="0.5" />
      <rect x="12" y="21" width="12" height="18" rx="2" fill="#facc15" />
      <rect x="14" y="23" width="8" height="3.5" rx="1" fill="#18181b" />
      <rect x="11" y="41" width="14" height="6" rx="1.5" fill="#52525b" />
      <rect x="7.5" y="5.5" width="4.5" height="2.5" rx="1" fill="#fef08a" />
      <rect x="24" y="5.5" width="4.5" height="2.5" rx="1" fill="#fef08a" />
      <rect x="8" y="5" width="3" height="1.5" rx="0.5" fill="#fffbeb" />
      <rect x="25" y="5" width="3" height="1.5" rx="0.5" fill="#fffbeb" />
      <rect x="7.5" y="48.5" width="4.5" height="2.5" rx="1" fill="#dc2626" />
      <rect x="24" y="48.5" width="4.5" height="2.5" rx="1" fill="#dc2626" />
      <rect x="8" y="49" width="3" height="1.5" rx="0.5" fill="#fca5a5" />
      <rect x="25" y="49" width="3" height="1.5" rx="0.5" fill="#fca5a5" />
      <ellipse cx="10" cy="15" rx="3.5" ry="2.2" fill="#27272a" />
      <ellipse cx="26" cy="15" rx="3.5" ry="2.2" fill="#27272a" />
      <ellipse cx="10" cy="41" rx="3.5" ry="2.2" fill="#27272a" />
      <ellipse cx="26" cy="41" rx="3.5" ry="2.2" fill="#27272a" />
      <ellipse cx="10.5" cy="14.5" rx="1.5" ry="0.9" fill="#52525b" />
      <ellipse cx="25.5" cy="14.5" rx="1.5" ry="0.9" fill="#52525b" />
      <ellipse cx="10.5" cy="40.5" rx="1.5" ry="0.9" fill="#52525b" />
      <ellipse cx="25.5" cy="40.5" rx="1.5" ry="0.9" fill="#52525b" />
    </svg>
  );
}

export default function LandingTaxiScene() {
  return (
    <div className="landing-scene absolute inset-0 overflow-hidden bg-zinc-100">
      <div className="landing-road landing-road-h landing-road-h-top" />
      <div className="landing-road landing-road-h landing-road-h-mid" />
      <div className="landing-road landing-road-h landing-road-h-bottom" />
      <div className="landing-road landing-road-v landing-road-v-left" />
      <div className="landing-road landing-road-v landing-road-v-right" />

      <div className="landing-taxi landing-taxi-a">
        <TaxiTopDown className="landing-taxi-icon landing-taxi-icon-right h-10 w-7 sm:h-12 sm:w-8" />
      </div>
      <div className="landing-taxi landing-taxi-b">
        <TaxiTopDown className="landing-taxi-icon landing-taxi-icon-left h-10 w-7 sm:h-12 sm:w-8" />
      </div>
      <div className="landing-taxi landing-taxi-c">
        <TaxiTopDown className="landing-taxi-icon landing-taxi-icon-down h-10 w-7 sm:h-12 sm:w-8" />
      </div>
      <div className="landing-taxi landing-taxi-d">
        <TaxiTopDown className="landing-taxi-icon landing-taxi-icon-up h-10 w-7 sm:h-12 sm:w-8" />
      </div>
    </div>
  );
}
