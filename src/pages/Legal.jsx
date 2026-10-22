import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const TABS = [
  { id: "mentions", label: "Legal Notices" },
  { id: "privacy", label: "Privacy Policy" },
  { id: "terms", label: "Terms of Use" },
  { id: "cookies", label: "Cookie Policy" },
];

export default function Legal() {
  const [activeTab, setActiveTab] = useState("mentions");

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FFF9E8", color: "#1a1a1a" }}>
      {/* Header */}
      <div className="sticky top-0 z-10 border-b" style={{ backgroundColor: "#FFF9E8", borderColor: "#E8DFC8" }}>
        <div className="max-w-2xl mx-auto px-5 py-4 flex items-center gap-3">
          <Link
            to="/"
            className="flex items-center gap-1.5 text-xs tracking-[0.15em] uppercase font-light"
            style={{ color: "#0B3C26" }}
          >
            <ArrowLeft size={14} />
            Back
          </Link>
          <span style={{ color: "#C8B06A", fontSize: "10px" }}>·</span>
          <span className="text-xs tracking-[0.2em] uppercase font-light" style={{ color: "#0B3C26" }}>
            La Muse
          </span>
        </div>

        {/* Tabs */}
        <div className="max-w-2xl mx-auto px-5 flex gap-0 overflow-x-auto scrollbar-hide">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="pb-3 pt-1 px-3 text-[10px] tracking-[0.18em] uppercase font-light whitespace-nowrap transition-all border-b-2"
              style={{
                color: activeTab === tab.id ? "#0B3C26" : "#9a9082",
                borderBottomColor: activeTab === tab.id ? "#C8B06A" : "transparent",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-5 py-8">

        {/* ── MENTIONS LÉGALES ── */}
        {activeTab === "mentions" && (
          <section>
            <h1 className="text-lg font-light tracking-[0.2em] uppercase mb-1" style={{ color: "#0B3C26" }}>
              Legal Notices
            </h1>
            <p className="text-[10px] tracking-[0.15em] uppercase mb-8" style={{ color: "#C8B06A" }}>
              Mentions légales
            </p>

            <Block title="Publisher">
              <p>La Muse is published by <strong>[COMPANY NAME]</strong>, a company registered under number <strong>[SIRET]</strong>.</p>
              <p className="mt-2">Registered address: <strong>[ADDRESS, CITY, COUNTRY]</strong></p>
              <p className="mt-2">Contact: <strong>[EMAIL ADDRESS]</strong></p>
            </Block>

            <Block title="Hosting">
              <p>This application is hosted by <strong>Base44</strong> and deployed via cloud infrastructure. Server locations comply with applicable EU data residency requirements.</p>
            </Block>

            <Block title="Publication Director">
              <p>The publication director is the founder of La Muse.</p>
              <p className="mt-2">For any legal enquiry: <strong>[LEGAL EMAIL]</strong></p>
            </Block>

            <Block title="Intellectual Property">
              <p>All content on La Muse — including text, design, visual identity, and functionality — is the exclusive property of the publisher and is protected under applicable intellectual property law. Reproduction without prior written consent is prohibited.</p>
              <p className="mt-2">Product images and descriptions are sourced from publicly available brand and retailer websites and are used for informational purposes only. La Muse claims no ownership over third-party brand assets.</p>
            </Block>

            <Block title="Affiliate Disclosure">
              <p>La Muse may include affiliate links to partner retailers. When you purchase through these links, we may receive a commission at no additional cost to you. Affiliate relationships do not influence editorial recommendations.</p>
            </Block>

            <Note>
              Fields marked [BRACKETS] will be completed upon company registration. This page will be updated accordingly.
            </Note>
          </section>
        )}

        {/* ── PRIVACY POLICY ── */}
        {activeTab === "privacy" && (
          <section>
            <h1 className="text-lg font-light tracking-[0.2em] uppercase mb-1" style={{ color: "#0B3C26" }}>
              Privacy Policy
            </h1>
            <p className="text-[10px] tracking-[0.15em] uppercase mb-8" style={{ color: "#C8B06A" }}>
              Politique de confidentialité · RGPD
            </p>

            <Block title="Who we are">
              <p>La Muse ("we", "us") is a beauty product discovery application. We are committed to protecting your personal data in accordance with the EU General Data Protection Regulation (GDPR / RGPD).</p>
            </Block>

            <Block title="Data we collect">
              <ul className="space-y-1.5 list-none">
                <Li>Email address (account creation and authentication)</Li>
                <Li>Display name and profile preferences (optional)</Li>
                <Li>Scan history — products you have scanned or searched</Li>
                <Li>Wishlist and shopping list contents</Li>
                <Li>Skin concerns and ingredient preferences (if provided during onboarding)</Li>
                <Li>Community posts and reviews you publish</Li>
                <Li>Usage data — pages visited, features used (analytics only)</Li>
              </ul>
            </Block>

            <Block title="Why we collect it">
              <ul className="space-y-1.5 list-none">
                <Li>To operate your account and personalise your experience</Li>
                <Li>To sync your scan history, wishlist, and categories</Li>
                <Li>To power AI-assisted product recommendations (The Muse)</Li>
                <Li>To send service emails you have opted in to</Li>
                <Li>To improve the app through anonymised analytics</Li>
              </ul>
            </Block>

            <Block title="Third-party services we use">
              <p className="mb-3">La Muse integrates the following third-party services. Each has its own privacy policy.</p>
              <ul className="space-y-1.5 list-none">
                <Li><strong>Apify</strong> — product data retrieval. <a href="https://apify.com/privacy-policy" target="_blank" rel="noopener noreferrer" style={{ color: "#C8B06A" }}>Privacy policy ↗</a></Li>
                <Li><strong>Google Gemini AI</strong> — product analysis and recommendations. <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" style={{ color: "#C8B06A" }}>Privacy policy ↗</a></Li>
                <Li><strong>Groq</strong> — AI inference for The Muse chatbot. <a href="https://groq.com/privacy-policy/" target="_blank" rel="noopener noreferrer" style={{ color: "#C8B06A" }}>Privacy policy ↗</a></Li>
              </ul>
              <p className="mt-3">We share only the minimum data required for each service to function. We do not sell your personal data to any third party.</p>
            </Block>

            <Block title="Data retention">
              <p>We retain your personal data for as long as your account is active. If you delete your account, all associated personal data is permanently removed within 30 days, except where retention is required by law.</p>
            </Block>

            <Block title="Your rights (GDPR)">
              <ul className="space-y-1.5 list-none">
                <Li>Right of access — request a copy of your data</Li>
                <Li>Right of rectification — correct inaccurate data</Li>
                <Li>Right of erasure — delete your account and all data</Li>
                <Li>Right to portability — export your data</Li>
                <Li>Right to object — opt out of non-essential processing</Li>
              </ul>
              <p className="mt-3">To exercise these rights, go to <strong>Account → Privacy & Data</strong> in the app, or contact us at <strong>[PRIVACY EMAIL]</strong>.</p>
            </Block>

            <Block title="Data deletion">
              <p>You can request full deletion of your account and data at any time from <strong>Account → Privacy & Data → Delete My Account</strong>. Deletion is permanent and irreversible.</p>
            </Block>

            <Block title="Contact">
              <p>Data controller: <strong>[COMPANY NAME]</strong> — <strong>[PRIVACY EMAIL]</strong></p>
            </Block>
          </section>
        )}

        {/* ── TERMS OF USE ── */}
        {activeTab === "terms" && (
          <section>
            <h1 className="text-lg font-light tracking-[0.2em] uppercase mb-1" style={{ color: "#0B3C26" }}>
              Terms of Use
            </h1>
            <p className="text-[10px] tracking-[0.15em] uppercase mb-8" style={{ color: "#C8B06A" }}>
              Conditions générales d'utilisation (CGU)
            </p>

            <Block title="Acceptance">
              <p>By creating an account or using La Muse, you agree to these Terms of Use. If you do not agree, please do not use the application.</p>
            </Block>

            <Block title="Service description">
              <p>La Muse is a beauty product discovery application that allows users to scan, search, save, and discuss beauty and personal care products. The service includes:</p>
              <ul className="space-y-1.5 list-none mt-3">
                <Li>Product scanning and AI-assisted analysis</Li>
                <Li>Wishlist, shopping list, and collection features</Li>
                <Li>Community reviews and Circle Rooms</Li>
                <Li>AI chatbot recommendations (The Muse)</Li>
                <Li>Local services map</Li>
              </ul>
            </Block>

            <Block title="Eligibility">
              <p>La Muse is intended for users aged 16 and over. By registering, you confirm that you meet this age requirement. Users under 16 must obtain parental or guardian consent before creating an account.</p>
            </Block>

            <Block title="Account">
              <p>You are responsible for keeping your login credentials secure. You may not share your account or use the service on behalf of another person without their consent.</p>
            </Block>

            <Block title="Community standards">
              <p>When contributing to The Circle or community features, you agree not to:</p>
              <ul className="space-y-1.5 list-none mt-3">
                <Li>Post false, misleading, or fabricated reviews</Li>
                <Li>Harass, demean, or target other users</Li>
                <Li>Share spam, promotional content without disclosure, or malicious links</Li>
                <Li>Impersonate brands, professionals, or other users</Li>
              </ul>
              <p className="mt-3">We reserve the right to remove content or suspend accounts that violate these standards.</p>
            </Block>

            <Block title="Product information">
              <p>Product data on La Muse is sourced from publicly available information and AI analysis. We do not guarantee the accuracy, completeness, or currency of ingredient lists, prices, or availability. Always verify product information with the brand or retailer before purchase.</p>
            </Block>

            <Block title="Affiliate links">
              <p>Some product links on La Muse are affiliate links. Clicking these may result in a commission to us. This does not affect the price you pay. Affiliate relationships do not influence which products we show or recommend.</p>
            </Block>

            <Block title="No medical advice">
              <p>Nothing on La Muse constitutes medical, dermatological, or health advice. Ingredient analysis and skin concern matching are for informational purposes only. Consult a qualified professional for medical guidance.</p>
            </Block>

            <Block title="Intellectual property">
              <p>You retain ownership of content you post (reviews, photos). By posting, you grant La Muse a non-exclusive licence to display your content within the app. We will never sell your content to third parties.</p>
            </Block>

            <Block title="Limitation of liability">
              <p>La Muse is provided "as is". We are not liable for any indirect damages arising from use of the service, including but not limited to skin reactions resulting from products discovered through the app.</p>
            </Block>

            <Block title="Changes to terms">
              <p>We may update these terms. We will notify you by email before significant changes take effect. Continued use after notification constitutes acceptance.</p>
            </Block>

            <Block title="Governing law">
              <p>These terms are governed by French law. Any dispute will be subject to the jurisdiction of French courts.</p>
            </Block>
          </section>
        )}

        {/* ── COOKIE POLICY ── */}
        {activeTab === "cookies" && (
          <section>
            <h1 className="text-lg font-light tracking-[0.2em] uppercase mb-1" style={{ color: "#0B3C26" }}>
              Cookie Policy
            </h1>
            <p className="text-[10px] tracking-[0.15em] uppercase mb-8" style={{ color: "#C8B06A" }}>
              Politique cookies
            </p>

            <Block title="What are cookies">
              <p>Cookies are small text files stored on your device when you use a web application. They help the app remember your preferences and function correctly between sessions.</p>
            </Block>

            <Block title="Cookies we use">
              <p className="mb-4">La Muse uses a minimal set of cookies, classified below:</p>

              <div className="space-y-4">
                <CookieRow
                  type="Essential"
                  purpose="Authentication session, account preferences, dark/light mode, accessibility settings"
                  required={true}
                />
                <CookieRow
                  type="Functional"
                  purpose="Remembering your last viewed tab, scan history display preferences, language settings"
                  required={false}
                />
                <CookieRow
                  type="Analytics"
                  purpose="Anonymous usage statistics to improve the app (no personal data, no cross-site tracking)"
                  required={false}
                />
              </div>
            </Block>

            <Block title="What we do not use">
              <ul className="space-y-1.5 list-none">
                <Li>No advertising or retargeting cookies</Li>
                <Li>No third-party tracking pixels</Li>
                <Li>No data sold to ad networks</Li>
                <Li>No fingerprinting or invasive tracking</Li>
              </ul>
            </Block>

            <Block title="Your choices">
              <p>When you first use La Muse, you are asked to accept or decline non-essential cookies. You can change your choice at any time in <strong>Account → Privacy & Data → Cookie Preferences</strong>.</p>
              <p className="mt-2">Declining non-essential cookies will not affect the core functionality of the app.</p>
            </Block>

            <Block title="Browser controls">
              <p>You can also manage cookies through your browser settings. Note that disabling all cookies may affect authentication and app functionality.</p>
            </Block>

            <Block title="Updates">
              <p>This policy may be updated as we add or remove features. Significant changes will be notified in-app.</p>
            </Block>
          </section>
        )}

        {/* Footer */}
        <div className="mt-12 pt-6 border-t text-center" style={{ borderColor: "#E8DFC8" }}>
          <p className="text-[9px] tracking-[0.15em] uppercase" style={{ color: "#C8B06A" }}>
            La Muse · Last updated October 2026
          </p>
          <Link
            to="/"
            className="inline-block mt-3 text-[9px] tracking-[0.15em] uppercase"
            style={{ color: "#9a9082" }}
          >
            Return to app
          </Link>
        </div>

      </div>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function Block({ title, children }) {
  return (
    <div className="mb-7">
      <h2 className="text-[10px] tracking-[0.2em] uppercase font-medium mb-3" style={{ color: "#C8B06A" }}>
        {title}
      </h2>
      <div className="text-sm font-light leading-relaxed" style={{ color: "#3a3530" }}>
        {children}
      </div>
    </div>
  );
}

function Li({ children }) {
  return (
    <li className="flex gap-2 text-sm font-light leading-relaxed" style={{ color: "#3a3530" }}>
      <span style={{ color: "#C8B06A", flexShrink: 0 }}>·</span>
      <span>{children}</span>
    </li>
  );
}

function Note({ children }) {
  return (
    <div className="mt-6 p-4 rounded-xl text-xs font-light leading-relaxed" style={{ backgroundColor: "#EFE9DC", color: "#7a7060" }}>
      {children}
    </div>
  );
}

function CookieRow({ type, purpose, required }) {
  return (
    <div className="p-3 rounded-xl" style={{ backgroundColor: "#EFE9DC" }}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] tracking-[0.15em] uppercase font-medium" style={{ color: "#0B3C26" }}>
          {type}
        </span>
        <span
          className="text-[9px] tracking-[0.12em] uppercase px-2 py-0.5 rounded-full"
          style={{
            backgroundColor: required ? "#0B3C26" : "#E8DFC8",
            color: required ? "#FFF9E8" : "#9a9082",
          }}
        >
          {required ? "Required" : "Optional"}
        </span>
      </div>
      <p className="text-xs font-light leading-relaxed" style={{ color: "#5a5040" }}>
        {purpose}
      </p>
    </div>
  );
}
