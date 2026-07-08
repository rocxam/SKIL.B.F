import logoSrc from '../../../images/SkillBridge_logo_nobg.png';

export default function Logo({ className = '' }) {
  return (
    <span className={`d-flex align-items-center ${className}`}>
      <img
        src={logoSrc}
        alt="SkillBridge"
        className="navbar-brand-logo"
        style={{ height: 36, width: 'auto', objectFit: 'contain' }}
      />
      <span className="logo-text ms-2">SkillBridge</span>
    </span>
  );
}
