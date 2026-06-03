"use client";

import { useState, useEffect } from "react";
import { SwanLogo } from "./LandingScreen";
import { useToast } from "./ToastContext";

interface Props {
  onVanity: () => void;
  onProducts: () => void;
  onScan: () => void;
  onVoice: () => void;
  onBack: () => void;
  onInput?: () => void;
  onEditorial?: () => void;
  onReviews?: () => void;
  onAccessibility?: () => void;
  onExtension?: () => void;
  onHaircare?: () => void;
  onBody?: () => void;
  onSearch?: () => void;
  onWellness?: () => void;
  onIntimate?: () => void;
  onParapharmacy?: () => void;
  onSocial?: () => void;
  onProfile?: () => void;
  onNotifications?: () => void;
  onMuseBox?: () => void;
  onMap?: () => void;
  onRoutine?: () => void;
}

// ─── Types ─────────────────────────────────────────────────────────────────────
type Category = {
  id: string; label: string; sub: string;
  gradient: string; accent: string; icon: string;
  photo?: string;
};

// ─── Stitch AI image assets ────────────────────────────────────────────────────
const IMGS = {
  botanicalSerum:  "https://lh3.googleusercontent.com/aida-public/AB6AXuA-yQk1Vprf4wB3aVc_OzAOOlBsO6bCP628MCOgDCEHbQhJ4aV0CaDMSzdavo1htSxaLcECEGtzu3y6tzWRLtuqJd6umP55mxu0D72TXb2CvpsGIRGwkkqBmYLr9-rEG9heNYNeCLThmGjXkSrVwHjpwIAP0OpFKAjXamVlm1aJHhFcRD9AvoO9T4lD-OzXpnApvj9uvVlk3CkXrg6q2QZoBQVwSbsAF5nTxg0HC1T43G2POzC7UzzkCSrtmbnTQzWzManOlYywsjt2",
  springAwakening: "https://lh3.googleusercontent.com/aida-public/AB6AXuC0wwEdDQR2CUVs-gePtcXvh_R0avV_ZTrRH1i7wN_r3FlleviLQeY1IBiAx97BTSPz0GQr3FbESwuGfzNO9VP7X_50xwK_m1kBgd7cA2Za5JRFa9oKfHWFLyzND8RBrct9WQvPQIrMNT9shbvkRGI_gjOFi_4H5tWdODwKaW9JQTKlSAHvEnx5YHQ0Wr8YU2WT1RW1Pt2DCn3dKiP3trwZhox-wXza0cOMAwDglNBFtdbSp4ls9CHzzJcge-8j326hYzG44_0q77_Z",
  jadeRenewal:     "https://lh3.googleusercontent.com/aida-public/AB6AXuD3IqY-2AZRkfQAN3pN9NIToQFrIBIK9WbPze9lxDXqMihdyDzVcA_6aBpNLBtnen8-C76B9pQA2Hdk9rOKga9L1ls1aHPcyh9mve5Eohhb477D2D9rDYVvtY-Bb0UpkQvKUrmxDLoGnoQd1e-POV5hjjx4FV6c4d5pW-lRnx7x0cwfB0pYIJvy-Qw1z0IVZGWdLqP4B7QmH0bHTEJ7ugmLgdJrd9M5VzxXSkYc9Nq8xiTANMvxNdvi6ZxmXxQ5ijGi3rxUhFa_Ewqz",
  goldenElixir:    "https://lh3.googleusercontent.com/aida-public/AB6AXuD-cjCfv1sJtUb5FNhS_r1BJPIIxzqms5eQItZ5RNNpomQndk3yeGRNaY0JM56S-0kFE_SnLl9hFr9OA5QxL7evdHBMDs44gwjt9bEN1Gfe1Q9Sahj1eQ5RJIWwksbyX-rmVEKbEsP7eiJp27Grvd8MG0RG6MlkE111U4WYmbIdAGgiAhex8IMf6wnNI9f-cfx4V6W1MJmLuwM6X6vY63d66gSIOSWQDA2SsX_MmfNd2ubTk9zK_KMSkJvNalRLvT5hyUNnOVBdjup1",
  fragrance:       "https://lh3.googleusercontent.com/aida-public/AB6AXuAUwkKJDEdMdzlVXMCB8i5beuSh3vKRRPYAMUcF4ilX1nLVWjyAN-lruv7k-HyoNtzPHDaNsjsh_GO9ijWDteQXzP1zamz5QVey2CT5aUIimBuHploOL_jsHQVZtCCn_wCdn847UQjr6quVMg3LnrA1VenRBZFe50TQU7RY1hnZvoBeQoE4G2beRciJzklClMVW4SmiUw7Uxp43OI2yTmRlfxopvwFc29m_PMEDcQFYvfVLWkm-g0IHqdLJjjSG1gaT_fzTi4NIQLjl",
  clayMask:        "https://lh3.googleusercontent.com/aida-public/AB6AXuBVYnnS62AwRsGnJqDNnUNg9M02tAS9tC44Qnuv_GyKJOw6aYDGvL8iWcvgLGyuV-Zd77pzClfckY8Zu8P1O3hhNYGQ8ud5jl30E10dClIX_8I35wLxrtcWNkzSRc3pjo3VWAwoXjRPAZdkKUG8ltErpy-ZDduMjZgZiY4DjjTP33lgY3wK2hPFo9xRACRS3fBlYjRv0vS2FIy_NBGQlEmxUote9MZiyZ-aQmp30esJtXCUoCeqEpxDviZLvzQEgJso1bXrySnD4by8",
  skincareModel:   "https://lh3.googleusercontent.com/aida-public/AB6AXuClvx_YVWOjMNFawsC2jxE8dWuhiNa2IEI7S7IwOVc7WsfjLrPCsoyHPG7A2oqT8m3UaJPW3_7N1vOUHm9Z3K-88XLx3exCm_2vDzdsXxwniLsomXm-DSZXJi1DN9jTrDsXO3EOm7PCeXrUuTRd4mk5-ZLdmfn9m8VWAiDPWLV-iis89Z6XgMTnXOvRWkqJoNcVZZPpa6Eu4tXBRveFWooYlsQHRgokhNLNnA1gi_62qmBKIt5UqTOTocW18Y6PUV9k76KOKySgVK_8",
  copperTools:     "https://lh3.googleusercontent.com/aida-public/AB6AXuAiiEFnb9ujv-HlQQbhcCQDSmmP9Kw7K0vZVPqo_stM_zzJkkIm-lfIBDgygrFVB0xNJEfC4wqCXHaravk7J6Tz4qPxlzYzQ1ycmBgn3m24p0-eJyCfaJ7kasamMZue4X-_vcTaCO1z44Dg-q8hU6c0ZiZ6N2QgMEVvBs1nNzLVBjrja95DCH5FWEJ-vACeH3vxyQXF8vl3sReqSJipthUq53ex_gtkYevOQaZ-GlRA08477iTrOsbRrUw6VDWwRGoj7fLxZE0381Al",
  facialMassage:   "https://lh3.googleusercontent.com/aida-public/AB6AXuDp3EGzgEzB7NIQvprmIopUGWX0lLW17lmixtkwAIk_CzymB-QvXIWvyzeAjXknSfp6zoZzxhxZZ2jqcJqwkf68shVNiRRe8BY4T673B3t_etqeVUQUDgp5E6Ie5NgBZqKXLvZAyRSvQW1e6bBcU2TPOpkn70q0RRqUDdzbX3ZVHkYBv617G4SeZMIkPozm8GtvoJ-8T7VP1EJwKS-gq9Ir_WMwm4cAHFkcoSh8zf5giBqhJMDR4BC_tJT_vGpudrYboUHYigHBoXwu",
  creamTexture:    "https://lh3.googleusercontent.com/aida-public/AB6AXuCKThEniki91lEBuuo3JziHk1g2nX_88yvNgZbQ7F8J5FmA1qQzYO_N5tgjBJztcPT8sqrMa8J9liLKxX0_bT2Cx8ZOXk0r-gKRCZZrpYQZZhhgkty7ePpo-I9gOjxwJDEoDLqaQl7f3K3Gbl2_vzJ4LngZIt9gGI_8GKR9IJso9fQeY4TcPSuI2GcmLBwBFYAZcLfrLcE5UmOQZ_G6A4m-Yb0dpC8SZcsBN9UDP7xc7qmBhXv71Ww9XcbPLxGi2VAiIV-pJaDazNtf",
};

