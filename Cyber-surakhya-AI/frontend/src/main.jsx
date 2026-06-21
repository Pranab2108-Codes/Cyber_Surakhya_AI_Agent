import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? "http://127.0.0.1:8000" : "");

const safeLocalStorage = {
  getItem(key) {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.warn("Storage write failed:", e);
    }
  },
  removeItem(key) {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.warn("Storage remove failed:", e);
    }
  }
};

const navItems = [
  { label: "New Complaint", icon: "message" },
  { label: "My Reports", icon: "file" },
  { label: "Awareness Hub", icon: "shieldStar" },
  { label: "Safety Tools", icon: "tools" },
  { label: "Contact Support", icon: "headset" },
];

const quickActions = [
  { label: "UPI Fraud", icon: "upi" },
  { label: "Banking Fraud", icon: "briefcase" },
  { label: "Credit Card Fraud", icon: "card" },
  { label: "Investment Scam", icon: "wallet" },
  { label: "Other", icon: "folderSmall" },
];

const tips = [
  "Never share OTP or PIN",
  "Banks never ask for sensitive information",
  "Report fraud as soon as possible",
  "Keep screenshots and transaction details",
];

const accountMenuItems = [
  { label: "My Profile", icon: "user" },
  { label: "Account Settings", icon: "gear" },
  { label: "Security Center", icon: "key" },
  { label: "Help & Support", icon: "headset" },
];

function Icon({ name, size = 24, className = "" }) {
  const props = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    className,
    "aria-hidden": "true",
  };

  const icons = {
    shield: (
      <svg {...props}>
        <path d="M12 3l7 2.5v5.8c0 4.6-2.9 8.3-7 9.7-4.1-1.4-7-5.1-7-9.7V5.5L12 3z" />
        <path d="M9 12.4l2 2 4-5" />
      </svg>
    ),
    aiShield: (
      <svg {...props}>
        <path d="M12 2.7l7.4 2.7v6.3c0 4.7-3.1 8.4-7.4 9.7-4.3-1.3-7.4-5-7.4-9.7V5.4L12 2.7z" />
        <path d="M9 15.7V9.5" />
        <path d="M15 15.7V9.5" />
        <path d="M9 12.6h6" />
        <path d="M8 8.5l2-2" />
        <path d="M16 8.5l-2-2" />
      </svg>
    ),
    message: (
      <svg {...props}>
        <path d="M5 6.8A3.8 3.8 0 0 1 8.8 3h6.4A3.8 3.8 0 0 1 19 6.8v4.4a3.8 3.8 0 0 1-3.8 3.8H11l-4.7 4v-4.3A3.8 3.8 0 0 1 5 11.2V6.8z" />
        <path d="M9 9h6" />
        <path d="M9 12h3.6" />
      </svg>
    ),
    file: (
      <svg {...props}>
        <path d="M7 3.5h7l3 3v14H7z" />
        <path d="M14 3.5v3h3" />
        <path d="M9.5 10h5" />
        <path d="M9.5 13h5" />
        <path d="M9.5 16h3" />
      </svg>
    ),
    folder: (
      <svg {...props}>
        <path d="M3.8 6.5h6.1l1.7 2h8.6v9.8a2.2 2.2 0 0 1-2.2 2.2H6a2.2 2.2 0 0 1-2.2-2.2z" />
      </svg>
    ),
    shieldStar: (
      <svg {...props}>
        <path d="M12 3l7 2.5v5.8c0 4.6-2.9 8.3-7 9.7-4.1-1.4-7-5.1-7-9.7V5.5L12 3z" />
        <path d="M12 8.2l.8 1.8 1.9.2-1.4 1.3.4 1.9-1.7-1-1.7 1 .4-1.9-1.4-1.3 1.9-.2z" />
      </svg>
    ),
    tools: (
      <svg {...props}>
        <path d="M14.7 6.2l3.1 3.1" />
        <path d="M16.3 4.6l3.1 3.1" />
        <path d="M7.7 17.3l8.9-8.9 2.1-4-4 2.1-8.9 8.9" />
        <path d="M5.2 14.7l4.1 4.1" />
        <path d="M4.1 18.6a2.2 2.2 0 1 0 3.1 3.1l1.3-1.3-3.1-3.1z" />
        <path d="M7.1 5.1l1.7-1.7 3 3-1.7 1.7" />
      </svg>
    ),
    headset: (
      <svg {...props}>
        <path d="M4 13v-1a8 8 0 0 1 16 0v1" />
        <path d="M6.5 12.5h-1A1.5 1.5 0 0 0 4 14v2.5A1.5 1.5 0 0 0 5.5 18h1z" />
        <path d="M17.5 18h1a1.5 1.5 0 0 0 1.5-1.5V14a1.5 1.5 0 0 0-1.5-1.5h-1z" />
        <path d="M17.5 18c-.5 2-2.2 3-5.5 3" />
      </svg>
    ),
    bell: (
      <svg {...props}>
        <path d="M18 9.4a6 6 0 0 0-12 0c0 7-2.5 6.7-2.5 8.1h17c0-1.4-2.5-1.1-2.5-8.1z" />
        <path d="M9.7 20a2.6 2.6 0 0 0 4.6 0" />
      </svg>
    ),
    alert: (
      <svg {...props}>
        <path d="M10.3 4.5a2 2 0 0 1 3.4 0l7.3 12.7a2 2 0 0 1-1.7 3H4.7a2 2 0 0 1-1.7-3z" />
        <path d="M12 8.5v4.7" />
        <path d="M12 16.7h.01" />
      </svg>
    ),
    robot: (
      <svg {...props}>
        <rect x="6" y="8" width="12" height="9.5" rx="3" />
        <path d="M12 8V5" />
        <path d="M9 5h6" />
        <path d="M9.5 12h.01" />
        <path d="M14.5 12h.01" />
        <path d="M10 15h4" />
        <path d="M4 13h2" />
        <path d="M18 13h2" />
      </svg>
    ),
    lock: (
      <svg {...props}>
        <rect x="5.5" y="10" width="13" height="10" rx="2" />
        <path d="M8.5 10V7.7a3.5 3.5 0 0 1 7 0V10" />
        <path d="M12 14v2" />
      </svg>
    ),
    user: (
      <svg {...props}>
        <path d="M12 12.5a4.3 4.3 0 1 0 0-8.6 4.3 4.3 0 0 0 0 8.6z" />
        <path d="M4.8 20.2a7.5 7.5 0 0 1 14.4 0" />
      </svg>
    ),
    gear: (
      <svg {...props}>
        <path d="M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4z" />
        <path d="M19.2 13.4a7.7 7.7 0 0 0 0-2.8l2-1.5-2-3.4-2.4 1a8.7 8.7 0 0 0-2.4-1.4L14.1 2h-4.2l-.4 3.3A8.7 8.7 0 0 0 7.2 6.7l-2.4-1-2 3.4 2 1.5a7.7 7.7 0 0 0 0 2.8l-2 1.5 2 3.4 2.4-1a8.7 8.7 0 0 0 2.4 1.4l.4 3.3h4.2l.4-3.3a8.7 8.7 0 0 0 2.4-1.4l2.4 1 2-3.4z" />
      </svg>
    ),
    key: (
      <svg {...props}>
        <circle cx="8" cy="14" r="4" />
        <path d="M11 11l8-8" />
        <path d="M16 6l2 2" />
        <path d="M14 8l2 2" />
      </svg>
    ),
    logout: (
      <svg {...props}>
        <path d="M10 4H6.5A2.5 2.5 0 0 0 4 6.5v11A2.5 2.5 0 0 0 6.5 20H10" />
        <path d="M15.5 8.5L19 12l-3.5 3.5" />
        <path d="M19 12H9" />
      </svg>
    ),
    chevronDown: (
      <svg {...props}>
        <path d="M6 9l6 6 6-6" />
      </svg>
    ),
    arrowRight: (
      <svg {...props}>
        <path d="M5 12h14" />
        <path d="M13 6l6 6-6 6" />
      </svg>
    ),
    eye: (
      <svg {...props}>
        <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6z" />
        <circle cx="12" cy="12" r="2.7" />
      </svg>
    ),
    globe: (
      <svg {...props}>
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18" />
        <path d="M12 3a13.8 13.8 0 0 1 0 18" />
        <path d="M12 3a13.8 13.8 0 0 0 0 18" />
      </svg>
    ),
    mail: (
      <svg {...props}>
        <rect x="3.5" y="5.5" width="17" height="13" rx="2.5" />
        <path d="M4.5 7.5l7.5 5.2 7.5-5.2" />
      </svg>
    ),
    phone: (
      <svg {...props}>
        <path d="M8.2 4.2l2 4.2-2.1 1.3a12.1 12.1 0 0 0 6.2 6.2l1.3-2.1 4.2 2a2 2 0 0 1 1 2.2l-.5 2.1a2.1 2.1 0 0 1-2.3 1.6C9.4 20.6 3.4 14.6 2.3 6a2.1 2.1 0 0 1 1.6-2.3L6 3.2a2 2 0 0 1 2.2 1z" />
      </svg>
    ),
    google: (
      <svg {...props}>
        <path d="M20.2 12.2c0-.7-.1-1.3-.2-1.9h-7.8v3.6h4.5a3.8 3.8 0 0 1-1.7 2.5v2.3h2.9c1.7-1.6 2.7-3.8 2.7-6.5z" />
        <path d="M12.2 20.5c2.4 0 4.4-.8 5.9-2.1l-2.9-2.3a5.4 5.4 0 0 1-8-2.8h-3v2.4a8.9 8.9 0 0 0 8 4.8z" />
        <path d="M4.2 13.3a5.3 5.3 0 0 1 0-3.4V7.5h-3a8.9 8.9 0 0 0 0 8.2z" />
        <path d="M12.2 6.5c1.3 0 2.5.5 3.4 1.3l2.6-2.6a8.8 8.8 0 0 0-6-2.3 8.9 8.9 0 0 0-8 4.8l3 2.4a5.3 5.3 0 0 1 5-3.6z" />
      </svg>
    ),
    attach: (
      <svg {...props}>
        <path d="M20 11.5l-8.5 8.5a5 5 0 0 1-7.1-7.1l9-9a3.3 3.3 0 0 1 4.7 4.7L9 17.7a1.7 1.7 0 0 1-2.4-2.4l7.8-7.8" />
      </svg>
    ),
    mic: (
      <svg {...props}>
        <rect x="9" y="3.5" width="6" height="11" rx="3" />
        <path d="M5.8 11.5a6.2 6.2 0 0 0 12.4 0" />
        <path d="M12 17.7V21" />
      </svg>
    ),
    send: (
      <svg {...props}>
        <path d="M21 3L10.7 13.3" />
        <path d="M21 3l-6.5 18-3.8-7.7L3 9.5z" />
      </svg>
    ),
    check: (
      <svg {...props}>
        <path d="M20 6L9 17l-5-5" />
      </svg>
    ),
    upi: (
      <svg {...props}>
        <path d="M8 4v9.2a3.2 3.2 0 1 1-2.2-3" />
        <path d="M8 7h7" />
        <path d="M15 7l-2-2" />
        <path d="M15 7l-2 2" />
      </svg>
    ),
    briefcase: (
      <svg {...props}>
        <path d="M8.5 7V5.5A1.5 1.5 0 0 1 10 4h4a1.5 1.5 0 0 1 1.5 1.5V7" />
        <rect x="4" y="7" width="16" height="12" rx="2" />
        <path d="M4 12h16" />
        <path d="M10 12v1.5h4V12" />
      </svg>
    ),
    card: (
      <svg {...props}>
        <rect x="3.5" y="6" width="17" height="12" rx="2" />
        <path d="M3.5 10h17" />
        <path d="M7 14.5h3" />
      </svg>
    ),
    wallet: (
      <svg {...props}>
        <path d="M5.5 7h12.2A2.3 2.3 0 0 1 20 9.3v7.4a2.3 2.3 0 0 1-2.3 2.3H6.3A2.3 2.3 0 0 1 4 16.7V6.8A1.8 1.8 0 0 1 5.8 5h10.7" />
        <path d="M16 12h4v3h-4a1.5 1.5 0 0 1 0-3z" />
      </svg>
    ),
    folderSmall: (
      <svg {...props}>
        <path d="M4 7h6l1.6 2H20v8.5A2.5 2.5 0 0 1 17.5 20h-11A2.5 2.5 0 0 1 4 17.5z" />
      </svg>
    ),
    bulb: (
      <svg {...props}>
        <path d="M9 18h6" />
        <path d="M10 21h4" />
        <path d="M8.1 14.8a6 6 0 1 1 7.8 0c-.8.7-1.2 1.4-1.4 2.2h-5c-.2-.8-.6-1.5-1.4-2.2z" />
      </svg>
    ),
  };

  return icons[name] ?? icons.shield;
}

