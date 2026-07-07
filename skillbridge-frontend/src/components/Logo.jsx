export default function Logo({ className = '' }) {
  return (
    <span className={`d-flex align-items-center ${className}`}>
      <svg
        width="36"
        height="36"
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="navbar-brand-logo"
      >
        <rect x="2" y="2" width="60" height="60" rx="14" fill="#2457c5" />
        <circle cx="24" cy="26" r="8" fill="#ffffff" />
        <circle cx="26" cy="24" r="3" fill="#2457c5" />
        <circle cx="18" cy="24" r="3" fill="#2457c5" />
        <path d="M18 34C18 30 23 28 28 28C33 28 38 30 38 34" stroke="#2457c5" strokeWidth="4" strokeLinecap="round" />
        <path d="M42 22H46V42H42V22Z" fill="#0f2757" />
        <path d="M46 34H54" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />
      </svg>
      <span className="logo-text ms-2">SkillBridge</span>
    </span>
  );
}