// ─── Nano Banana custom AI image assets ───────────────────────────────────────
const _NB = "https://static.prod-images.emergentagent.com/jobs/0924067f-38ed-47a3-b0af-39a4c7e30618/images/";
const NANO_IMGS = {
  // Batch 4 — category grid backgrounds
  productScan:     _NB + "97d840f1dc315c0183f248851f5f9b727e9a3cdb9fcee7648c59e2dd3dca1371.png",
  fragranceBottle: _NB + "97d61168a66367cebd1a3697ae585767198666b50a1fc371874b4ad02d5063de7.png",
  vanityGrid:      _NB + "fa1f912538285e338ab1693d4f0abfec12d3107d55efb884f163cf14ac4bac5c.png",
  makeupOrganized: _NB + "296e177e32c1fe4f1fbf3ee52d9cf1269cfbf55f36624f2472a58b3c03b0c0e4.png",
  intimateCare:    _NB + "8fc820a51f32be3d43b44fea8366d12c297d600a64489ce16d95121e2eff981f.png",
  mensGrooming:    _NB + "09b145d15431862f87a3d8aa3063174af71f23a3ceb6066d3eedba1571a07d32.png",
  devicesSection:  _NB + "9e4cc246cb879e26c1abb7c0869f39c6d0fa6ee84f7784288881a35fa0916959.png",
  dragDrop:        _NB + "022d71f83bdef8fb9da775b4ca5aa84877d928bae297d610940c597e22b820dc.png",
  vanityDiagram:   _NB + "e4378aa66f9839487b189eb6761b41b0984a8c8e496fd362e0103adfb527ab8a.png",
  // Batch 3 — feature screens & flow mockups
  homeWithPlus:    _NB + "43b1c3753a9c4dfb1beff09b0319ac8bc2496964e7ebd065f3218a40154d31b6.png",
  inputMenu:       _NB + "a7ee4059e06ef377e55788dfd07cdc3869472c43e09806286b0684283a12205d.png",
  shareSheet:      _NB + "76e584c14a202ced172bce61c6e890ed3b07266b5e1d1df015c32db0929a0d86.png",
  cameraScan:      _NB + "ec2c4634be871952f83eeb0532a96c26c058a8908a3bc62922b1ca99cae5827e.png",
  voiceCommand:    _NB + "129b9017c22f76befaea0e1b9cb0747e9a4a8859443bd483cd2a72e649a5a49d.png",
  urlPaste:        _NB + "909002d40ece937454d024a3ce423cdba56e908c5f768f66d9e3b2666d1604bc.png",
  galleryPicker:   _NB + "59e5d2b1c2fceefb14a2318e4c0216a6933a4a44eb13f492e6ceb122c2792127.png",
  analyzingLoad:   _NB + "182392533010736461e799a56b8fda9a972649437e7d6202b1d38a15b9f8ec2a.png",
  productResults:  _NB + "e8de0d6df4ba23d84757632cbb1d7aeb1ffc95ea32f9791f890b285629e7064a.png",
  userFlowDiagram: _NB + "d10094bfe7525fe11c77230adbf5c8dbafdcb0604b19d2b7f3f72eac4a1ae517.png",
};