function Sidebar({ pathname, navigateTo }) {
  const active = pathname === "/" || pathname === "/dashboard" ? "New Complaint"
               : pathname === "/my-reports" ? "My Reports"
               : pathname === "/awareness-hub" ? "Awareness Hub"
               : pathname === "/safety-tools" ? "Safety Tools"
               : pathname === "/contact-support" ? "Contact Support"
               : "";

  return (
    <aside className="sidebar" aria-label="Primary navigation">
      <div className="brand">
        <div className="brand-mark">
          <Icon name="shield" size={42} />
        </div>
        <div>
          <p className="brand-name">
            Cyber
            <span>Suraksha</span>
          </p>
          <p className="brand-tagline">Stay Safe. Report Smart.</p>
        </div>
      </div>

      <nav className="nav">
        <p className="nav-kicker">Navigation</p>
        {navItems.map((item) => (
          <button
            className={`nav-item ${active === item.label ? "active" : ""}`}
            key={item.label}
            onClick={() => {
              if (item.label === "New Complaint") {
                navigateTo("/dashboard");
              } else {
                navigateTo("/" + item.label.toLowerCase().replace(/\s+/g, "-"));
              }
            }}
            type="button"
          >
            <Icon name={item.icon} size={23} />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="privacy-card">
        <div className="privacy-icon">
          <Icon name="lock" size={22} />
        </div>
        <div>
          <h3>Your Privacy Matters</h3>
          <p>All your data is encrypted and secure with us.</p>
        </div>
        <div className="privacy-watermark">
          <Icon name="shield" size={88} />
        </div>
      </div>

      <div className="session-card">
        <span className="session-pulse" aria-hidden="true" />
        <div>
          <strong>Secure Login</strong>
          <p>Protected Session Active</p>
        </div>
        <Icon name="lock" size={18} />
      </div>
    </aside>
  );
}

function AccountMenu({ onLogout, userName = "Omkar", onSelectMenuItem }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="account-menu">
      <button
        className={`account-trigger ${open ? "open" : ""}`}
        type="button"
        aria-expanded={open}
        aria-label="Open account menu"
        onClick={() => setOpen((current) => !current)}
      >
        <span className="account-avatar">
          {userName.charAt(0).toUpperCase()}
          <span className="online-dot" aria-hidden="true" />
        </span>
        <span className="account-name">{userName}</span>
        <Icon name="chevronDown" size={16} />
      </button>

      {open && (
        <div className="account-dropdown">
          <div className="account-summary">
            <span className="account-avatar large">
              {userName.charAt(0).toUpperCase()}
              <span className="online-dot" aria-hidden="true" />
            </span>
            <div>
              <strong>{userName}</strong>
              <p>Verified secure account</p>
            </div>
          </div>
          <div className="account-divider" />
          {accountMenuItems.map((item) => (
            <button 
              className="account-menu-item" 
              type="button" 
              key={item.label}
              onClick={() => {
                setOpen(false);
                if (onSelectMenuItem) {
                  onSelectMenuItem(item.label);
                }
              }}
            >
              <Icon name={item.icon} size={18} />
              <span>{item.label}</span>
            </button>
          ))}
          <button className="account-menu-item logout" type="button" onClick={onLogout}>
            <Icon name="logout" size={18} />
            <span>Logout</span>
          </button>
        </div>
      )}
    </div>
  );
}

function Header({ onLogout, userName, onSelectMenuItem }) {
  return (
    <header className="header">
      <div className="title-group">
        <div className="title-mark">
          <Icon name="aiShield" size={42} />
        </div>
        <div>
          <h1>Cyber Suraksha AI</h1>
          <p>Your AI Cyber Fraud Reporting Assistant</p>
          <div className="header-meta">
            <span>
              <Icon name="lock" size={14} />
              Last login: Today 10:42 AM
            </span>
            <span className="secure-chip">
              <Icon name="shield" size={14} />
              Secure Account
            </span>
          </div>
        </div>
      </div>

      <div className="header-actions">
        <button className="icon-button" aria-label="Notifications" type="button">
          <Icon name="bell" size={23} />
        </button>
        <AccountMenu onLogout={onLogout} userName={userName} onSelectMenuItem={onSelectMenuItem} />
      </div>
    </header>
  );
}

function AiAvatar() {
  return (
    <div className="ai-avatar">
      <Icon name="robot" size={28} />
    </div>
  );
}

function ChatMessage({ children, type = "ai", time }) {
  return (
    <div className={`message-row ${type}`}>
      {type === "ai" && <AiAvatar />}
      <div className={`message-bubble ${type}`}>
        <div className="message-copy">{children}</div>
        <div className="message-meta">
          <span>{time}</span>
          {type === "user" && <span className="sent-checks">✓✓</span>}
        </div>
      </div>
    </div>
  );
}

function ChatPanel({ messages, isTyping, onSendMessage, onUploadPdf }) {
  const [draft, setDraft] = useState("");
  const fileInputRef = React.useRef(null);
  const chatEndRef = React.useRef(null);

  React.useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (draft.trim()) {
      onSendMessage(draft);
      setDraft("");
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      onUploadPdf(file);
    }
  };

  return (
    <section className="chat-panel" aria-label="AI complaint chat">
      <div className="chat-stream" style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 270px)' }}>
        {messages.map((msg, index) => (
          <ChatMessage 
            key={index} 
            type={msg.role === "user" ? "user" : "ai"} 
            time={msg.time || "Just Now"}
          >
            <p>{msg.content}</p>
          </ChatMessage>
        ))}

        {isTyping && (
          <ChatMessage type="ai" time="Scanning...">
            <div className="typing-bubble-dots" style={{ display: 'flex', gap: '5px', alignItems: 'center', height: '22px' }}>
              <span className="typing-dot" style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#12dcff', animation: 'typing-pulse 1s infinite alternate' }}></span>
              <span className="typing-dot" style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#12dcff', animation: 'typing-pulse 1s infinite alternate 0.3s' }}></span>
              <span className="typing-dot" style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#12dcff', animation: 'typing-pulse 1s infinite alternate 0.6s' }}></span>
            </div>
          </ChatMessage>
        )}
        <div ref={chatEndRef} />
      </div>

      <div className="trust-strip" aria-label="Report protection details">
        <span>
          <Icon name="lock" size={15} />
          End-to-End Encrypted
        </span>
        <span>
          <Icon name="shield" size={15} />
          Your reports are securely protected
        </span>
        <span>
          <Icon name="folder" size={15} />
          Evidence vault locked
        </span>
      </div>

      <form className="input-bar" onSubmit={handleSubmit}>
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept=".pdf" 
          style={{ display: 'none' }} 
        />
        <button 
          className="input-icon" 
          aria-label="Attach evidence" 
          type="button"
          onClick={() => fileInputRef.current?.click()}
        >
          <Icon name="attach" size={26} />
        </button>
        <span className="evidence-badge">
          <Icon name="lock" size={13} />
          Encrypted
        </span>
        <input
          aria-label="Message"
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Type your message or upload a transaction PDF..."
          value={draft}
        />
        <button className="input-icon" aria-label="Voice input" type="button">
          <Icon name="mic" size={25} />
        </button>
        <button className="send-button" aria-label="Send message" type="submit">
          <Icon name="send" size={24} />
        </button>
      </form>
    </section>
  );
}



function TipsCard() {
  return (
    <section className="side-card tips-card" aria-labelledby="tips-title">
      <div className="card-title-row">
        <Icon name="bulb" size={21} />
        <h2 id="tips-title">Quick Tips</h2>
      </div>
      <ul>
        {tips.map((tip) => (
          <li key={tip}>
            <span>
              <Icon name="check" size={14} />
            </span>
            {tip}
          </li>
        ))}
      </ul>
    </section>
  );
}


const getActivePhase = (d, reportUrl) => {
  if (reportUrl) return 6;
  if (d.amount_lost && (d.reported_to_bank || d.called_1930 || d.complaint_submitted_i4c)) return 5;
  if (d.timeline_events && d.timeline_events.length > 0) return 4;
  if (d.scam_category) {
    if (d.fraudster_phone || d.bank_name || d.upi_id || d.transaction_id || d.device_type) {
      return 3;
    }
    return 2;
  }
  return 1;
};