// ─── Data ──────────────────────────────────────────────────────────────────────

const categories: Category[] = [
  {
    id: "muse", label: "The Muse", sub: "Your curator",
    gradient: "linear-gradient(135deg, #E8D898, #C8A840, #F0E8CC)",
    accent: "#C8B06A", icon: "✦",
    photo: NANO_IMGS.vanityGrid,
  },
  {
    id: "carte", label: "La Carte", sub: "Cartographie du Raffinement",
    gradient: "linear-gradient(135deg, #D8E8D0, #88B890, #C0D8B8)",
    accent: "#0B3C26", icon: "◈",
    photo: NANO_IMGS.vanityDiagram,
  },
  {
    id: "makeup", label: "Makeup", sub: "Color & beauty",
    gradient: "linear-gradient(135deg, #F0C0B0, #C87870, #E8A898)",
    accent: "#C4968A", icon: "◈",
    photo: NANO_IMGS.makeupOrganized,
  },
  {
    id: "skincare", label: "Skincare", sub: "Glow routines",
    gradient: "linear-gradient(135deg, #C0D8B0, #688850, #A8C890)",
    accent: "#1A5C3A", icon: "◇",
  },
  {
    id: "haircare", label: "Haircare", sub: "Lush locks",
    gradient: "linear-gradient(135deg, #E8DCC8, #C0A880, #F0E8D8)",
    accent: "#A08060", icon: "〜",
  },
  {
    id: "fragrance", label: "Fragrance", sub: "Signature scents",
    gradient: "linear-gradient(135deg, #F0E0B0, #C8A040, #E8D098)",
    accent: "#C8B06A", icon: "○",
    photo: NANO_IMGS.fragranceBottle,
  },
  {
    id: "body", label: "Body", sub: "Head to toe",
    gradient: "linear-gradient(135deg, #F0ECE4, #D8CDB8, #EAE4D8)",
    accent: "#8A7A6A", icon: "◯",
  },
  {
    id: "nails", label: "Nails", sub: "Polish & art",
    gradient: "linear-gradient(135deg, #E8C0C8, #B06870, #D8A0A8)",
    accent: "#B07880", icon: "◆",
  },
  {
    id: "devices", label: "Devices", sub: "Tech beauty",
    gradient: "linear-gradient(135deg, #D8E0E8, #90A8B8, #C0CED8)",
    accent: "#5A7A9A", icon: "⊞",
    photo: NANO_IMGS.devicesSection,
  },
  {
    id: "accessories", label: "Accessories", sub: "Finishing touch",
    gradient: "linear-gradient(135deg, #E8E0C8, #C0B080, #EAE0C0)",
    accent: "#A09070", icon: "◇",
    photo: NANO_IMGS.dragDrop,
  },
  {
    id: "parapharmacy", label: "Parapharmacy", sub: "Libre service",
    gradient: "linear-gradient(135deg, #E0EEE8, #88B8A0, #C0DED0)",
    accent: "#3A7A5A", icon: "✚",
  },
  {
    id: "intimate", label: "Intimate Wellness", sub: "Care & pleasure",
    gradient: "linear-gradient(135deg, #F0D0E0, #C87898, #D8A0C0)",
    accent: "#B06880", icon: "◯",
    photo: NANO_IMGS.intimateCare,
  },
  {
    id: "wellness", label: "Wellness", sub: "Health from within",
    gradient: "linear-gradient(135deg, #D8E8D0, #70A860, #B8D8A8)",
    accent: "#2A6A3A", icon: "◈",
    photo: NANO_IMGS.mensGrooming,
  },
  {
    id: "rituels", label: "Mes Rituels", sub: "Routines sacrées",
    gradient: "linear-gradient(135deg, #1E1030, #3D2060, #C8A840)",
    accent: "#C8B06A", icon: "◐",
  },
];

const TIPS = [
  "Appliquez votre sérum sur peau légèrement humide pour une absorption optimale ✦",
  "Le SPF est le seul anti-âge prouvé — ne jamais l'oublier, même en hiver ◈",
  "Massez votre contour des yeux de l'intérieur vers l'extérieur pour drainer le liquide ◇",
  "Une brosse à cheveux propre = une chevelure plus saine. Lavez-la chaque semaine ✦",
  "Alternez vos shampoings — votre cuir chevelu s'adapte et s'équilibre ◈",
  "L'huile de jojoba imite le sébum naturel — idéale pour tous les types de peau ✦",
  "Dormez sur une taie en soie pour préserver votre peau et vos cheveux la nuit ◈",
];

const TOUR_STEPS = [
  {
    title: "Bienvenue dans The Muse ✦",
    body: "Votre univers beauté commence ici. Explorez les catégories pour découvrir produits, tutoriels et adresses exclusives.",
    highlight: "grid",
    icon: "✦",
  },
  {
    title: "La Boussole Émeraude",
    body: "Appuyez sur le cygne en haut pour vos notifications. Votre guide personnel est toujours à portée de main.",
    highlight: "header",
    icon: "◈",
  },
  {
    title: "Votre Vanité",
    body: "Sauvegardez vos produits favoris dans votre Vanité. Scannez, explorez, et construisez votre collection idéale.",
    highlight: "nav",
    icon: "◇",
  },
  {
    title: "La Muse vous guide ✦",
    body: "Ce bouton cygne flottant est votre guide personnel. Appuyez dessus à tout moment pour naviguer ou découvrir un conseil du jour.",
    highlight: "fab",
    icon: "swan",
  },
];

const navTabs = ["Home", "Scan", "Routine", "Profile"];

const FEATURED = [
  { title: "The Verdant Ritual",    sub: "Editor's Choice",    cat: "Skincare",  img: IMGS.botanicalSerum,            accent: "#2D7A52" },
  { title: "Soin du Regard",        sub: "Rituel contour",     cat: "Skincare",  img: IMGS.skincareModel,             accent: "#2D7A52" },
  { title: "Scan & Identify",       sub: "Trouvez votre dupe", cat: "Scan",      img: NANO_IMGS.productScan,          accent: "#C8B06A" },
  { title: "Eau de Parfum",         sub: "Signature florale",  cat: "Fragrance", img: IMGS.fragrance,                 accent: "#C8B06A" },
  { title: "Cellular Recharge",     sub: "Éclat & nutrition",  cat: "Corps",     img: IMGS.creamTexture,              accent: "#8A7A6A" },
  { title: "Ritual Nocturne",       sub: "Maison Verte",       cat: "Ritual",    img: IMGS.copperTools,               accent: "#C8B06A" },
  { title: "Share & Discover",      sub: "From any platform",  cat: "Feature",   img: NANO_IMGS.shareSheet,           accent: "#0B3C26" },
  { title: "5 Ways to Discover",    sub: "Muse input methods", cat: "Feature",   img: NANO_IMGS.userFlowDiagram,      accent: "#C4968A" },
];

const SEASONAL_RITUALS = [
  { title: "The Spring Awakening", tag: "Édition Limitée", img: IMGS.springAwakening },
  { title: "Jade Stone Renewal",   tag: "Best Seller",     img: IMGS.jadeRenewal    },
  { title: "Golden Hour Elixir",   tag: "Nouveauté",       img: IMGS.goldenElixir   },
];

const MEMBER_FAVORITES = [
  { title: "Signature Fragrance No. 4", sub: "Bergamot, Rose & Oud fumé", price: "240€", img: IMGS.fragrance  },
  { title: "Purifying Thermal Mask",    sub: "Cendres volcaniques & eau minérale", price: "95€",  img: IMGS.clayMask   },
  { title: "Sculptural Face Lift",      sub: "Gua sha & infusion d'oxygène",       price: "185€", img: IMGS.facialMassage },
];