function InvestigationPhasesCard({ extractedData, reportUrl }) {
  const activePhase = getActivePhase(extractedData, reportUrl);
  const phases = [
    { num: 1, label: "Victim Registration", desc: "Generic profile & Aadhaar verification" },
    { num: 2, label: "Scam Auto-Detection", desc: "AI category classification" },
    { num: 3, label: "Cyber Probing", desc: "Category-tailored deep questioning" },
    { num: 4, label: "Timeline Reconstruction", desc: "Chronological event logs" },
    { num: 5, label: "Loss & Bank Lock", desc: "Loss mapping & account freeze" },
    { num: 6, label: "I4C PDF Compile", desc: "Government complaint file ready" }
  ];

  return (
    <section className="side-card phases-card" aria-labelledby="phases-title">
      <div className="card-title-row">
        <Icon name="aiShield" size={20} className="phases-glow-icon" />
        <h2 id="phases-title">Investigation Stages</h2>
      </div>
      <div className="phases-stepper">
        {phases.map((p) => {
          const isActive = p.num === activePhase;
          const isCompleted = p.num < activePhase;
          return (
            <div 
              key={p.num} 
              className={`phase-step ${isActive ? "active" : ""} ${isCompleted ? "completed" : ""}`}
            >
              <div className="phase-indicator-dot">
                {isCompleted ? (
                  <Icon name="check" size={12} className="check-icon" />
                ) : (
                  <span>{p.num}</span>
                )}
              </div>
              <div className="phase-text-block">
                <h3>{p.label}</h3>
                <p>{p.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
      {reportUrl && (
        <div style={{ marginTop: '16px' }}>
          <a 
            href={`${API_BASE_URL}${reportUrl}`} 
            target="_blank" 
            rel="noreferrer" 
            style={{
              display: 'inline-flex',
              minHeight: '34px',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #2b7dff, #7559ff)',
              color: '#ffffff',
              fontWeight: 'bold',
              fontSize: '12px',
              textDecoration: 'none',
              boxShadow: '0 8px 24px rgba(43, 125, 255, 0.25)',
              transition: 'transform 180ms ease',
              width: '100%'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <Icon name="file" size={14} />
            <span>Download Gov-Standard PDF</span>
          </a>
        </div>
      )}
    </section>
  );
}

function TimelineTrackerCard({ timelineEvents }) {
  if (!timelineEvents || timelineEvents.length === 0) {
    return (
      <section className="side-card timeline-card empty" aria-labelledby="timeline-title">
        <div className="card-title-row">
          <Icon name="file" size={20} />
          <h2 id="timeline-title">Chronological Timeline</h2>
        </div>
        <div className="empty-timeline-state">
          <div className="radar-circle" />
          <p>Awaiting incident description to reconstruct the timeline...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="side-card timeline-card" aria-labelledby="timeline-title">
      <div className="card-title-row">
        <Icon name="file" size={20} className="timeline-active-icon" />
        <h2 id="timeline-title">Chronological Timeline</h2>
      </div>
      <div className="timeline-flow-container">
        {timelineEvents.map((evt, idx) => {
          const splitIdx = evt.indexOf(":");
          let timeLabel = "Event";
          let eventText = evt;
          if (splitIdx > 0 && splitIdx < 20) {
            const possibleTime = evt.substring(0, splitIdx).trim();
            if (possibleTime.toLowerCase().includes("pm") || possibleTime.toLowerCase().includes("am") || /\d+/.test(possibleTime)) {
              timeLabel = possibleTime;
              eventText = evt.substring(splitIdx + 1).trim();
            }
          }
          return (
            <div key={idx} className="timeline-event-row">
              <div className="timeline-event-marker">
                <span className="glowing-marker-dot" />
                {idx < timelineEvents.length - 1 && <span className="timeline-connector-line" />}
              </div>
              <div className="timeline-event-bubble">
                <span className="timeline-event-time">{timeLabel}</span>
                <p className="timeline-event-desc">{eventText}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function RightPanel({ progress, reportUrl, extractedData }) {
  return (
    <aside className="right-panel" aria-label="Complaint support panel">
      <InvestigationPhasesCard extractedData={extractedData} reportUrl={reportUrl} />
      <TimelineTrackerCard timelineEvents={extractedData.timeline_events} />
      <TipsCard />
    </aside>
  );
}

function ProfileSection({ userName, onBack }) {
  const [revealed, setRevealed] = useState({
    name: false,
    age: false,
    address: false,
    pan: false,
    aadhaar: false,
    email: false,
    phone: false,
  });

  const rawData = {
    name: "omkar mahanandia",
    age: "26 Years",
    address: "Plot 42, Cyber Security Enclave, Hyderabad, India",
    pan: "ABCDE1234F",
    aadhaar: "4321 8765 9012",
    email: "omkar.mahanandia@cyber.gov.in",
    phone: "+91 98765 43210"
  };

  const maskedData = {
    name: "om*** ma********",
    age: "2* Years",
    address: "Pl** **, Cy*** Se****** En*****, Hyderabad, India",
    pan: "ABCDE****F",
    aadhaar: "XXXX XXXX 9012",
    email: "om***@cyber.gov.in",
    phone: "+91 ******3210"
  };

  const toggleReveal = (field) => {
    setRevealed(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const toggleAll = () => {
    const allRevealed = Object.values(revealed).every(Boolean);
    const targetState = !allRevealed;
    setRevealed({
      name: targetState,
      age: targetState,
      address: targetState,
      pan: targetState,
      aadhaar: targetState,
      email: targetState,
      phone: targetState,
    });
  };

  const isAllRevealed = Object.values(revealed).every(Boolean);

  return (
    <div className="profile-grid">
      <div className="side-card profile-card-left">
        <div className="profile-avatar-large">
          {rawData.name.charAt(0).toUpperCase()}
        </div>
        <h2 style={{ margin: 0, textTransform: 'capitalize', color: '#ffffff' }}>{rawData.name}</h2>
        <span className="profile-status-badge">
          <Icon name="shield" size={14} />
          Verified Secure Account
        </span>

        <div className="profile-security-score">
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#afbdd1', fontWeight: 'bold' }}>
            <span>Security Strength</span>
            <span style={{ color: 'var(--cyan)' }}>92% Excellent</span>
          </div>
          <div className="security-score-bar">
            <div className="security-score-fill" />
          </div>
        </div>

        <div style={{ width: '100%', display: 'grid', gap: '8px', fontSize: '12px', color: '#8fa1ba', textAlign: 'left', borderTop: '1px solid rgba(100,160,235,0.1)', paddingTop: '16px', margin: '8px 0 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Session Standard:</span>
            <strong style={{ color: '#ffffff' }}>AES-256 GCM</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Identity Node:</span>
            <strong style={{ color: '#ffffff' }}>IN-SEC-092</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Access Tier:</span>
            <strong style={{ color: 'var(--green)' }}>Priority Level A</strong>
          </div>
        </div>

        <button className="profile-back-btn" onClick={onBack} type="button">
          <Icon name="chevronDown" size={16} style={{ transform: 'rotate(90deg)' }} />
          <span>Back to Dashboard</span>
        </button>
      </div>

      <div className="side-card profile-vault-card">
        <div className="vault-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Icon name="lock" size={22} style={{ color: 'var(--cyan)' }} />
            <h2>Sensitive Identity Vault</h2>
          </div>
          <button className="vault-toggle-all" onClick={toggleAll} type="button">
            <Icon name="eye" size={14} />
            <span>{isAllRevealed ? "Mask All Fields" : "Reveal All Fields"}</span>
          </button>
        </div>

        <div className="vault-fields-container">
          {[
            { key: "name", label: "Full Name", icon: "user" },
            { key: "age", label: "Age / DOB", icon: "bulb" },
            { key: "email", label: "Email Address", icon: "mail" },
            { key: "phone", label: "Mobile Number", icon: "phone" },
            { key: "pan", label: "PAN Number", icon: "card" },
            { key: "aadhaar", label: "Aadhaar Card", icon: "shield" },
            { key: "address", label: "Primary Address", icon: "globe" }
          ].map((field) => (
            <div className="vault-field-row" key={field.key}>
              <span className="vault-field-label">
                <Icon name={field.icon} size={16} />
                {field.label}
              </span>
              <span className="vault-field-value">
                {revealed[field.key] ? rawData[field.key] : maskedData[field.key]}
              </span>
              <button 
                className="vault-field-eye" 
                onClick={() => toggleReveal(field.key)} 
                type="button"
                aria-label={revealed[field.key] ? "Hide field content" : "Reveal field content"}
              >
                <Icon name="eye" size={16} style={{ color: revealed[field.key] ? 'var(--cyan)' : 'inherit' }} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AccountSettingsSection({ onBack }) {
  const [activeCategory, setActiveCategory] = useState("security");
  const [twoFactorEmail, setTwoFactorEmail] = useState(false);
  const [twoFactorSms, setTwoFactorSms] = useState(true);
  const [accessPinEnabled, setAccessPinEnabled] = useState(false);
  const [pinCode, setPinCode] = useState("****");
  const [retentionPolicy, setRetentionPolicy] = useState("30");
  const [autofillConsent, setAutofillConsent] = useState(true);
  const [language, setLanguage] = useState("en");
  const [alertChannel, setAlertChannel] = useState("all");

  const [activeSessions, setActiveSessions] = useState([
    { id: 1, device: "Chrome on Windows 11", location: "Hyderabad, India", ip: "192.168.1.42", current: true },
    { id: 2, device: "Safari on iPhone 15 Pro", location: "Bangalore, India", ip: "103.88.22.14", current: false },
    { id: 3, device: "Vivaldi on macOS Sonoma", location: "Mumbai, India", ip: "172.56.88.91", current: false }
  ]);

  const handleRevokeSession = (id) => {
    setActiveSessions(prev => prev.filter(s => s.id !== id));
  };

  return (
    <div className="profile-grid">
      {/* Left panel for settings menu */}
      <div className="side-card profile-card-left">
        <h2 style={{ margin: '0 0 20px', color: '#ffffff', fontSize: '18px', alignSelf: 'flex-start' }}>System Settings</h2>
        
        <div style={{ display: 'grid', gap: '8px', width: '100%' }}>
          <button 
            className={`settings-menu-item ${activeCategory === "security" ? "active" : ""}`}
            onClick={() => setActiveCategory("security")}
            type="button"
          >
            <Icon name="key" size={16} />
            <span>Security & Access</span>
          </button>
          <button 
            className={`settings-menu-item ${activeCategory === "privacy" ? "active" : ""}`}
            onClick={() => setActiveCategory("privacy")}
            type="button"
          >
            <Icon name="lock" size={16} />
            <span>Data & Privacy</span>
          </button>
          <button 
            className={`settings-menu-item ${activeCategory === "preferences" ? "active" : ""}`}
            onClick={() => setActiveCategory("preferences")}
            type="button"
          >
            <Icon name="gear" size={16} />
            <span>Preferences</span>
          </button>
        </div>

        <div className="profile-security-score">
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#afbdd1', fontWeight: 'bold' }}>
            <span>Security Shield Level</span>
            <span style={{ color: 'var(--cyan)' }}>High Guard</span>
          </div>
          <div className="security-score-bar">
            <div className="security-score-fill" style={{ width: '85%' }} />
          </div>
        </div>

        <button className="profile-back-btn" onClick={onBack} type="button">
          <Icon name="chevronDown" size={16} style={{ transform: 'rotate(90deg)' }} />
          <span>Back to Dashboard</span>
        </button>
      </div>

      {/* Right panel for dynamically selected settings category content */}
      <div className="side-card profile-vault-card">
        {activeCategory === "security" && (
          <>
            <div className="vault-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Icon name="key" size={22} style={{ color: 'var(--cyan)' }} />
                <h2>Security & Access Control</h2>
              </div>
            </div>
            
            <div className="vault-fields-container">
              {/* 2FA Email Row */}
              <div className="vault-field-row">
                <span className="vault-field-label">
                  <Icon name="mail" size={16} />
                  Email OTP 2FA
                </span>
                <span className="vault-field-value" style={{ color: '#8fa1ba' }}>
                  {twoFactorEmail ? "Active Protection" : "Inactive"}
                </span>
                <div className="switch-container">
                  <label className="switch-control">
                    <input 
                      type="checkbox" 
                      checked={twoFactorEmail} 
                      onChange={(e) => setTwoFactorEmail(e.target.checked)}
                    />
                    <span className="slider-round" />
                  </label>
                </div>
              </div>

              {/* 2FA SMS Row */}
              <div className="vault-field-row">
                <span className="vault-field-label">
                  <Icon name="phone" size={16} />
                  SMS OTP 2FA
                </span>
                <span className="vault-field-value" style={{ color: '#8fa1ba' }}>
                  {twoFactorSms ? "Active Protection" : "Inactive"}
                </span>
                <div className="switch-container">
                  <label className="switch-control">
                    <input 
                      type="checkbox" 
                      checked={twoFactorSms} 
                      onChange={(e) => setTwoFactorSms(e.target.checked)}
                    />
                    <span className="slider-round" />
                  </label>
                </div>
              </div>

              {/* App PIN lock */}
              <div className="vault-field-row">
                <span className="vault-field-label">
                  <Icon name="lock" size={16} />
                  Vault Security PIN
                </span>
                <span className="vault-field-value" style={{ fontFamily: 'monospace' }}>
                  {accessPinEnabled ? pinCode : "Disabled"}
                </span>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  {accessPinEnabled && (
                    <button 
                      onClick={() => {
                        const newPin = prompt("Enter a new 4-digit security PIN:");
                        if (newPin && newPin.length === 4 && !isNaN(newPin)) {
                          setPinCode(newPin);
                        } else if (newPin) {
                          alert("PIN must be exactly 4 numeric digits.");
                        }
                      }}
                      style={{ border: '1px solid rgba(18,220,255,0.3)', borderRadius: '6px', padding: '4px 8px', color: 'var(--cyan)', background: 'transparent', fontSize: '11px', cursor: 'pointer' }}
                      type="button"
                    >
                      Change PIN
                    </button>
                  )}
                  <label className="switch-control">
                    <input 
                      type="checkbox" 
                      checked={accessPinEnabled} 
                      onChange={(e) => setAccessPinEnabled(e.target.checked)}
                    />
                    <span className="slider-round" />
                  </label>
                </div>
              </div>

              {/* Active Sessions list */}
              <div style={{ marginTop: '16px' }}>
                <h3 style={{ margin: '0 0 10px', color: '#ffffff', fontSize: '14px', fontWeight: '800' }}>Active System Logins</h3>
                <div className="session-list">
                  {activeSessions.map((session) => (
                    <div className="session-item" key={session.id}>
                      <div className="session-meta">
                        <Icon name="shield" size={20} style={{ color: session.current ? 'var(--green)' : '#8fa1ba' }} />
                        <div className="session-info">
                          <span className="session-device">
                            {session.device}
                            {session.current && <span style={{ color: 'var(--green)', fontSize: '10px', marginLeft: '8px', fontWeight: 'bold' }}>(This Device)</span>}
                          </span>
                          <span className="session-details">{session.location} • IP: {session.ip}</span>
                        </div>
                      </div>
                      {!session.current && (
                        <button 
                          className="session-revoke-btn" 
                          onClick={() => handleRevokeSession(session.id)}
                          type="button"
                        >
                          Revoke Access
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {activeCategory === "privacy" && (
          <>
            <div className="vault-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Icon name="lock" size={22} style={{ color: 'var(--cyan)' }} />
                <h2>Data Privacy & Consent Settings</h2>
              </div>
            </div>

            <div className="vault-fields-container">
              {/* Evidence Vault Data Retention Selector */}
              <div className="vault-field-row">
                <span className="vault-field-label">
                  <Icon name="folder" size={16} />
                  Vault Retention Policy
                </span>
                <span className="vault-field-value" style={{ color: '#8fa1ba' }}>
                  Auto-clear uploaded files
                </span>
                <select 
                  className="settings-select" 
                  value={retentionPolicy} 
                  onChange={(e) => setRetentionPolicy(e.target.value)}
                >
                  <option value="30">30 Days (Recommended)</option>
                  <option value="90">90 Days</option>
                  <option value="180">180 Days</option>
                  <option value="0">Never Auto-Delete</option>
                </select>
              </div>

              {/* Autofill consent toggle */}
              <div className="vault-field-row">
                <span className="vault-field-label">
                  <Icon name="file" size={16} />
                  Auto-Fill Gov Portals
                </span>
                <span className="vault-field-value" style={{ color: '#8fa1ba' }}>
                  Draft complaint filling
                </span>
                <div className="switch-container">
                  <label className="switch-control">
                    <input 
                      type="checkbox" 
                      checked={autofillConsent} 
                      onChange={(e) => setAutofillConsent(e.target.checked)}
                    />
                    <span className="slider-round" />
                  </label>
                </div>
              </div>

              {/* Encryption info */}
              <div style={{ marginTop: '20px', padding: '16px', background: 'rgba(39, 212, 111, 0.04)', border: '1px solid rgba(39, 212, 111, 0.16)', borderRadius: '12px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <Icon name="shield" size={22} style={{ color: 'var(--green)', flexShrink: 0 }} />
                <div>
                  <h4 style={{ margin: 0, color: 'var(--green)', fontSize: '13px', fontWeight: 'bold' }}>Military-Grade Storage Protection</h4>
                  <p style={{ margin: '6px 0 0', fontSize: '12px', color: '#8fa1ba', lineHeight: '1.4' }}>All uploaded transaction statements, IDs, and cyber fraud files are encrypted locally before transmission using authenticated 256-bit AES cryptographic structures.</p>
                </div>
              </div>
            </div>
          </>
        )}

        {activeCategory === "preferences" && (
          <>
            <div className="vault-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Icon name="gear" size={22} style={{ color: 'var(--cyan)' }} />
                <h2>Local Portal Preferences</h2>
              </div>
            </div>

            <div className="vault-fields-container">
              {/* Language selection dropdown */}
              <div className="vault-field-row">
                <span className="vault-field-label">
                  <Icon name="globe" size={16} />
                  Portal Interface Language
                </span>
                <span className="vault-field-value" style={{ color: '#8fa1ba' }}>
                  Adjust text representation
                </span>
                <select 
                  className="settings-select" 
                  value={language} 
                  onChange={(e) => setLanguage(e.target.value)}
                >
                  <option value="en">English (Global)</option>
                  <option value="hi">हिन्दी (Hindi)</option>
                  <option value="mr">मराठी (Marathi)</option>
                  <option value="te">తెలుగు (Telugu)</option>
                  <option value="ta">தமிழ் (Tamil)</option>
                  <option value="bn">বাংলা (Bengali)</option>
                </select>
              </div>

              {/* Delivery channel */}
              <div className="vault-field-row">
                <span className="vault-field-label">
                  <Icon name="bell" size={16} />
                  Notification Alerts
                </span>
                <span className="vault-field-value" style={{ color: '#8fa1ba' }}>
                  Target notification channel
                </span>
                <select 
                  className="settings-select" 
                  value={alertChannel} 
                  onChange={(e) => setAlertChannel(e.target.value)}
                >
                  <option value="all">SMS, WhatsApp & Email</option>
                  <option value="whatsapp">WhatsApp Only</option>
                  <option value="email">Email Only</option>
                  <option value="none">Disable All Alerts</option>
                </select>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function SecurityCenterSection({ onBack }) {
  const [scanState, setScanState] = useState("idle"); // "idle", "scanning", "done"
  const [scanStep, setScanStep] = useState(0);
  const [scanLogs, setScanLogs] = useState([]);
  
  const [phishingInput, setPhishingInput] = useState("");
  const [assessmentResult, setAssessmentResult] = useState(null); // null, "low", "medium", "high"
  const [assessmentScore, setAssessmentScore] = useState(0);

  const scanSteps = [
    { text: "Auditing connection standard...", result: "AES-256 GCM SECURE" },
    { text: "Validating browser sandbox headers...", result: "INTEGRITY OK" },
    { text: "Scanning client cookie vault...", result: "NO LEAKS DETECTED" },
    { text: "Checking DNS leakage vectors...", result: "SECURE NODE" }
  ];

  useEffect(() => {
    if (scanState !== "scanning") return;

    if (scanStep < scanSteps.length) {
      const timer = setTimeout(() => {
        setScanLogs(prev => [...prev, { 
          text: scanSteps[scanStep].text, 
          result: scanSteps[scanStep].result, 
          success: true 
        }]);
        setScanStep(prev => prev + 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setScanState("done");
    }
  }, [scanState, scanStep]);

  const handleStartScan = () => {
    setScanState("scanning");
    setScanStep(0);
    setScanLogs([{ text: "Initializing diagnostic scan...", result: "STARTED", success: true }]);
  };

  const handleAssessThreat = (e) => {
    e.preventDefault();
    if (!phishingInput.trim()) return;

    const text = phishingInput.toLowerCase();
    let score = 15;
    let result = "low";

    if (
      text.includes("http://") || 
      text.includes("free") || 
      text.includes("win") || 
      text.includes("gift") || 
      text.includes("lottery") || 
      text.includes("bit.ly") || 
      text.includes("t.co") || 
      text.includes("paytm") || 
      text.includes("upi") || 
      text.includes("phonepe") || 
      text.includes("bonus") || 
      text.includes("reward") || 
      text.includes("update-account")
    ) {
      score = Math.floor(Math.random() * 15) + 84; // 84-98%
      result = "high";
    } else if (
      text.includes("sbi") || 
      text.includes("hdfc") || 
      text.includes("banking") || 
      text.includes("verification") || 
      text.includes("security") || 
      text.includes("support") || 
      text.includes(".net") || 
      text.includes(".xyz")
    ) {
      score = Math.floor(Math.random() * 20) + 50; // 50-70%
      result = "medium";
    } else {
      score = Math.floor(Math.random() * 20) + 5; // 5-25%
      result = "low";
    }

    setAssessmentScore(score);
    setAssessmentResult(result);
  };

  return (
    <div className="profile-grid">
      {/* Left Panel: Diagnostic Scanner */}
      <div className="side-card profile-card-left" style={{ justifyContent: 'flex-start' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', alignSelf: 'flex-start', margin: '0 0 16px' }}>
          <Icon name="shield" size={22} style={{ color: 'var(--cyan)' }} />
          <h2 style={{ margin: 0, color: '#ffffff', fontSize: '18px' }}>Security Diagnostic</h2>
        </div>

        {scanState === "idle" && (
          <div className="risk-level-banner">
            <Icon name="check" size={18} />
            <div style={{ textAlign: 'left' }}>
              <strong>Vulnerability Shield Active</strong>
              <p style={{ margin: '2px 0 0', fontSize: '11px', opacity: 0.8 }}>Ready for local security validation</p>
            </div>
          </div>
        )}

        {scanState === "scanning" && (
          <div className="risk-level-banner scanning">
            <span className="session-pulse" style={{ background: 'var(--cyan)', boxShadow: '0 0 10px var(--cyan)' }} />
            <div style={{ textAlign: 'left' }}>
              <strong>Running Diagnostic Check...</strong>
              <p style={{ margin: '2px 0 0', fontSize: '11px', opacity: 0.8 }}>Scanning browser sandbox nodes</p>
            </div>
          </div>
        )}

        {scanState === "done" && (
          <div className="risk-level-banner">
            <Icon name="check" size={18} />
            <div style={{ textAlign: 'left' }}>
              <strong>All Node Checks Passed</strong>
              <p style={{ margin: '2px 0 0', fontSize: '11px', opacity: 0.8 }}>Device is fully verified & secure</p>
            </div>
          </div>
        )}

        <div className="scan-radar-wrapper">
          <div className="scan-radar-glow" />
          <Icon 
            name={scanState === "scanning" ? "robot" : "shield"} 
            size={50} 
            style={{ 
              color: scanState === "scanning" ? 'var(--cyan)' : 'var(--green)',
              filter: scanState === "scanning" ? 'drop-shadow(0 0 12px rgba(18,220,255,0.6))' : 'drop-shadow(0 0 12px rgba(39,212,111,0.4))',
              zIndex: 3 
            }} 
          />
        </div>

        {scanLogs.length > 0 && (
          <div className="scan-log-box" style={{ marginBottom: '20px' }}>
            {scanLogs.map((log, idx) => (
              <div className="scan-log-line" key={idx}>
                <span>&gt; {log.text}</span>
                <span className={log.success ? "scan-log-success" : "scan-log-progress"}>
                  {log.result}
                </span>
              </div>
            ))}
            {scanState === "scanning" && (
              <div className="scan-log-line">
                <span className="scan-log-progress">&gt; Performing diagnostic checks...</span>
              </div>
            )}
          </div>
        )}

        <button 
          className="profile-back-btn" 
          onClick={handleStartScan}
          disabled={scanState === "scanning"}
          style={{ 
            background: scanState === "scanning" ? 'rgba(255,255,255,0.05)' : '',
            borderColor: scanState === "scanning" ? 'rgba(255,255,255,0.08)' : '',
            color: scanState === "scanning" ? '#7f8da3' : '',
            cursor: scanState === "scanning" ? 'not-allowed' : 'pointer',
            marginBottom: '12px',
            marginTop: 'auto'
          }}
          type="button"
        >
          <Icon name="tools" size={16} />
          <span>{scanState === "scanning" ? "Scanning Session..." : "Run System Diagnostics"}</span>
        </button>

        <button className="profile-back-btn" onClick={onBack} type="button" style={{ marginTop: '0' }}>
          <Icon name="chevronDown" size={16} style={{ transform: 'rotate(90deg)' }} />
          <span>Back to Dashboard</span>
        </button>
      </div>

      {/* Right Panel: Threat Ticker Feed & Heuristic Assessor */}
      <div className="side-card profile-vault-card">
        {/* Threat Assessor Section */}
        <div className="vault-header" style={{ marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Icon name="robot" size={22} style={{ color: 'var(--cyan)' }} />
            <h2>AI Phishing & Scam Threat Assessor</h2>
          </div>
        </div>

        <p style={{ margin: '0 0 12px', fontSize: '13px', color: '#8fa1ba', lineHeight: '1.4' }}>
          Paste a suspicious website URL, link, or email message contents below to let the security engine calculate its fraud signature score.
        </p>

        <form onSubmit={handleAssessThreat} className="assessor-card" style={{ marginBottom: '20px' }}>
          <div className="assessor-input-row">
            <input 
              type="text"
              className="assessor-input"
              placeholder="Paste suspect URL or copy-pasted text..."
              value={phishingInput}
              onChange={(e) => setPhishingInput(e.target.value)}
              required
            />
            <button className="assessor-btn" type="submit">
              <Icon name="tools" size={15} />
              <span>Scan Threat</span>
            </button>
          </div>

          {assessmentResult && (
            <div className={`assessment-result-banner ${assessmentResult}`}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Icon name="alert" size={16} />
                <span>
                  Scan Signature: <strong>{assessmentResult.toUpperCase()} RISK</strong>
                </span>
              </div>
              <span>Threat Level: {assessmentScore}%</span>
            </div>
          )}
        </form>

        {/* Live Threat Feed Ticker */}
        <div className="vault-header" style={{ marginBottom: '10px', borderTop: '1px solid rgba(100,160,235,0.1)', paddingTop: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Icon name="bell" size={20} style={{ color: '#ff8b98' }} />
            <h2 style={{ fontSize: '15px' }}>Live Cyber Scam Advisory Feed</h2>
          </div>
        </div>

        <div className="threat-ticker-container">
          <div className="threat-ticker-item">
            <Icon name="alert" size={16} style={{ color: '#ff8b98', flexShrink: 0 }} />
            <div>
              <strong>SBI Yono Phishing APK scam circulating:</strong> Malicious APK links delivered via SMS claiming account suspensions. Do not install.
            </div>
          </div>
          <div className="threat-ticker-item">
            <Icon name="alert" size={16} style={{ color: '#ff8b98', flexShrink: 0 }} />
            <div>
              <strong>Electricity bill update scam active:</strong> Callers pretending to be power board agents requesting remote access app installations.
            </div>
          </div>
          <div className="threat-ticker-item">
            <Icon name="alert" size={16} style={{ color: '#ff8b98', flexShrink: 0 }} />
            <div>
              <strong>Part-time job Telegram scams rising:</strong> Group invites requesting payment deposits under the guise of ratings jobs.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function HelpSupportSection({ onBack }) {
  const govtHelplines = [
    { name: "National Cyber Crime Helpline", number: "1930", hours: "24/7 Support", desc: "Report financial fraud immediately", icon: "shield" },
    { name: "Emergency Response Support System", number: "112", hours: "24/7 Emergency", desc: "All-in-one emergency response service", icon: "bell" },
    { name: "CERT-In Hotline", number: "1800-11-4949", hours: "Working Hours", desc: "Reporting malware & security breaches", icon: "tools" },
    { name: "Women Helpline", number: "1091", hours: "24/7 Security", desc: "Reporting abuse or cyber stalking", icon: "user" }
  ];

  const externalPortals = [
    { name: "National Cyber Crime Portal", link: "https://cybercrime.gov.in", type: "Official Gov Portal", icon: "globe" },
    { name: "CERT-In Incident Report", link: "mailto:incident@cert-in.org.in", type: "Email Incident Support", icon: "mail" },
    { name: "RBI Cyber Security Cell", link: "https://rbi.org.in", type: "Financial Fraud Advisor", icon: "card" }
  ];

  return (
    <div className="profile-grid">
      {/* Left Panel: Primary Helplines */}
      <div className="side-card profile-card-left" style={{ justifyContent: 'flex-start' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', alignSelf: 'flex-start', margin: '0 0 16px' }}>
          <Icon name="headset" size={22} style={{ color: 'var(--cyan)' }} />
          <h2 style={{ margin: 0, color: '#ffffff', fontSize: '18px' }}>Helplines & Dialers</h2>
        </div>

        {/* 1930 Primary Banner */}
        <div className="risk-level-banner" style={{ background: 'rgba(255, 64, 87, 0.06)', border: '1px solid rgba(255, 64, 87, 0.22)', color: '#ff8b98', width: '100%', boxSizing: 'border-box' }}>
          <Icon name="alert" size={22} />
          <div style={{ textAlign: 'left' }}>
            <strong style={{ fontSize: '15px' }}>CRITICAL: Financial Loss?</strong>
            <p style={{ margin: '4px 0 0', fontSize: '12px', opacity: 0.9 }}>
              Call the National Cyber Helpline <strong>1930</strong> immediately (within 2 hours) to lock the recipient's bank accounts.
            </p>
          </div>
        </div>

        <div className="vault-fields-container" style={{ width: '100%', marginTop: '16px' }}>
          {govtHelplines.map((h, idx) => (
            <div className="vault-field-row" key={idx} style={{ padding: '12px 14px' }}>
              <span className="vault-field-label" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ffffff', fontWeight: 'bold' }}>
                  <Icon name={h.icon} size={15} style={{ color: 'var(--cyan)' }} />
                  <span>{h.name}</span>
                </div>
                <span style={{ fontSize: '11px', color: '#8fa1ba', fontWeight: 'normal' }}>{h.desc} • {h.hours}</span>
              </span>
              <a 
                href={`tel:${h.number.replace(/-/g, "")}`} 
                style={{ 
                  background: 'rgba(18, 220, 255, 0.1)', 
                  border: '1px solid rgba(18, 220, 255, 0.3)', 
                  borderRadius: '6px', 
                  padding: '6px 12px', 
                  color: 'var(--cyan)', 
                  fontSize: '13px', 
                  fontWeight: 'bold', 
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Icon name="phone" size={13} />
                <span>{h.number}</span>
              </a>
            </div>
          ))}
        </div>

        <button className="profile-back-btn" onClick={onBack} type="button" style={{ marginTop: 'auto', width: '100%' }}>
          <Icon name="chevronDown" size={16} style={{ transform: 'rotate(90deg)' }} />
          <span>Back to Dashboard</span>
        </button>
      </div>

      {/* Right Panel: Official Portals & Next Actions Checklist */}
      <div className="side-card profile-vault-card" style={{ display: 'flex', flexDirection: 'column' }}>
        <div className="vault-header" style={{ marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Icon name="globe" size={22} style={{ color: 'var(--cyan)' }} />
            <h2>Official Reporting Portals</h2>
          </div>
        </div>

        <div className="vault-fields-container" style={{ marginBottom: '20px' }}>
          {externalPortals.map((p, idx) => (
            <div className="vault-field-row" key={idx} style={{ padding: '12px 14px' }}>
              <span className="vault-field-label">
                <Icon name={p.icon} size={16} style={{ color: 'var(--cyan)' }} />
                <span>{p.name}</span>
              </span>
              <span className="vault-field-value" style={{ color: '#8fa1ba', fontSize: '11px', marginRight: '16px' }}>
                {p.type}
              </span>
              <a 
                href={p.link} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ 
                  background: 'rgba(39, 212, 111, 0.1)', 
                  border: '1px solid rgba(39, 212, 111, 0.3)', 
                  borderRadius: '6px', 
                  padding: '6px 12px', 
                  color: 'var(--green)', 
                  fontSize: '12px', 
                  fontWeight: 'bold', 
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>Visit Link</span>
                <Icon name="arrowRight" size={12} />
              </a>
            </div>
          ))}
        </div>

        {/* Immediate Checklist Guide */}
        <div className="vault-header" style={{ borderTop: '1px solid rgba(100,160,235,0.1)', paddingTop: '16px', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Icon name="shield" size={20} style={{ color: 'var(--green)' }} />
            <h2 style={{ fontSize: '15px' }}>Four Immediate Incident Actions</h2>
          </div>
        </div>

        <div style={{ display: 'grid', gap: '10px', fontSize: '13px', color: '#afbdd1', lineHeight: '1.4' }}>
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)' }}>
            <strong>1. Block Financial Instruments:</strong> Freeze all compromised bank accounts, debit/credit cards, and UPI IDs immediately through net banking.
          </div>
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)' }}>
            <strong>2. Secure Screenshots:</strong> Keep copy-paste logs, screenshots of transaction IDs, phone numbers, scam links, and WhatsApp chats.
          </div>
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)' }}>
            <strong>3. Register with 1930:</strong> Call 1930 to trigger real-time interbank transaction tracking (MHA initiative).
          </div>
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)' }}>
            <strong>4. Compile Gov complaint PDF:</strong> Use our AI chat to compile a government-standard I4C incident file and register it at <a href="https://cybercrime.gov.in" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--cyan)' }}>cybercrime.gov.in</a>.
          </div>
        </div>
      </div>
    </div>
  );
}

// =========================================================
// AWARENESS HUB SECTION COMPONENT (6 CYBER SECURITY BLOGS)
// =========================================================
function AwarenessHubSection({ onBack }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const blogs = [
    {
      id: 1,
      title: "Spotting UPI & Phishing Scams: The Red Flags",
      summary: "Learn how to identify fake payment links, spoofed banking pages, and the psychology behind urgent requests.",
      category: "UPI & Payments",
      readTime: "5 min read",
      icon: "upi",
      color: "var(--blue)",
      accentColor: "rgba(43, 125, 255, 0.12)",
      glowColor: "rgba(43, 125, 255, 0.35)",
      content: "UPI (Unified Payments Interface) has revolutionized transactions, but it has also become a prime target for cybercriminals. One of the most common scams is the 'collect request' fraud, where scammers send a payment request disguised as a refund or prize money. Remember: entering your UPI PIN always deducts money from your account, never credits it. Additionally, phishing links often spoof legitimate banking URLs. Always inspect the domain name carefully (e.g., check for secure HTTPS and correct spelling like hdfcbank.com, not hdfcbak.com).",
      takeaways: [
        "UPI PIN is only required to SEND money, never to receive it.",
        "Check the merchant or beneficiary name displayed in the app before confirming any payment.",
        "Double-check bank URLs for HTTPS and correct spellings.",
        "Never click on random payment links sent over SMS or WhatsApp."
      ],
      actions: [
        "Review UPI transaction history for unrecognized charges",
        "Enable transaction limit alerts inside your banking app",
        "Block and report known spam contacts sending payment requests"
      ]
    },
    {
      id: 2,
      title: "Protecting Your Digital Identity Vault",
      summary: "Essential guidelines for securing your social media profiles, email vaults, and preventing identity theft.",
      category: "Identity Protection",
      readTime: "4 min read",
      icon: "user",
      color: "var(--cyan)",
      accentColor: "rgba(18, 220, 255, 0.12)",
      glowColor: "rgba(18, 220, 255, 0.35)",
      content: "Identity theft occurs when fraudsters acquire your personal credentials—like Aadhaar, PAN, email, or passwords—to commit crimes in your name. Enabling Multi-Factor Authentication (MFA) on all accounts acts as a critical line of defense. Even if a scammer cracks your password, they won't have the temporary OTP or authenticator code. Be cautious of sharing photocopy scans of your identity proofs without crossing them out and writing the specific purpose on the paper.",
      takeaways: [
        "Always activate 2FA/MFA on your email, social media, and banking portals.",
        "Never upload unmasked Aadhaar cards or PAN details to unverified websites.",
        "Write the purpose, date, and signature across physical documents before sharing scans.",
        "Check active login sessions regularly in your account settings."
      ],
      actions: [
        "Enable 2FA on my primary email and banking login",
        "Use a password manager to store secure, unique passwords",
        "Mask physical identity card photocopies before sending them"
      ]
    },
    {
      id: 3,
      title: "Investment & Part-Time Job Scams",
      summary: "How fraudsters use Telegram groups and fake task-based websites to lure victims into transferring deposits.",
      category: "Financial Safety",
      readTime: "6 min read",
      icon: "wallet",
      color: "var(--purple)",
      accentColor: "rgba(117, 89, 255, 0.12)",
      glowColor: "rgba(117, 89, 255, 0.35)",
      content: "A rising wave of cyber fraud involves part-time job offers (e.g., 'like YouTube videos or rate hotels for money') or high-return investment schemes. Fraudsters add victims to large Telegram groups where fake members share fabricated screenshots of their 'earnings'. Victims are prompted to make small deposits, which yield quick, small returns to build trust. Once a victim deposits a large amount, the money is frozen, and scammers demand more fees under the guise of 'processing taxes' or 'withdrawal fees'.",
      takeaways: [
        "No legitimate employer will ask you to pay money to get a job or task.",
        "Be extremely suspicious of investment schemes promising guaranteed daily or weekly returns.",
        "Telegram groups containing thousands of 'successful investors' are usually bot-driven or filled with accomplices.",
        "Report any suspicious telegram handle or bank account to the Cyber Cell immediately."
      ],
      actions: [
        "Exit and report unsolicited Telegram groups promising easy money",
        "Never transfer deposit money for 'priority task access' or 'taxes'",
        "Verify job offers through official corporate verification portals"
      ]
    },
    {
      id: 4,
      title: "Secure Net Banking: Browsing Habits",
      summary: "Safe browsing practices, recognizing copycat websites, and avoiding malicious public Wi-Fi networks.",
      category: "Banking Security",
      readTime: "5 min read",
      icon: "globe",
      color: "var(--green)",
      accentColor: "rgba(39, 212, 111, 0.12)",
      glowColor: "rgba(39, 212, 111, 0.35)",
      content: "Online banking is highly secure, but user habits can expose vulnerabilities. Scammers set up copycat net-banking portals that look identical to official bank landing pages. If you log in through these fake sites, they steal your customer ID and password. Avoid using public Wi-Fi networks for banking transactions, as hackers can intercept data packets (Man-in-the-Middle attacks). Always type your bank's URL directly into the browser address bar rather than clicking search results.",
      takeaways: [
        "Type bank URLs manually; do not rely on search engine ads or links.",
        "Never perform financial transactions while connected to public or airport Wi-Fi.",
        "Keep browser and security software updated to block keyloggers and malware.",
        "Look for the padlock symbol and verify the domain name matches your bank exactly."
      ],
      actions: [
        "Clear browser autofill data for bank passwords",
        "Bookmark only the official verified URL of my bank",
        "Avoid using public computers or public networks for financial transactions"
      ]
    },
    {
      id: 5,
      title: "The MHA 1930 Helpline: Golden Hour Rule",
      summary: "What happens when you dial 1930 immediately after a financial fraud. A step-by-step guide to locking funds.",
      category: "Incident Response",
      readTime: "3 min read",
      icon: "phone",
      color: "var(--red)",
      accentColor: "rgba(255, 64, 87, 0.12)",
      glowColor: "rgba(255, 64, 87, 0.35)",
      content: "If you fall victim to a financial cyber fraud, time is of the essence. The first two hours after the transaction are known as the 'Golden Hour'. Dialing 1930 connects you to the National Cyber Crime Reporting Portal helpline managed by the Ministry of Home Affairs (MHA). Operators work directly with banks to trace and block the transferred amount in the recipient's wallet or account before the scammer can cash it out at an ATM. The faster you call, the higher the chance of recovering your lost funds.",
      takeaways: [
        "Keep transaction details, transaction ID, bank account, and scammer details ready.",
        "Dial 1930 immediately (within 2 hours) to lock the stolen money.",
        "Following the call, file a formal complaint at cybercrime.gov.in.",
        "Contact your bank's nodal officer to initiate a chargeback or freeze dispute."
      ],
      actions: [
        "Save 1930 in my contacts as 'MHA Cyber Crime Helpline'",
        "Know where to find transaction reference numbers in my bank statements",
        "Understand that immediate reporting increases recovery chances by up to 80%"
      ]
    },
    {
      id: 6,
      title: "Malware & Remote Access App Scams",
      summary: "How scammers convince victims to install apps like AnyDesk or TeamViewer to compromise mobile devices.",
      category: "Device Security",
      readTime: "4 min read",
      icon: "tools",
      color: "var(--purple)",
      accentColor: "rgba(117, 89, 255, 0.12)",
      glowColor: "rgba(117, 89, 255, 0.35)",
      content: "Scammers often masquerade as customer service representatives from courier services, utility companies, or telecom providers. They instruct you to download remote screen-sharing tools like AnyDesk, TeamViewer, or RustDesk under the pretense of 'verifying your connection' or 'resolving a technical issue'. Once installed, the scammer can view your screen, read incoming bank OTPs, and control your device to transfer funds. Never install remote access applications on the recommendation of a stranger.",
      takeaways: [
        "Never install AnyDesk, TeamViewer, or other remote apps at the request of callers.",
        "Legitimate customer support representatives will never ask to access your device screen.",
        "Disable screen-sharing permissions for unknown apps in your phone's settings.",
        "If you suspect compromise, disconnect from the internet immediately and uninstall the app."
      ],
      actions: [
        "Scan my mobile app library for unauthorized remote tools",
        "Disable auto-run and boot permissions for any screen share tool",
        "Understand that bank agents never use screen sharing to verify accounts"
      ]
    }
  ];

  const categories = ["All", "UPI & Payments", "Identity Protection", "Financial Safety", "Banking Security", "Incident Response", "Device Security"];

  const [selectedBlog, setSelectedBlog] = useState(blogs[0]);
  const [completedActionSteps, setCompletedActionSteps] = useState({});
  const [readBlogs, setReadBlogs] = useState({});

  const filteredBlogs = blogs.filter((blog) => {
    const matchesSearch = blog.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          blog.summary.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || blog.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleActionStep = (blogId, actionIndex) => {
    const key = `${blogId}-${actionIndex}`;
    setCompletedActionSteps(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const toggleReadStatus = (blogId) => {
    setReadBlogs(prev => ({
      ...prev,
      [blogId]: !prev[blogId]
    }));
  };

  return (
    <div className="profile-grid" style={{ height: "calc(100vh - 150px)", minHeight: "500px" }}>
      {/* Left Column: Blog list with Search and Categories */}
      <div 
        className="side-card profile-card-left" 
        style={{ 
          justifyContent: "flex-start", 
          padding: "16px 14px", 
          display: "flex", 
          flexDirection: "column", 
          height: "100%",
          overflowY: "auto"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px", margin: "0 0 16px 8px" }}>
          <Icon name="shieldStar" size={22} style={{ color: "var(--cyan)" }} />
          <h2 style={{ margin: 0, color: "#ffffff", fontSize: "18px" }}>Awareness Hub</h2>
        </div>

        {/* Search Input */}
        <div style={{ position: "relative", marginBottom: "14px", width: "100%" }}>
          <input 
            type="text"
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              background: "rgba(5, 12, 24, 0.6)",
              border: "1px solid var(--line)",
              borderRadius: "10px",
              padding: "10px 14px",
              color: "#ffffff",
              fontSize: "13px",
              outline: "none"
            }}
          />
        </div>

        {/* Categories Chips */}
        <div style={{ 
          display: "flex", 
          gap: "6px", 
          flexWrap: "wrap", 
          marginBottom: "16px",
          paddingBottom: "8px",
          borderBottom: "1px solid rgba(100, 160, 235, 0.1)"
        }}>
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                style={{
                  background: isSelected ? "rgba(18, 220, 255, 0.12)" : "rgba(255, 255, 255, 0.02)",
                  border: isSelected ? "1px solid var(--cyan)" : "1px solid rgba(255, 255, 255, 0.05)",
                  color: isSelected ? "var(--cyan)" : "var(--muted)",
                  borderRadius: "6px",
                  padding: "4px 8px",
                  fontSize: "11px",
                  cursor: "pointer",
                  fontWeight: isSelected ? "bold" : "normal"
                }}
              >
                {cat === "All" ? "All" : cat.split(" ")[0]}
              </button>
            );
          })}
        </div>

        {/* Blogs Feed List */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", width: "100%", flexGrow: 1, overflowY: "auto", paddingRight: "4px" }}>
          {filteredBlogs.length === 0 ? (
            <div style={{ padding: "40px 10px", textAlign: "center", color: "var(--muted)" }}>
              No articles match your filters.
            </div>
          ) : (
            filteredBlogs.map((blog) => {
              const isSelected = selectedBlog?.id === blog.id;
              const isRead = readBlogs[blog.id];
              return (
                <button
                  key={blog.id}
                  className={`settings-menu-item ${isSelected ? "active" : ""}`}
                  style={{
                    padding: "12px 14px",
                    height: "auto",
                    minHeight: "unset",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    gap: "6px"
                  }}
                  onClick={() => setSelectedBlog(blog)}
                  type="button"
                >
                  <div style={{ display: "flex", width: "100%", justifyContent: "space-between", alignItems: "center" }}>
                    <span 
                      style={{ 
                        fontWeight: "800", 
                        fontSize: "13px", 
                        color: isSelected ? "var(--cyan)" : "#ffffff",
                        textAlign: "left",
                        lineHeight: 1.3
                      }}
                    >
                      {blog.title}
                    </span>
                    <Icon name={blog.icon} size={14} style={{ color: isSelected ? "var(--cyan)" : "var(--muted)", flexShrink: 0 }} />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", width: "100%", fontSize: "10px", color: "var(--muted)" }}>
                    <span>{blog.category}</span>
                    <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      {isRead && <span style={{ color: "var(--green)" }}>✓ Read</span>}
                      <span>{blog.readTime}</span>
                    </span>
                  </div>
                </button>
              );
            })
          )}
        </div>

        <button className="profile-back-btn" onClick={onBack} type="button" style={{ marginTop: "auto", width: "100%" }}>
          <Icon name="chevronDown" size={16} style={{ transform: "rotate(90deg)" }} />
          <span>Back to Dashboard</span>
        </button>
      </div>

      {/* Right Column: Detailed Reader and Interactive Checklist */}
      <div 
        className="side-card profile-vault-card" 
        style={{ 
          display: "flex", 
          flexDirection: "column", 
          height: "100%",
          padding: "20px",
          overflowY: "auto"
        }}
      >
        {selectedBlog ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* Header Block */}
            <div style={{ borderBottom: "1px solid rgba(100,160,235,0.1)", paddingBottom: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ 
                  color: selectedBlog.accentColor ? selectedBlog.color : "var(--cyan)", 
                  fontSize: "11px", 
                  fontWeight: "bold", 
                  textTransform: "uppercase", 
                  letterSpacing: "0.08em",
                  background: selectedBlog.accentColor || "rgba(18, 220, 255, 0.08)",
                  padding: "4px 10px",
                  borderRadius: "999px"
                }}>
                  {selectedBlog.category}
                </span>
                
                <button
                  type="button"
                  onClick={() => toggleReadStatus(selectedBlog.id)}
                  style={{
                    background: readBlogs[selectedBlog.id] ? "rgba(39, 212, 111, 0.08)" : "transparent",
                    border: readBlogs[selectedBlog.id] ? "1px solid var(--green)" : "1px solid var(--line)",
                    color: readBlogs[selectedBlog.id] ? "var(--green)" : "var(--muted)",
                    borderRadius: "6px",
                    padding: "4px 10px",
                    fontSize: "11px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    fontWeight: "bold"
                  }}
                >
                  <Icon name="check" size={12} />
                  <span>{readBlogs[selectedBlog.id] ? "Completed" : "Mark as Read"}</span>
                </button>
              </div>
              
              <h2 style={{ fontSize: "22px", color: "#ffffff", marginTop: "12px", marginBottom: "6px", lineHeight: 1.25 }}>
                {selectedBlog.title}
              </h2>
              <span style={{ fontSize: "12px", color: "var(--muted)" }}>
                Threat Level Advisory • {selectedBlog.readTime}
              </span>
            </div>

            {/* Detailed Body Copy */}
            <div style={{ 
              background: "rgba(13, 25, 45, 0.3)", 
              border: "1px solid rgba(102, 161, 255, 0.08)", 
              borderRadius: "14px", 
              padding: "18px 22px", 
              color: "#e2ecf8",
              fontSize: "15px",
              lineHeight: "1.6",
              textAlign: "justify"
            }}>
              {selectedBlog.content}
            </div>

            {/* Core Takeaways */}
            <div>
              <h3 style={{ fontSize: "14px", color: "#ffffff", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 10px 0", fontWeight: "bold" }}>
                Key Takeaways
              </h3>
              <div style={{ display: "grid", gap: "10px" }}>
                {selectedBlog.takeaways.map((takeaway, idx) => (
                  <div 
                    key={idx} 
                    style={{ 
                      display: "flex", 
                      alignItems: "flex-start", 
                      gap: "10px", 
                      fontSize: "13.5px", 
                      color: "#afbdd1", 
                      lineHeight: "1.4" 
                    }}
                  >
                    <Icon name="shield" size={15} style={{ color: selectedBlog.color, flexShrink: 0, marginTop: "2px" }} />
                    <span>{takeaway}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Interactive action checklist */}
            <div style={{ 
              background: "rgba(18, 220, 255, 0.02)", 
              border: "1px solid rgba(18, 220, 255, 0.08)", 
              borderRadius: "14px", 
              padding: "16px 20px" 
            }}>
              <h3 style={{ fontSize: "14px", color: "var(--cyan)", margin: "0 0 12px 0", fontWeight: "bold", display: "flex", alignItems: "center", gap: "8px" }}>
                <Icon name="tools" size={16} />
                <span>My Secure Habit Builder</span>
              </h3>
              <p style={{ fontSize: "12px", color: "var(--muted)", margin: "0 0 14px 0" }}>
                Check off these security habits to confirm you have implemented these safeguards in your digital life.
              </p>
              
              <div style={{ display: "grid", gap: "10px" }}>
                {selectedBlog.actions.map((action, idx) => {
                  const isChecked = completedActionSteps[`${selectedBlog.id}-${idx}`];
                  return (
                    <label 
                      key={idx} 
                      style={{ 
                        display: "flex", 
                        alignItems: "center", 
                        gap: "10px", 
                        fontSize: "13px", 
                        color: isChecked ? "var(--green)" : "#afbdd1", 
                        cursor: "pointer",
                        userSelect: "none"
                      }}
                    >
                      <input 
                        type="checkbox" 
                        checked={!!isChecked} 
                        onChange={() => toggleActionStep(selectedBlog.id, idx)}
                        style={{
                          accentColor: "var(--green)",
                          cursor: "pointer",
                          width: "14px",
                          height: "14px"
                        }}
                      />
                      <span style={{ textDecoration: isChecked ? "line-through" : "none" }}>{action}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justify: "center", height: "100%", color: "var(--muted)", gap: "16px" }}>
            <Icon name="shieldStar" size={40} style={{ color: "var(--muted)" }} />
            <span>Select an article from the left sidebar to start learning.</span>
          </div>
        )}
      </div>
    </div>
  );
}

// =========================================================
// SAFETY TOOLS SECTION COMPONENT (SAFE LINK ANALYZER TOOL)
// =========================================================
function SafetyToolsSection({ onBack }) {
  const [urlInput, setUrlInput] = useState("");
  const [scanState, setScanState] = useState("idle"); // "idle", "scanning", "done"
  const [scanStep, setScanStep] = useState(0);
  const [scanLogs, setScanLogs] = useState([]);
  const [activeTab, setActiveTab] = useState("flags"); // "flags", "heuristics", "details"
  
  const [history, setHistory] = useState([
    {
      id: 1,
      url: "https://www.onlinesbi.sbi/portal",
      verdict: "Safe",
      riskScore: 2,
      timestamp: "Today 10:20 AM",
      details: {
        ssl: "Valid & secure TLS 1.3 certificate issued by DigiCert",
        age: "Registered over 15 years ago",
        domain: "Legitimate corporate domain of State Bank of India",
        registrar: "Verified Bank Domain",
        flags: [],
        heuristics: [
          { name: "Matches official banking profile", status: "secure" },
          { name: "Legitimate SSL certificate", status: "secure" },
          { name: "Established domain age", status: "secure" }
        ]
      }
    },
    {
      id: 2,
      url: "http://free-lottery-gift.xyz/sbi-rewards/login.html",
      verdict: "Dangerous",
      riskScore: 96,
      timestamp: "Today 10:14 AM",
      details: {
        ssl: "Missing SSL (Plain HTTP connection is insecure)",
        age: "Registered 3 days ago",
        domain: "Suspicious free TLD (.xyz) claiming official banking keywords",
        registrar: "Unknown Registrar (Registered via NameSilo)",
        flags: [
          "Insecure plain HTTP protocol used",
          "Brand impersonation ('sbi', 'rewards')",
          "Recent domain registration (under 7 days old)",
          "High-risk top-level domain (.xyz)"
        ],
        heuristics: [
          { name: "Brand keyword spoofing detect", status: "warning" },
          { name: "Lack of SSL security layer", status: "warning" },
          { name: "Suspicious domain extension (.xyz)", status: "warning" },
          { name: "Form prompts asking for login/PIN", status: "warning" }
        ]
      }
    },
    {
      id: 3,
      url: "https://paytm-kyc-verification.top/update-profile",
      verdict: "Dangerous",
      riskScore: 88,
      timestamp: "Yesterday 04:30 PM",
      details: {
        ssl: "Valid Let's Encrypt SSL (often abused by scammers)",
        age: "Registered 12 days ago",
        domain: "Impersonates financial brand 'paytm' on high-risk TLD",
        registrar: "Hostinger Hosting (Common proxy registrar)",
        flags: [
          "Financial brand keyword matching ('paytm', 'kyc')",
          "High-risk top-level domain (.top)",
          "Very young domain age (12 days)",
          "Scam redirect script detected in heuristic audit"
        ],
        heuristics: [
          { name: "Financial brand name spoofing", status: "warning" },
          { name: "Suspicious domain extension (.top)", status: "warning" },
          { name: "Obfuscated redirect code pattern", status: "warning" }
        ]
      }
    }
  ]);

  const [activeReport, setActiveReport] = useState(history[1]);

  const scanSteps = [
    { text: "Resolving DNS record maps...", result: "RESOLVED" },
    { text: "Verifying SSL/TLS certificate chain...", result: "VERIFIED" },
    { text: "Auditing domain registrar age & flags...", result: "AUDITED" },
    { text: "Analyzing code body heuristics & forms...", result: "COMPLETED" }
  ];

  useEffect(() => {
    if (scanState !== "scanning") return;

    if (scanStep < scanSteps.length) {
      const timer = setTimeout(() => {
        setScanLogs(prev => [...prev, {
          text: scanSteps[scanStep].text,
          result: scanSteps[scanStep].result,
          success: true
        }]);
        setScanStep(prev => prev + 1);
      }, 900);
      return () => clearTimeout(timer);
    } else {
      // Analyze url input and build report
      const cleanUrl = urlInput.trim().toLowerCase();
      let riskScore = 5;
      let verdict = "Safe";
      const flags = [];
      const heuristics = [];
      let ssl = "Valid SSL certificate";
      let age = "Domain age verified (Older than 1 year)";
      let domain = "No suspicious keyword matching detected";
      let registrar = "Verified Registrar";

      if (!cleanUrl.startsWith("https://")) {
        riskScore += 25;
        ssl = "Missing secure HTTPS (Connection is insecure)";
        flags.push("Insecure plain HTTP protocol used");
        heuristics.push({ name: "Lack of SSL security layer", status: "warning" });
      } else {
        ssl = "Valid SSL Security certificate verified";
        heuristics.push({ name: "Secure HTTPS configuration", status: "secure" });
      }

      const highRiskTlds = [".xyz", ".top", ".info", ".club", ".click", ".vip", ".apk", ".site", ".online", ".tech", ".work"];
      const matchedTld = highRiskTlds.find(tld => cleanUrl.includes(tld));
      if (matchedTld) {
        riskScore += 25;
        flags.push(`Suspicious top-level domain used (${matchedTld})`);
        heuristics.push({ name: `High-risk domain extension (${matchedTld})`, status: "warning" });
      } else {
        heuristics.push({ name: "Standard secure domain extension", status: "secure" });
      }

      const brandKeywords = ["sbi", "hdfc", "icici", "paytm", "upi", "yono", "bank", "verification", "rewards", "gift", "card", "lock", "support"];
      const matchedBrand = brandKeywords.find(kw => cleanUrl.includes(kw));
      if (matchedBrand) {
        // If it matches a brand, check if it's the official domain
        const officialDomains = ["onlinesbi.sbi", "hdfcbank.com", "icicibank.com", "paytm.com", "github.com", "google.com", "cybercrime.gov.in"];
        const isOfficial = officialDomains.some(od => cleanUrl.includes(od));
        
        if (!isOfficial) {
          riskScore += 40;
          flags.push(`Brand keyword spoofing detected ('${matchedBrand}')`);
          heuristics.push({ name: `Impersonates financial brand ('${matchedBrand}')`, status: "warning" });
          domain = `Suspicious keyword matching ('${matchedBrand}') on non-official domain`;
          age = "Domain registered recently (Less than 30 days)";
          registrar = "Privacy Protected Registrar";
        } else {
          heuristics.push({ name: `Matches official brand profile ('${matchedBrand}')`, status: "secure" });
          domain = `Legitimate official domain for ${matchedBrand}`;
          age = "Domain is well-established (Registered > 5 years)";
          registrar = "Official Corporate Registrar";
        }
      }

      if (cleanUrl.includes("login") || cleanUrl.includes("update") || cleanUrl.includes("verify") || cleanUrl.includes("kyc")) {
        riskScore += 15;
        flags.push("Form actions requesting account update or credentials");
        heuristics.push({ name: "Credentials capture patterns matching", status: "warning" });
      }

      // Final limits
      riskScore = Math.min(100, riskScore);
      if (riskScore > 70) {
        verdict = "Dangerous";
      } else if (riskScore > 30) {
        verdict = "Suspicious";
      } else {
        verdict = "Safe";
      }

      const newReport = {
        id: Date.now(),
        url: urlInput,
        verdict,
        riskScore,
        timestamp: "Just Now",
        details: {
          ssl,
          age,
          domain,
          registrar,
          flags: flags.length > 0 ? flags : ["No critical security flags raised"],
          heuristics: heuristics
        }
      };

      setHistory(prev => [newReport, ...prev]);
      setActiveReport(newReport);
      setScanState("done");
    }
  }, [scanState, scanStep]);

  const handleStartScan = (e) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    setScanState("scanning");
    setScanStep(0);
    setScanLogs([{ text: "Connecting to link analysis node...", result: "CONNECTED", success: true }]);
  };

  return (
    <div className="profile-grid" style={{ height: "calc(100vh - 150px)", minHeight: "500px" }}>
      {/* Left Column: Link URL Analyzer Tool Inputs */}
      <div 
        className="side-card profile-card-left" 
        style={{ 
          justifyContent: "flex-start", 
          padding: "16px 14px", 
          display: "flex", 
          flexDirection: "column", 
          height: "100%",
          overflowY: "auto"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px", margin: "0 0 16px 8px" }}>
          <Icon name="tools" size={22} style={{ color: "var(--cyan)" }} />
          <h2 style={{ margin: 0, color: "#ffffff", fontSize: "18px" }}>Link Safe-Scanner</h2>
        </div>

        <p style={{ margin: "0 8px 16px 8px", fontSize: "12px", color: "var(--muted)", lineHeight: "1.4" }}>
          Scan suspicious website links, domains, or short URLs before clicking on them to check for phishing signatures.
        </p>

        <form onSubmit={handleStartScan} style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%", padding: "0 8px" }}>
          <div style={{ position: "relative" }}>
            <input 
              type="text"
              placeholder="Paste URL link here (e.g. http://...)"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              disabled={scanState === "scanning"}
              style={{
                width: "100%",
                background: "rgba(5, 12, 24, 0.6)",
                border: "1px solid var(--line)",
                borderRadius: "10px",
                padding: "12px 14px",
                color: "#ffffff",
                fontSize: "13px",
                outline: "none",
                boxShadow: "0 4px 12px rgba(0,0,0,0.12)"
              }}
              required
            />
          </div>

          <button
            type="submit"
            disabled={scanState === "scanning" || !urlInput.trim()}
            style={{
              background: scanState === "scanning" ? "rgba(255,255,255,0.05)" : "linear-gradient(135deg, #2b7dff, #7559ff)",
              border: 0,
              borderRadius: "10px",
              padding: "12px",
              color: scanState === "scanning" ? "var(--muted)" : "#ffffff",
              fontWeight: "bold",
              fontSize: "13.5px",
              cursor: scanState === "scanning" ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              boxShadow: "0 8px 24px rgba(43, 125, 255, 0.2)"
            }}
          >
            <Icon name="shield" size={16} />
            <span>{scanState === "scanning" ? "Analyzing Link..." : "Scan URL Safety"}</span>
          </button>
        </form>

        {/* Scan Log Progress Output */}
        {scanLogs.length > 0 && (
          <div 
            className="scan-log-box" 
            style={{ 
              margin: "20px 8px 0 8px", 
              background: "rgba(5, 12, 24, 0.5)", 
              border: "1px solid var(--line)", 
              borderRadius: "10px", 
              padding: "12px",
              fontFamily: "monospace",
              fontSize: "11px",
              display: "flex",
              flexDirection: "column",
              gap: "8px"
            }}
          >
            {scanLogs.map((log, idx) => (
              <div key={idx} style={{ display: "flex", justifyContent: "space-between", color: "#e2ecf8" }}>
                <span>&gt; {log.text}</span>
                <span style={{ color: "var(--cyan)", fontWeight: "bold" }}>{log.result}</span>
              </div>
            ))}
            {scanState === "scanning" && (
              <div style={{ color: "var(--muted)", animation: "pulse 1s infinite" }}>
                &gt; Querying threat database feeds...
              </div>
            )}
          </div>
        )}

        {/* Scan History Feed */}
        <div style={{ marginTop: "24px", width: "100%" }}>
          <h3 style={{ margin: "0 8px 10px 8px", fontSize: "12px", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Scan History
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", width: "100%", maxHeight: "220px", overflowY: "auto", padding: "0 4px" }}>
            {history.map((item) => {
              const isSelected = activeReport?.id === item.id;
              const isDanger = item.verdict === "Dangerous";
              const isSuspicious = item.verdict === "Suspicious";
              
              let tagColor = "var(--green)";
              let tagBg = "rgba(39, 212, 111, 0.1)";
              let tagBorder = "rgba(39, 212, 111, 0.25)";

              if (isDanger) {
                tagColor = "var(--red)";
                tagBg = "rgba(255, 64, 87, 0.1)";
                tagBorder = "rgba(255, 64, 87, 0.25)";
              } else if (isSuspicious) {
                tagColor = "#ffb020";
                tagBg = "rgba(255, 176, 32, 0.1)";
                tagBorder = "rgba(255, 176, 32, 0.25)";
              }

              return (
                <button
                  key={item.id}
                  className={`settings-menu-item ${isSelected ? "active" : ""}`}
                  style={{
                    padding: "10px 12px",
                    height: "auto",
                    minHeight: "unset",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    gap: "6px"
                  }}
                  onClick={() => setActiveReport(item)}
                  type="button"
                >
                  <div style={{ display: "flex", width: "100%", justifyContent: "space-between", alignItems: "center" }}>
                    <span 
                      style={{ 
                        fontWeight: "700", 
                        fontSize: "12px", 
                        color: "#ffffff",
                        textAlign: "left",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        maxWidth: "140px"
                      }}
                    >
                      {item.url.replace(/https?:\/\/(www\.)?/, "")}
                    </span>
                    <span style={{ 
                      fontSize: "9px", 
                      color: tagColor, 
                      background: tagBg, 
                      border: `1px solid ${tagBorder}`, 
                      padding: "2px 6px", 
                      borderRadius: "4px",
                      fontWeight: "bold"
                    }}>
                      {item.verdict}
                    </span>
                  </div>
                  <span style={{ fontSize: "9px", color: "var(--muted)" }}>{item.timestamp}</span>
                </button>
              );
            })}
          </div>
        </div>

        <button className="profile-back-btn" onClick={onBack} type="button" style={{ marginTop: "auto", width: "100%" }}>
          <Icon name="chevronDown" size={16} style={{ transform: "rotate(90deg)" }} />
          <span>Back to Dashboard</span>
        </button>
      </div>

      {/* Right Column: Detailed Security Report Card */}
      <div 
        className="side-card profile-vault-card" 
        style={{ 
          display: "flex", 
          flexDirection: "column", 
          height: "100%",
          padding: "20px",
          overflowY: "auto"
        }}
      >
        {activeReport ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* Header / Risk Meter Block */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(100,160,235,0.1)", paddingBottom: "16px" }}>
              <div style={{ flexGrow: 1 }}>
                <span style={{ fontSize: "11px", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  Link Diagnostic Report
                </span>
                <h2 style={{ fontSize: "18px", color: "#ffffff", marginTop: "4px", marginBottom: "4px", overflowWrap: "anywhere" }}>
                  {activeReport.url}
                </h2>
                <span style={{ fontSize: "11px", color: "var(--muted)" }}>Scanned on {activeReport.timestamp}</span>
              </div>

              {/* Risk Score Bubble */}
              <div 
                style={{ 
                  width: "72px", 
                  height: "72px", 
                  borderRadius: "50%", 
                  border: `4px solid ${activeReport.riskScore > 70 ? "var(--red)" : activeReport.riskScore > 30 ? "#ffb020" : "var(--green)"}`,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "rgba(5, 12, 24, 0.4)",
                  flexShrink: 0,
                  boxShadow: `0 0 16px ${activeReport.riskScore > 70 ? "rgba(255, 64, 87, 0.15)" : "rgba(39, 212, 111, 0.15)"}`
                }}
              >
                <strong style={{ fontSize: "20px", color: "#ffffff", lineHeight: 1 }}>{activeReport.riskScore}%</strong>
                <span style={{ fontSize: "9px", color: "var(--muted)", textTransform: "uppercase", marginTop: "2px" }}>Risk</span>
              </div>
            </div>

            {/* Verdict Alert banner */}
            <div 
              style={{ 
                padding: "12px 16px", 
                borderRadius: "10px", 
                background: activeReport.riskScore > 70 ? "rgba(255, 64, 87, 0.08)" : activeReport.riskScore > 30 ? "rgba(255, 176, 32, 0.08)" : "rgba(39, 212, 111, 0.08)",
                border: `1px solid ${activeReport.riskScore > 70 ? "rgba(255, 64, 87, 0.25)" : activeReport.riskScore > 30 ? "rgba(255, 176, 32, 0.25)" : "rgba(39, 212, 111, 0.25)"}`,
                color: activeReport.riskScore > 70 ? "#ff8b98" : activeReport.riskScore > 30 ? "#ffd370" : "#aaf4cf",
                display: "flex",
                alignItems: "center",
                gap: "10px"
              }}
            >
              <Icon name="alert" size={18} />
              <div style={{ textAlign: "left" }}>
                <strong style={{ fontSize: "14px" }}>Verdict: Link is {activeReport.verdict}</strong>
                <p style={{ margin: "2px 0 0", fontSize: "11px", opacity: 0.9 }}>
                  {activeReport.riskScore > 70 
                    ? "Do not click on this link or fill in any private details." 
                    : activeReport.riskScore > 30 
                    ? "Proceed with caution. Verify the sender before logging in." 
                    : "No threats detected. The domain looks verified and safe."}
                </p>
              </div>
            </div>

            {/* Tabs Selector */}
            <div style={{ display: "flex", gap: "10px", borderBottom: "1px solid rgba(100,160,235,0.08)", paddingBottom: "1px" }}>
              {[
                { id: "flags", label: "Security Flags" },
                { id: "heuristics", label: "Heuristics" },
                { id: "details", label: "Domain Details" }
              ].map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                      background: "transparent",
                      border: 0,
                      borderBottom: isActive ? "2px solid var(--cyan)" : "2px solid transparent",
                      color: isActive ? "#ffffff" : "var(--muted)",
                      padding: "6px 12px",
                      fontSize: "12.5px",
                      fontWeight: isActive ? "bold" : "normal",
                      cursor: "pointer"
                    }}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Tab content panel */}
            <div style={{ minHeight: "140px" }}>
              {activeTab === "flags" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {activeReport.details.flags && activeReport.details.flags.length > 0 ? (
                    activeReport.details.flags.map((flag, idx) => (
                      <div 
                        key={idx} 
                        style={{ 
                          display: "flex", 
                          gap: "8px", 
                          alignItems: "flex-start", 
                          fontSize: "13px", 
                          color: activeReport.riskScore > 30 ? "#ff8b98" : "#afbdd1" 
                        }}
                      >
                        <Icon name="alert" size={14} style={{ marginTop: "2px", flexShrink: 0 }} />
                        <span>{flag}</span>
                      </div>
                    ))
                  ) : (
                    <div style={{ display: "flex", gap: "8px", alignItems: "center", fontSize: "13px", color: "var(--green)" }}>
                      <Icon name="check" size={14} />
                      <span>No suspicious security flags detected on this link.</span>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "heuristics" && (
                <div style={{ display: "grid", gap: "10px" }}>
                  {activeReport.details.heuristics.map((h, idx) => (
                    <div 
                      key={idx} 
                      style={{ 
                        display: "flex", 
                        justifyContent: "space-between", 
                        alignItems: "center", 
                        background: "rgba(5, 12, 24, 0.4)", 
                        border: "1px solid var(--line)",
                        borderRadius: "8px",
                        padding: "8px 12px",
                        fontSize: "12.5px"
                      }}
                    >
                      <span style={{ color: "#ffffff" }}>{h.name}</span>
                      <span style={{ 
                        fontSize: "10px", 
                        color: h.status === "secure" ? "var(--green)" : "var(--red)", 
                        fontWeight: "bold",
                        textTransform: "uppercase" 
                      }}>
                        {h.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "details" && (
                <div style={{ display: "grid", gap: "10px", fontSize: "12.5px", color: "#afbdd1" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(100,160,235,0.04)", paddingBottom: "6px" }}>
                    <span>SSL Certificate Status:</span>
                    <strong style={{ color: "#ffffff", textAlign: "right" }}>{activeReport.details.ssl}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(100,160,235,0.04)", paddingBottom: "6px" }}>
                    <span>Domain Registrar:</span>
                    <strong style={{ color: "#ffffff", textAlign: "right" }}>{activeReport.details.registrar}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(100,160,235,0.04)", paddingBottom: "6px" }}>
                    <span>Domain Registration Age:</span>
                    <strong style={{ color: "#ffffff", textAlign: "right" }}>{activeReport.details.age}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "6px" }}>
                    <span>Domain Match:</span>
                    <strong style={{ color: "#ffffff", textAlign: "right" }}>{activeReport.details.domain}</strong>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Safety Guideline Tips */}
            <div style={{ 
              background: "rgba(18, 220, 255, 0.02)", 
              border: "1px solid rgba(18, 220, 255, 0.08)", 
              borderRadius: "14px", 
              padding: "16px 20px" 
            }}>
              <h3 style={{ fontSize: "14px", color: "var(--cyan)", margin: "0 0 8px 0", fontWeight: "bold" }}>
                Anti-Phishing Action Plan
              </h3>
              <ul style={{ margin: 0, paddingLeft: "20px", fontSize: "12.5px", color: "#afbdd1", display: "grid", gap: "6px", lineHeight: "1.4" }}>
                <li>Never sign in to banking portals accessed via email/SMS links.</li>
                <li>Compare host URLs with official bookmarks.</li>
                <li>If you enter credentials on a dangerous link, change your bank password immediately and notify the bank.</li>
              </ul>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--muted)", gap: "16px" }}>
            <Icon name="tools" size={40} style={{ color: "var(--muted)" }} />
            <span>Start a scan by entering a URL in the scanner.</span>
          </div>
        )}
      </div>
    </div>
  );
}

function MyReportsSection({ onBack }) {
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/chat/reports`);
        if (!response.ok) {
          throw new Error("Failed to load reports from server.");
        }
        const data = await response.json();
        if (data.status === "success") {
          const filtered = data.reports.filter(rep => {
            const category = rep.report_data?.scam_category;
            const description = rep.report_data?.incident_description;
            if (!category && !description) return false;
            const title = category || description || "Untitled Complaint";
            const lowerTitle = title.toLowerCase().trim();
            if (lowerTitle.includes("no data extracted") || 
                lowerTitle.includes("untitled complaint") ||
                lowerTitle.includes("ready to analyze") ||
                lowerTitle === "scam" ||
                lowerTitle === "fraud" ||
                lowerTitle === "") {
              return false;
            }
            return true;
          });
          setReports(filtered);
          if (filtered.length > 0) {
            setSelectedReport(filtered[0]);
          }
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  const formatDate = (dateStr) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="profile-grid" style={{ height: "calc(100vh - 150px)", minHeight: "500px" }}>
      {/* Left Column: ChatGPT/Gemini-style Sidebar List of Complaints */}
      <div 
        className="side-card profile-card-left" 
        style={{ 
          justifyContent: "flex-start", 
          padding: "16px 14px", 
          display: "flex", 
          flexDirection: "column", 
          height: "100%",
          overflowY: "auto"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px", margin: "0 0 16px 8px" }}>
          <Icon name="file" size={22} style={{ color: "var(--cyan)" }} />
          <h2 style={{ margin: 0, color: "#ffffff", fontSize: "18px" }}>My Reports</h2>
        </div>

        {loading ? (
          <div style={{ padding: "20px", textAlign: "center", color: "var(--muted)", flexGrow: 1 }}>
            <span className="session-pulse" style={{ background: "var(--cyan)", display: "inline-block", marginRight: "8px" }} />
            Loading reports...
          </div>
        ) : error ? (
          <div style={{ padding: "20px", textAlign: "center", color: "var(--red)", flexGrow: 1 }}>
            <Icon name="alert" size={24} style={{ marginBottom: "8px" }} />
            <p style={{ margin: 0, fontSize: "13px" }}>{error}</p>
          </div>
        ) : reports.length === 0 ? (
          <div 
            style={{ 
              padding: "40px 10px", 
              textAlign: "center", 
              color: "var(--muted)", 
              flexGrow: 1, 
              display: "flex", 
              flexDirection: "column", 
              alignItems: "center", 
              justifyContent: "center",
              gap: "12px"
            }}
          >
            <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "rgba(100, 160, 235, 0.05)", border: "1px solid rgba(100, 160, 235, 0.12)", display: "grid", placeItems: "center" }}>
              <Icon name="file" size={28} style={{ color: "var(--muted)" }} />
            </div>
            <div>
              <strong style={{ color: "#ffffff", fontSize: "14px", display: "block" }}>No Reports Compiled Yet</strong>
              <p style={{ margin: "4px 0 0", fontSize: "12px", lineHeight: 1.4 }}>Complete a conversation with the AI assistant to generate your first complaint PDF.</p>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", width: "100%", flexGrow: 1, overflowY: "auto", paddingRight: "4px" }}>
            {reports.map((rep, idx) => {
              const isSelected = selectedReport?.generated_at === rep.generated_at;
              const formattedTitle = rep.report_data?.scam_category || rep.report_data?.incident_description || "Untitled Complaint";

              return (
                <button
                  key={idx}
                  className={`settings-menu-item ${isSelected ? "active" : ""}`}
                  style={{
                    padding: "12px 14px",
                    height: "auto",
                    minHeight: "unset",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    gap: "6px"
                  }}
                  onClick={() => setSelectedReport(rep)}
                  type="button"
                >
                  <div style={{ display: "flex", width: "100%", justifyContent: "space-between", alignItems: "center" }}>
                    <span 
                      style={{ 
                        fontWeight: "800", 
                        fontSize: "13px", 
                        color: isSelected ? "var(--cyan)" : "#ffffff",
                        textTransform: "capitalize",
                        whiteSpace: "normal",
                        lineHeight: 1.3
                      }}
                    >
                      {formattedTitle}
                    </span>
                    <Icon name="file" size={14} style={{ color: isSelected ? "var(--cyan)" : "var(--muted)", flexShrink: 0 }} />
                  </div>
                  <span style={{ fontSize: "10px", color: "var(--muted)", fontWeight: "normal" }}>
                    {formatDate(rep.generated_at)}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        <button className="profile-back-btn" onClick={onBack} type="button" style={{ marginTop: "auto", width: "100%" }}>
          <Icon name="chevronDown" size={16} style={{ transform: "rotate(90deg)" }} />
          <span>Back to Dashboard</span>
        </button>
      </div>

      {/* Right Column: PDF Viewer and Detailed Summary */}
      <div 
        className="side-card profile-vault-card" 
        style={{ 
          display: "flex", 
          flexDirection: "column", 
          height: "100%",
          padding: "20px"
        }}
      >
        {selectedReport ? (
          <div style={{ display: "flex", flexDirection: "column", height: "100%", gap: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(100,160,235,0.1)", paddingBottom: "14px" }}>
              <div>
                <h2 style={{ textTransform: "capitalize", fontSize: "18px", color: "#ffffff" }}>
                  {selectedReport.report_data?.scam_category || "Compiled Complaint"}
                </h2>
                <p style={{ margin: "4px 0 0", fontSize: "12px", color: "var(--muted)" }}>
                  Generated on {formatDate(selectedReport.generated_at)} • Session ID: {selectedReport.session_id}
                </p>
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <a 
                  href={`${API_BASE_URL}${selectedReport.report_url}`} 
                  target="_blank" 
                  rel="noreferrer"
                  className="assessor-btn"
                  style={{ textDecoration: "none", height: "36px", padding: "0 14px", display: "inline-flex", alignItems: "center" }}
                >
                  <Icon name="arrowRight" size={14} style={{ transform: "rotate(-45deg)" }} />
                  <span>Open in New Tab</span>
                </a>
              </div>
            </div>

            {/* Quick Metadata highlights */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "10px" }}>
              <div style={{ background: "rgba(13, 25, 45, 0.45)", border: "1px solid rgba(100, 160, 235, 0.08)", borderRadius: "8px", padding: "8px 12px" }}>
                <span style={{ fontSize: "10px", color: "var(--muted)", display: "block", textTransform: "uppercase" }}>Victim Name</span>
                <strong style={{ fontSize: "12px", color: "#ffffff" }}>{selectedReport.report_data?.victim_name || "N/A"}</strong>
              </div>
              <div style={{ background: "rgba(13, 25, 45, 0.45)", border: "1px solid rgba(100, 160, 235, 0.08)", borderRadius: "8px", padding: "8px 12px" }}>
                <span style={{ fontSize: "10px", color: "var(--muted)", display: "block", textTransform: "uppercase" }}>Amount Lost</span>
                <strong style={{ fontSize: "12px", color: "var(--red)" }}>
                  {selectedReport.report_data?.amount_lost ? `₹${selectedReport.report_data.amount_lost.toLocaleString()}` : "N/A"}
                </strong>
              </div>
              <div style={{ background: "rgba(13, 25, 45, 0.45)", border: "1px solid rgba(100, 160, 235, 0.08)", borderRadius: "8px", padding: "8px 12px" }}>
                <span style={{ fontSize: "10px", color: "var(--muted)", display: "block", textTransform: "uppercase" }}>Fraudster Phone</span>
                <strong style={{ fontSize: "12px", color: "#ffffff" }}>{selectedReport.report_data?.fraudster_phone || "N/A"}</strong>
              </div>
              <div style={{ background: "rgba(13, 25, 45, 0.45)", border: "1px solid rgba(100, 160, 235, 0.08)", borderRadius: "8px", padding: "8px 12px" }}>
                <span style={{ fontSize: "10px", color: "var(--muted)", display: "block", textTransform: "uppercase" }}>Transaction ID</span>
                <strong style={{ fontSize: "12px", color: "#ffffff" }}>{selectedReport.report_data?.transaction_id || "N/A"}</strong>
              </div>
            </div>

            {/* Embedded PDF Viewer Iframe */}
            <div style={{ flexGrow: 1, borderRadius: "12px", overflow: "hidden", border: "1px solid rgba(102, 161, 255, 0.16)", background: "#111b27" }}>
              <iframe
                src={`${API_BASE_URL}${selectedReport.report_url}#toolbar=1`}
                width="100%"
                height="100%"
                title="Complaint Report PDF"
                style={{ border: 0 }}
              />
            </div>
          </div>
        ) : (
          <div 
            style={{ 
              display: "flex", 
              flexDirection: "column", 
              alignItems: "center", 
              justifyContent: "center", 
              height: "100%", 
              color: "var(--muted)",
              gap: "16px"
            }}
          >
            <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: "rgba(100, 160, 235, 0.03)", border: "1px solid rgba(100, 160, 235, 0.08)", display: "grid", placeItems: "center" }}>
              <Icon name="file" size={36} style={{ color: "var(--muted)" }} />
            </div>
            <div style={{ textAlign: "center" }}>
              <h3>Select a report from the list to view</h3>
              <p style={{ margin: "6px 0 0", fontSize: "14px" }}>Click on any report in the left sidebar to render its official Gov-standard PDF report.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function AuthField({ icon, label, type = "text", placeholder, rightIcon, value, onChange, required }) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";

  return (
    <label className="auth-field">
      <span>{label}</span>
      <div style={{ position: 'relative' }}>
        <Icon name={icon} size={18} />
        <input 
          type={isPassword && showPassword ? "text" : type} 
          placeholder={placeholder ?? label} 
          value={value}
          onChange={onChange}
          required={required}
        />
        {rightIcon === "eye" && (
          <button 
            type="button" 
            onClick={() => setShowPassword(!showPassword)}
            style={{
              background: 'transparent',
              border: 0,
              padding: 0,
              color: 'inherit',
              cursor: 'pointer',
              display: 'grid',
              placeItems: 'center',
              outline: 'none'
            }}
          >
            <Icon name="eye" size={19} />
          </button>
        )}
      </div>
    </label>
  );
}

function AuthScreen({ mode, onModeChange, onAuthSuccess }) {
  const isRegister = mode === "register";

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agree, setAgree] = useState(true);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Seed default user on mount
  React.useEffect(() => {
    const existingUsers = safeLocalStorage.getItem("cyber_users");
    if (!existingUsers) {
      const defaultUsers = [
        {
          fullName: "Omkar",
          email: "omkar@gmail.com",
          mobile: "9876543210",
          password: "password123"
        }
      ];
      safeLocalStorage.setItem("cyber_users", JSON.stringify(defaultUsers));
    }
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (isRegister) {
      if (!fullName.trim() || !email.trim() || !mobile.trim() || !password.trim() || !confirmPassword.trim()) {
        setError("All fields are required.");
        return;
      }
      if (!/\S+@\S+\.\S+/.test(email)) {
        setError("Please enter a valid email address.");
        return;
      }
      if (mobile.trim().length !== 10 || isNaN(mobile)) {
        setError("Mobile number must be a valid 10-digit number.");
        return;
      }
      if (password.length < 6) {
        setError("Password must be at least 6 characters long.");
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }
      if (!agree) {
        setError("You must agree to the privacy & security policies.");
        return;
      }

      // Check if user already exists
      const users = JSON.parse(safeLocalStorage.getItem("cyber_users") || "[]");
      if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
        setError("An account with this email already exists.");
        return;
      }

      // Add user to simulated DB (localStorage)
      const newUser = { fullName, email, mobile, password };
      users.push(newUser);
      safeLocalStorage.setItem("cyber_users", JSON.stringify(users));

      setSuccess("Account created successfully! Redirecting to login...");
      setTimeout(() => {
        onModeChange("login");
      }, 1500);

    } else {
      if (!email.trim() || !password.trim()) {
        setError("Please fill in all fields.");
        return;
      }

      const users = JSON.parse(safeLocalStorage.getItem("cyber_users") || "[]");
      const matchedUser = users.find(
        (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
      );

      if (!matchedUser) {
        setError("Invalid email or password.");
        return;
      }

      // Save session
      safeLocalStorage.setItem("currentUser", JSON.stringify(matchedUser));
      onAuthSuccess();
    }
  };

  return (
    <main className="auth-page">
      <button className="language-selector" type="button">
        <Icon name="globe" size={22} />
        <span>English</span>
        <Icon name="chevronDown" size={18} />
      </button>

      <section className="auth-hero-panel" aria-label="Cyber Suraksha AI security identity">
        <div className="auth-circuit-field" aria-hidden="true" />
        <div className="shield-orbit">
          <div className="shield-lock">
            <Icon name="shield" size={112} />
            <Icon name="lock" size={44} />
          </div>
        </div>
        <div className="auth-product-copy">
          <h1>
            Cyber
            <span>Suraksha AI</span>
          </h1>
          <p>AI-Powered Cyber Fraud Reporting Assistant</p>
        </div>
        <div className="auth-safe-note">
          <span>
            <Icon name="shield" size={19} />
          </span>
          <div>
            <strong>Secure. Private. Protected.</strong>
            <p>Your safety is our priority.</p>
          </div>
        </div>
      </section>

      <section className={`auth-card ${isRegister ? "register" : ""}`}>
        <div className="auth-card-logo">
          <Icon name="shield" size={104} />
        </div>

        <div className="auth-heading">
          <h1>{isRegister ? "Create Account" : "Welcome Back"}</h1>
          <p>
            {isRegister
              ? "Register to continue to Cyber Suraksha AI"
              : "Login to continue to Cyber Suraksha AI"}
          </p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(255, 64, 87, 0.12)',
            border: '1px solid rgba(255, 64, 87, 0.36)',
            borderRadius: '8px',
            color: '#ff8b98',
            padding: '10px 14px',
            fontSize: '13px',
            fontWeight: '700',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginTop: '12px'
          }}>
            <Icon name="alert" size={16} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div style={{
            background: 'rgba(39, 212, 111, 0.12)',
            border: '1px solid rgba(39, 212, 111, 0.36)',
            borderRadius: '8px',
            color: '#aaf4cf',
            padding: '10px 14px',
            fontSize: '13px',
            fontWeight: '700',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginTop: '12px'
          }}>
            <Icon name="check" size={16} />
            <span>{success}</span>
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          {isRegister && (
            <AuthField 
              icon="user" 
              label="Full Name" 
              placeholder="Omkar" 
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          )}
          <AuthField
            icon="mail"
            label="Email Address"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {isRegister && (
            <AuthField 
              icon="phone" 
              label="Mobile Number" 
              placeholder="Enter mobile number" 
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
            />
          )}
          <AuthField
            icon="lock"
            label="Password"
            type="password"
            placeholder="Enter your password"
            rightIcon="eye"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {isRegister && (
            <AuthField
              icon="lock"
              label="Confirm Password"
              type="password"
              placeholder="Confirm password"
              rightIcon="eye"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          )}
          {isRegister && (
            <label className="policy-row">
              <input 
                type="checkbox" 
                checked={agree} 
                onChange={(e) => setAgree(e.target.checked)}
              />
              <span>I agree to privacy & security policies</span>
            </label>
          )}

          {!isRegister && (
            <button className="forgot-link" type="button">
              Forgot Password?
            </button>
          )}

          <button className="auth-primary" type="submit">
            <span>{isRegister ? "Register" : "Login"}</span>
            <Icon name="arrowRight" size={22} />
          </button>
        </form>

        <p className="auth-switch">
          {isRegister ? "Already have an account?" : "Don’t have an account?"}
          <button
            type="button"
            onClick={() => onModeChange(isRegister ? "login" : "register")}
          >
            {isRegister ? "Login" : "Register"}
          </button>
        </p>
      </section>

      <section className="auth-trust-bar" aria-label="Security trust indicators">
        <div>
          <Icon name="shield" size={34} />
          <span>
            <strong>End-to-End Encrypted</strong>
            <p>All your data is encrypted and securely protected</p>
          </span>
        </div>
        <div>
          <Icon name="lock" size={34} />
          <span>
            <strong>Secure & Private</strong>
            <p>We never share your data with third parties</p>
          </span>
        </div>
        <div>
          <Icon name="shieldStar" size={34} />
          <span>
            <strong>Trusted & Safe</strong>
            <p>Built for your safety with advanced security</p>
          </span>
        </div>
      </section>

      <p className="auth-footer">© 2024 Cyber Suraksha AI. All rights reserved.</p>
    </main>
  );
}

function Dashboard({ onLogout, pathname, navigateTo }) {
  const [currentUser] = useState(() => {
    try {
      const stored = safeLocalStorage.getItem("currentUser");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === "object") {
          return parsed;
        }
      }
    } catch (e) {
      console.error("Error parsing currentUser from storage:", e);
    }
    return { fullName: "Omkar" };
  });

  const userName = currentUser?.fullName || currentUser?.name || "Omkar";
  
  // Generate a unique session ID persisted for the active workspace flow
  const [sessionId] = useState(() => {
    const slug = (userName || "omkar").toLowerCase().replace(/\s+/g, '-');
    return `session-${slug}-${Math.random().toString(36).substring(2, 9)}`;
  });
  
  // Dynamic message history initialized with the AI welcome prompt
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: `Hello ${userName}! Welcome to Cyber Suraksha AI—your secure, automated cyber crime reporting assistant.

How can I assist you today? Please feel free to describe any cyber incident in your own words, select a quick category below, or upload a transaction PDF to begin compiling your official complaint report.`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  
  // Glowing processing spinner status
  const [isTyping, setIsTyping] = useState(false);
  
  // Live extracted fraud profile synchronized from backend Pydantic models
  const [extractedData, setExtractedData] = useState({
    victim_name: null,
    victim_phone: null,
    victim_alternate_phone: null,
    victim_email: null,
    victim_aadhaar: null,
    victim_gender: null,
    victim_dob: null,
    victim_address: null,
    victim_city: null,
    victim_state: null,
    victim_pincode: null,
    date_of_fraud: null,
    time_of_fraud: null,
    scam_category: null,
    incident_description: "Ready to analyze report.",
    amount_lost: null,
    was_money_deducted: null,
    fraudster_phone: null,
    fraudster_email: null,
    fraudster_description: null,
    website_link: null,
    social_media_account: null,
    whatsapp_number: null,
    telegram_id: null,
    bank_name: null,
    account_number: null,
    upi_id: null,
    payment_app_used: null,
    transaction_id: null,
    transaction_date: null,
    transaction_amount: null,
    receiver_upi_id: null,
    device_mobile_number: null,
    device_type: null,
    device_brand_model: null,
    device_ip: null,
    installed_suspicious_app: null,
    any_remote_access_app: null,
    reported_to_bank: null,
    bank_reference_no: null,
    called_1930: null,
    ticket_1930_id: null,
    complaint_submitted_i4c: null,
    timeline_events: [],
    scammer_identifiers: [],
    is_complete: false,
    missing_fields: ["victim_name", "victim_phone", "amount_lost", "scam_category", "date_of_fraud"]
  });
  
  const [progress, setProgress] = useState(20); // Base progress starting at 20%
  const [reportUrl, setReportUrl] = useState(null);

  // Syncing function checking /extract API and updating visual progress metrics
  const syncExtractionData = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/chat/extract`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId })
      });
      if (response.ok) {
        const data = await response.json();
        if (data.status === "success") {
          setExtractedData(data.extracted_data);
          setReportUrl(data.report_url);
          
          // Calculate progress strictly: 10% base + 15% per completed I4C block!
          const d = data.extracted_data;
          const blocks = {
            victim: !!(d.victim_name || d.victim_phone || d.victim_email),
            incident: !!(d.amount_lost || d.date_of_fraud || d.scam_category),
            fraudster: !!(d.fraudster_phone || d.website_link || d.social_media_account || d.whatsapp_number),
            bank: !!(d.bank_name || d.account_number || d.upi_id || d.transaction_id),
            device: !!(d.device_type || d.installed_suspicious_app || d.any_remote_access_app),
            status: !!(d.reported_to_bank || d.called_1930 || d.complaint_submitted_i4c)
          };
          const completedCount = Object.values(blocks).filter(Boolean).length;
          const calculatedProgress = Math.min(100, 10 + completedCount * 15);
          setProgress(calculatedProgress);
        }
      }
    } catch (error) {
      console.error("Error syncing extraction progress:", error);
    }
  };

  // Conversational exchange POST action
  const handleSendMessage = async (userMessage) => {
    if (!userMessage.trim()) return;

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // 1. Append user bubble locally
    setMessages(prev => [...prev, { role: "user", content: userMessage, time: timestamp }]);
    setIsTyping(true);

    try {
      // 2. Query chat endpoint
      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage, session_id: sessionId })
      });
      if (response.ok) {
        const data = await response.json();
        
        // 3. Append assistant bubble
        setMessages(prev => [...prev, {
          role: "assistant",
          content: data.reply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);

        // 4. Synchronize data extraction and progress
        await syncExtractionData();
      }
    } catch (error) {
      console.error("Error sending chat message:", error);
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "I am having trouble reaching the server. Please verify that your FastAPI backend is running locally on port 8000.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  // Document evidence statement upload POST action
  const handleUploadPdf = async (file) => {
    setIsTyping(true);
    const formData = new FormData();
    formData.append("session_id", sessionId);
    formData.append("file", file);

    try {
      const response = await fetch(`${API_BASE_URL}/api/chat/upload`, {
        method: "POST",
        body: formData
      });
      if (response.ok) {
        const data = await response.json();

        // 1. Append AI contextual response
        setMessages(prev => [...prev, {
          role: "assistant",
          content: data.ai_reply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);

        // 2. Synchronize progress
        await syncExtractionData();
      }
    } catch (error) {
      console.error("Error uploading statement receipt:", error);
    } finally {
      setIsTyping(false);
    }
  };

  const activeView = pathname === "/profile" ? "profile" 
                   : pathname === "/settings" ? "settings" 
                   : pathname === "/security-center" ? "security_center" 
                   : pathname === "/contact-support" ? "help_support"
                   : pathname === "/my-reports" ? "my_reports"
                   : pathname === "/awareness-hub" ? "awareness_hub"
                   : pathname === "/safety-tools" ? "safety_tools"
                   : "dashboard";

  const handleSelectMenuItem = (label) => {
    if (label === "My Profile") {
      navigateTo("/profile");
    } else if (label === "Account Settings") {
      navigateTo("/settings");
    } else if (label === "Security Center") {
      navigateTo("/security-center");
    } else if (label === "Help & Support") {
      navigateTo("/contact-support");
    }
  };

  return (
    <main className="dashboard-shell">
      <Sidebar pathname={pathname} navigateTo={navigateTo} />
      <div className="workspace">
        <Header onLogout={onLogout} userName={userName} onSelectMenuItem={handleSelectMenuItem} />
        {activeView === "profile" ? (
          <ProfileSection userName={userName} onBack={() => navigateTo("/dashboard")} />
        ) : activeView === "settings" ? (
          <AccountSettingsSection onBack={() => navigateTo("/dashboard")} />
        ) : activeView === "security_center" ? (
          <SecurityCenterSection onBack={() => navigateTo("/dashboard")} />
        ) : activeView === "help_support" ? (
          <HelpSupportSection onBack={() => navigateTo("/dashboard")} />
        ) : activeView === "my_reports" ? (
          <MyReportsSection onBack={() => navigateTo("/dashboard")} />
        ) : activeView === "awareness_hub" ? (
          <AwarenessHubSection onBack={() => navigateTo("/dashboard")} />
        ) : activeView === "safety_tools" ? (
          <SafetyToolsSection onBack={() => navigateTo("/dashboard")} />
        ) : (
          <div className="content-grid">
            <ChatPanel 
              messages={messages} 
              isTyping={isTyping} 
              onSendMessage={handleSendMessage} 
              onUploadPdf={handleUploadPdf} 
            />
            <RightPanel 
              progress={progress} 
              reportUrl={reportUrl} 
              extractedData={extractedData} 
            />
          </div>
        )}
      </div>
    </main>
  );
}

function App() {
  const [pathname, setPathname] = React.useState(window.location.pathname);
  const [isLoggedIn, setIsLoggedIn] = React.useState(() => {
    try {
      return safeLocalStorage.getItem("isLoggedIn") === "true";
    } catch {
      return false;
    }
  });

  React.useEffect(() => {
    const handlePopState = () => {
      setPathname(window.location.pathname);
      try {
        setIsLoggedIn(safeLocalStorage.getItem("isLoggedIn") === "true");
      } catch {
        setIsLoggedIn(false);
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const navigateTo = (path) => {
    window.history.pushState({}, "", path);
    setPathname(path);
  };

  // Determine active view based on client-side routing
  let view = "login";
  if (pathname === "/register") {
    view = "register";
  } else if (pathname === "/login") {
    view = "login";
  } else if (
    pathname === "/" || 
    pathname === "/dashboard" || 
    pathname === "/profile" || 
    pathname === "/settings" || 
    pathname === "/security-center" ||
    pathname === "/my-reports" ||
    pathname === "/awareness-hub" ||
    pathname === "/safety-tools" ||
    pathname === "/contact-support"
  ) {
    if (isLoggedIn) {
      view = "dashboard";
    } else {
      window.history.replaceState({}, "", "/login");
      view = "login";
    }
  } else {
    window.history.replaceState({}, "", isLoggedIn ? "/" : "/login");
    view = isLoggedIn ? "dashboard" : "login";
  }

  const handleModeChange = (newMode) => {
    navigateTo(newMode === "register" ? "/register" : "/login");
  };

  const handleAuthSuccess = () => {
    safeLocalStorage.setItem("isLoggedIn", "true");
    setIsLoggedIn(true);
    navigateTo("/");
  };

  const handleLogout = () => {
    safeLocalStorage.removeItem("isLoggedIn");
    safeLocalStorage.removeItem("currentUser");
    setIsLoggedIn(false);
    navigateTo("/login");
  };

  if (view === "login" || view === "register") {
    return (
      <AuthScreen
        mode={view}
        onModeChange={handleModeChange}
        onAuthSuccess={handleAuthSuccess}
      />
    );
  }

  return <Dashboard onLogout={handleLogout} pathname={pathname} navigateTo={navigateTo} />;
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