// ─── Component ─────────────────────────────────────────────────────────────────

export default function CategoryHomeScreen({
  onVanity, onProducts, onScan, onVoice, onBack,
  onInput, onEditorial, onReviews, onAccessibility, onExtension,
  onHaircare, onBody, onSearch, onWellness, onIntimate, onParapharmacy,
  onSocial, onProfile, onNotifications, onMuseBox, onMap, onRoutine,
}: Props) {
  const { showToast } = useToast();
  const [guideOpen,  setGuideOpen]  = useState(false);
  const [tourStep,   setTourStep]   = useState(0);
  const [tourDone,   setTourDone]   = useState(false);
  const [tipIdx]                    = useState(() => Math.floor(Math.random() * TIPS.length));
  const [profileLine, setProfileLine] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("luxe-profile");
      if (stored) {
        const p = JSON.parse(stored) as { skin?: string; picks?: string[] };
        const parts: string[] = [];
        if (p.skin) parts.push(p.skin);
        if (p.picks?.length) parts.push(p.picks[0]);
        if (parts.length) setProfileLine(parts.join(" · "));
      }
    } catch {}
  }, []);

  useEffect(() => {
    const t = setTimeout(() => { if (!tourDone) setTourStep(0); }, 800);
    return () => clearTimeout(t);
  }, [tourDone]);

  const handleCatClick = (id: string) => {
    if (id === "muse")          return onVanity();
    if (id === "carte")         return onMap ? onMap() : onProducts();
    if (id === "skincare")      return onScan();
    if (id === "makeup")        return onEditorial      ? onEditorial()      : onProducts();
    if (id === "fragrance")     return onReviews        ? onReviews()        : onProducts();
    if (id === "devices")       return onExtension      ? onExtension()      : onProducts();
    if (id === "accessories")   return onAccessibility  ? onAccessibility()  : onProducts();
    if (id === "haircare")      return onHaircare       ? onHaircare()       : onProducts();
    if (id === "body")          return onBody           ? onBody()           : onProducts();
    if (id === "wellness")      return onWellness       ? onWellness()       : onProducts();
    if (id === "intimate")      return onIntimate       ? onIntimate()       : onProducts();
    if (id === "parapharmacy")  return onParapharmacy   ? onParapharmacy()   : onProducts();
    if (id === "rituels")       return onRoutine        ? onRoutine()        : onProducts();
    return onProducts();
  };

  const dismissTour = () => { setTourDone(true); setTourStep(-1); };

  const quickNav = [
    { icon: "◈", label: "Ma Vanité",      action: onVanity },
    { icon: "◇", label: "La Carte",       action: onMap ?? onProducts },
    { icon: "✦", label: "Inspirations",   action: onEditorial ?? onProducts },
    { icon: "○", label: "Muse Box",       action: onMuseBox ?? onProducts },
    { icon: "⊞", label: "Scanner",        action: onScan },
  ];

  return (
    <div className="satin-bg min-h-screen flex flex-col overflow-hidden">

      {/* ── Tour overlay ── */}
      {!tourDone && tourStep >= 0 && (
        <div className="fixed inset-0 z-[500] flex flex-col items-center justify-end pb-32"
          style={{ background: "rgba(11,30,20,0.72)", backdropFilter: "blur(4px)" }}>

          {/* Step card */}
          <div className="mx-5 card-pearl rounded-3xl px-6 py-6 w-full max-w-sm"
            style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.35)" }}>

            {/* Progress dots */}
            <div className="flex justify-center gap-1.5 mb-4">
              {TOUR_STEPS.map((_, i) => (
                <div key={i} className="rounded-full transition-all duration-300"
                  style={{
                    width: i === tourStep ? "20px" : "5px",
                    height: "5px",
                    background: i === tourStep ? "#0B3C26" : "rgba(11,60,38,0.2)",
                  }} />
              ))}
            </div>

            <div className="text-center mb-4">
              <div className="flex justify-center mb-3">
                {TOUR_STEPS[tourStep].icon === "swan"
                  ? <SwanLogo size={36} />
                  : <span className="font-serif text-2xl" style={{ color: "#0B3C26" }}>{TOUR_STEPS[tourStep].icon}</span>}
              </div>
              <h3 className="font-serif text-[18px] text-[#1C1C1C] mb-2">
                {TOUR_STEPS[tourStep].title}
              </h3>
              <p className="font-sans text-[11px] text-[#5A5040] leading-relaxed">
                {TOUR_STEPS[tourStep].body}
              </p>
            </div>

            <div className="flex gap-2.5">
              <button onClick={dismissTour}
                className="flex-1 py-2.5 rounded-full cursor-pointer font-sans text-[9px] tracking-[0.12em] uppercase"
                style={{ border: "1px solid rgba(11,60,38,0.2)", color: "rgba(11,60,38,0.5)" }}>
                Passer
              </button>
              <button
                onClick={() => {
                  if (tourStep < TOUR_STEPS.length - 1) setTourStep(s => s + 1);
                  else dismissTour();
                }}
                className="flex-1 py-2.5 rounded-full cursor-pointer btn-emerald font-sans text-[9px] tracking-[0.12em] uppercase">
                {tourStep < TOUR_STEPS.length - 1 ? "Suivant →" : "C'est parti ✦"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── La Muse guide sheet ── */}
      {guideOpen && (
        <div className="fixed inset-0 z-[400] flex flex-col justify-end"
          style={{ background: "rgba(11,30,20,0.55)", backdropFilter: "blur(6px)" }}
          onClick={() => setGuideOpen(false)}>
          <div className="mx-3 mb-3 card-pearl rounded-3xl px-5 pt-5 pb-6"
            onClick={e => e.stopPropagation()}
            style={{ boxShadow: "0 -8px 40px rgba(11,60,38,0.2)" }}>

            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: "linear-gradient(135deg, rgba(200,176,106,0.3), rgba(200,176,106,0.1))", border: "1px solid rgba(200,176,106,0.4)" }}>
                <SwanLogo size={20} color="#C8B06A" />
              </div>
              <div>
                <p className="font-serif text-[15px] text-[#1C1C1C]">La Muse</p>
                <p className="font-sans text-[9px] text-[#8A8070] tracking-wide">Votre guide beauté personnel</p>
              </div>
              <button onClick={() => setGuideOpen(false)}
                className="ml-auto w-7 h-7 rounded-full flex items-center justify-center cursor-pointer opacity-40 hover:opacity-80"
                style={{ border: "1px solid rgba(11,60,38,0.2)" }}>
                <span className="font-sans text-[10px]">✕</span>
              </button>
            </div>

            {/* Greeting */}
            <div className="rounded-2xl px-4 py-3 mb-4"
              style={{ background: "rgba(11,60,38,0.05)", border: "1px solid rgba(11,60,38,0.08)" }}>
              <p className="font-cormorant italic text-[14px] text-[#0B3C26] leading-relaxed">
                "Où souhaitez-vous aller aujourd'hui ?"
              </p>
            </div>

            {/* Quick nav grid */}
            <div className="grid grid-cols-5 gap-2 mb-4">
              {quickNav.map(({ icon, label, action }) => (
                <button key={label}
                  onClick={() => { setGuideOpen(false); action?.(); }}
                  className="flex flex-col items-center gap-1.5 py-2.5 rounded-2xl cursor-pointer press-scale transition-all"
                  style={{ background: "rgba(200,176,106,0.08)", border: "1px solid rgba(200,176,106,0.2)" }}>
                  <span className="font-sans text-base text-[#C8B06A]">{icon}</span>
                  <span className="font-sans text-[7px] tracking-[0.08em] text-[#5A5040] text-center leading-tight">{label}</span>
                </button>
              ))}
            </div>

            {/* Conseil du jour */}
            <div className="divider-gold mb-3" />
            <div className="flex items-start gap-2.5">
              <span className="text-[#C8B06A] text-sm flex-shrink-0 mt-0.5">✦</span>
              <div>
                <p className="font-sans text-[8px] tracking-[0.18em] uppercase text-[#C8B06A] mb-1">Conseil du Jour</p>
                <p className="font-sans text-[10px] text-[#5A5040] leading-relaxed italic">{TIPS[tipIdx]}</p>
              </div>
            </div>

            {/* Restart tour */}
            <button
              onClick={() => { setGuideOpen(false); setTourDone(false); setTourStep(0); }}
              className="w-full mt-4 py-2 rounded-full cursor-pointer font-sans text-[8px] tracking-[0.15em] uppercase text-center transition-opacity hover:opacity-70"
              style={{ color: "rgba(11,60,38,0.4)" }}>
              Revoir la visite guidée →
            </button>
          </div>
        </div>
      )}

      {/* ── Header ── */}
      <div className="px-5 pt-10 pb-3 flex items-center justify-between flex-shrink-0">
        <button onClick={onNotifications ?? (() => {})} className="cursor-pointer">
          <SwanLogo size={30} />
        </button>
        <div className="text-center">
          <p className="font-sans text-[8px] tracking-[0.28em] uppercase text-[#C8B06A] mb-0.5">
            {profileLine ? `✦ ${profileLine}` : "✦ Bienvenue, Muse"}
          </p>
          <h2 className="font-serif text-lg font-normal text-[#1C1C1C]">Votre Univers</h2>
        </div>
        <button onClick={onSearch || onInput || onScan}
          className="w-9 h-9 rounded-full flex items-center justify-center cursor-pointer transition-all hover:bg-[rgba(11,60,38,0.06)]"
          style={{ border: "1px solid rgba(11,60,38,0.12)" }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#0B3C26" strokeWidth="1.2" strokeLinecap="round">
            <circle cx="7" cy="7" r="4.5" />
            <path d="M11 11L14 14" />
          </svg>
        </button>
      </div>

      <div className="divider-gold mx-5 mb-3" />

      {/* ── Featured editorial strip ── */}
      <div className="px-3 mb-3 flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <p className="font-sans text-[7px] tracking-[0.22em] uppercase text-[#C8B06A]">Éditorial du Moment</p>
          <button onClick={onEditorial ?? onProducts}
            className="font-sans text-[7px] tracking-[0.15em] uppercase cursor-pointer transition-opacity hover:opacity-80"
            style={{ color: "rgba(11,60,38,0.4)" }}>
            Tout voir →
          </button>
        </div>
        <div className="flex gap-2.5 overflow-x-auto no-scrollbar">
          {FEATURED.map((item, i) => (
            <button key={i} onClick={onEditorial ?? onProducts}
              className="flex-shrink-0 rounded-2xl overflow-hidden cursor-pointer press-scale relative"
              style={{ width: 128, height: 96 }}>
              <img src={item.img} alt={item.title}
                className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0"
                style={{ background: "linear-gradient(to top, rgba(11,20,15,0.75) 0%, rgba(0,0,0,0.05) 55%)" }} />
              <div className="absolute inset-0 flex flex-col justify-end p-3">
                <p className="font-sans text-[6px] tracking-[0.2em] uppercase mb-0.5" style={{ color: item.accent }}>{item.cat}</p>
                <p className="font-serif text-[11px] text-white leading-tight">{item.title}</p>
                <p className="font-sans text-[7px] text-white/60 mt-0.5">{item.sub}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── Rituels en Saison ── */}
      <div className="px-3 mb-4 flex-shrink-0">
        <div className="flex items-center justify-between mb-2.5">
          <p className="font-sans text-[7px] tracking-[0.22em] uppercase text-[#C8B06A]">Rituels en Saison</p>
          <button onClick={onRoutine ?? onProducts}
            className="font-sans text-[7px] tracking-[0.15em] uppercase cursor-pointer transition-opacity hover:opacity-80"
            style={{ color: "rgba(11,60,38,0.4)" }}>
            Voir tout →
          </button>
        </div>
        <div className="flex gap-3 overflow-x-auto no-scrollbar">
          {SEASONAL_RITUALS.map((item, i) => (
            <button key={i} onClick={onRoutine ?? onProducts}
              className="flex-shrink-0 rounded-2xl overflow-hidden relative cursor-pointer press-scale"
              style={{ width: 112, height: 152 }}>
              <img src={item.img} alt={item.title} className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0"
                style={{ background: "linear-gradient(to top, rgba(11,20,15,0.78) 0%, rgba(0,0,0,0) 50%)" }} />
              <div className="absolute inset-0 flex flex-col justify-end p-3">
                <p className="font-sans text-[5px] tracking-[0.22em] uppercase text-[#C8B06A] mb-0.5">{item.tag}</p>
                <p className="font-serif text-[11px] text-white leading-snug">{item.title}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── Favoris des Membres ── */}
      <div className="px-3 mb-4 flex-shrink-0">
        <p className="font-sans text-[7px] tracking-[0.22em] uppercase text-[#C8B06A] mb-3">Favoris des Membres</p>
        <div className="flex flex-col gap-2">
          {MEMBER_FAVORITES.map((item, i) => (
            <button key={i} onClick={onProducts}
              className="flex items-center gap-3 p-3 rounded-xl cursor-pointer press-scale text-left"
              style={{
                background: "rgba(255,255,255,0.55)",
                border: "1px solid rgba(200,176,106,0.15)",
                backdropFilter: "blur(8px)",
              }}>
              <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0"
                style={{ background: "#F0ECE4" }}>
                <img src={item.img} alt={item.title} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-serif text-[12px] text-[#1C1C1C] leading-tight mb-0.5 truncate">{item.title}</p>
                <p className="font-sans text-[9px] text-[#8A8070] leading-snug line-clamp-2">{item.sub}</p>
              </div>
              <div className="flex-shrink-0 text-right">
                <p className="font-sans text-[10px] text-[#C8B06A] font-medium">{item.price}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── Category grid ── */}
      <div className="flex-1 overflow-y-auto px-3 pb-32">
        <div className="grid grid-cols-2 gap-2.5">
          {categories.map((cat, i) => (
            <button
              key={cat.id}
              onClick={() => handleCatClick(cat.id)}
              className={`card-pearl rounded-2xl overflow-hidden text-left cursor-pointer group relative grid-item-anim
                ${cat.id === "muse" || cat.id === "carte" ? "col-span-2 h-24" : "h-32"}`}
              style={{ animationDelay: `${i * 0.045}s` }}
            >
              {cat.photo && (
                <img src={cat.photo} alt="" aria-hidden
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{ opacity: 0.4 }} />
              )}
              <div className="absolute inset-0" style={{ background: cat.gradient, opacity: cat.photo ? 0.28 : 0.55 }} />

              <div className="absolute inset-0 flex items-center justify-end pr-4 pointer-events-none">
                <span className="text-4xl opacity-10" style={{ color: cat.accent }}>{cat.icon}</span>
              </div>

              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400"
                style={{ background: `radial-gradient(ellipse at 80% 20%, ${cat.accent}20, transparent 60%)` }} />

              <div className="relative z-10 p-4 h-full flex flex-col justify-between">
                <div>
                  {cat.id === "muse" || cat.id === "carte" ? (
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-sans text-[7px] tracking-[0.25em] uppercase mb-0.5" style={{ color: cat.accent }}>
                          {cat.sub}
                        </p>
                        <p className="font-serif text-xl font-normal text-[#1C1C1C]">{cat.label}</p>
                      </div>
                      <div className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ background: `${cat.accent}20`, border: `1px solid ${cat.accent}40` }}>
                        <span className="text-xs" style={{ color: cat.accent }}>{cat.icon}</span>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="w-6 h-6 rounded-full flex items-center justify-center mb-2"
                        style={{ background: `${cat.accent}20`, border: `1px solid ${cat.accent}30` }}>
                        <span className="text-[9px]" style={{ color: cat.accent }}>{cat.icon}</span>
                      </div>
                      <p className="font-sans text-[7px] tracking-[0.15em] uppercase mb-0.5 opacity-60"
                        style={{ color: cat.accent }}>
                        {cat.sub}
                      </p>
                      <p className="font-serif text-base font-normal text-[#1C1C1C] leading-tight">{cat.label}</p>
                    </>
                  )}
                </div>
              </div>

              <div className="absolute bottom-0 left-4 right-4 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: `linear-gradient(90deg, transparent, ${cat.accent}60, transparent)` }} />
            </button>
          ))}
        </div>
      </div>

      {/* ── Floating Swan FAB ── */}
      <div className="fixed bottom-[76px] left-0 right-0 flex justify-center z-30 pointer-events-none">
        <button
          onClick={() => setGuideOpen(g => !g)}
          className="pointer-events-auto w-14 h-14 rounded-full flex items-center justify-center cursor-pointer press-scale transition-all duration-300"
          style={{
            background: "radial-gradient(circle at 35% 35%, rgba(255,252,248,0.98), rgba(240,235,218,0.92), rgba(220,210,185,0.88))",
            boxShadow: guideOpen
              ? "0 0 0 3px rgba(200,176,106,0.5), 0 8px 32px rgba(200,176,106,0.4), 0 2px 8px rgba(11,60,38,0.15)"
              : "0 0 0 1.5px rgba(200,176,106,0.35), 0 6px 24px rgba(11,60,38,0.18), 0 2px 8px rgba(200,176,106,0.2)",
            border: "1px solid rgba(200,176,106,0.4)",
          }}>
          <SwanLogo size={26} color="#C8B06A" />
        </button>
      </div>

      {/* ── Bottom nav ── */}
      <div className="panel-bottom fixed bottom-0 left-0 right-0 z-20 px-2 pb-6 pt-3"
        style={{ background: "rgba(250,246,239,0.95)", backdropFilter: "blur(16px)", borderTop: "1px solid rgba(200,176,106,0.15)" }}>
        <div className="flex justify-around">
          {navTabs.map((tab, i) => (
            <button key={tab}
              onClick={i === 0 ? () => {} : i === 1 ? onScan : i === 2 ? (onMuseBox ?? onProducts) : (onProfile ?? onSocial ?? onBack)}
              className={`nav-tab ${i === 0 ? "active" : ""}`}>
              <div className="nav-line" />
              <NavIcon idx={i} />
              <span>{tab}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function NavIcon({ idx }: { idx: number }) {
  if (idx === 0) return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
      <path d="M2 8L9 2L16 8V15C16 15.6 15.6 16 15 16H12V12H6V16H3C2.4 16 2 15.6 2 15V8Z" />
    </svg>
  );
  if (idx === 1) return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
      <rect x="2" y="2" width="5" height="5" rx="1" />
      <rect x="11" y="2" width="5" height="5" rx="1" />
      <rect x="2" y="11" width="5" height="5" rx="1" />
      <path d="M11 12H13M13 12H16M13 12V11M13 12V16" />
    </svg>
  );
  if (idx === 2) return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
      <rect x="3" y="2" width="12" height="14" rx="2" />
      <path d="M6 6H12M6 9H12M6 12H9" />
    </svg>
  );
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
      <circle cx="9" cy="6" r="3" />
      <path d="M3 16C3 13.2 5.7 11 9 11C12.3 11 15 13.2 15 16" />
    </svg>
  );
}
