import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen satin-bg flex flex-col items-center justify-between overflow-hidden relative">
      {/* Ambient orbs — pointer-events-none so they never block taps */}
      <div
        className="absolute top-20 left-10 w-64 h-64 rounded-full opacity-20 pointer-events-none"
        style={{ background: "radial-gradient(circle, #BC8F8F 0%, transparent 70%)" }}
      />
      <div
        className="absolute bottom-40 right-5 w-48 h-48 rounded-full opacity-15 pointer-events-none"
        style={{ background: "radial-gradient(circle, #C8B06A 0%, transparent 70%)" }}
      />
      <div
        className="absolute top-1/3 right-20 w-32 h-32 rounded-full opacity-10 pointer-events-none"
        style={{ background: "radial-gradient(circle, #043927 0%, transparent 70%)" }}
      />

      {/* Center content */}
      <div className="flex flex-col items-center px-4 text-center w-full">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 1, ease: "easeOut" }}
          className="w-full max-w-md relative"
        >
          {/* Hero image — button is baked into the image visually */}
          <img
            src="https://media.base44.com/images/public/6a57507f2558691b9c2c4bcf/b69dd94d3_IMG_3854.jpeg"
            alt="The Muse — Elevating Your Beauty Journey"
            className="w-full rounded-3xl object-contain"
            draggable={false}
          />

          {/*
            Transparent real button overlaid exactly where "EXPLORE NOW"
            appears in the image (roughly 70–82% from top, centered).
            Tapping anywhere in that zone navigates to /home.
          */}
          <button
            onClick={() => navigate("/home")}
            className="absolute left-1/2 -translate-x-1/2 z-10 cursor-pointer rounded-full"
            style={{ top: "70%", width: "62%", height: "10%" }}
            aria-label="Explore Now"
          />

          {/* Also make the top 70% of the image tappable as a shortcut */}
          <button
            onClick={() => navigate("/home")}
            className="absolute inset-0 w-full z-[5] cursor-pointer rounded-3xl"
            style={{ height: "70%" }}
            aria-label="Enter the app"
          />
        </motion.div>

        {/* Secondary CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="mt-4"
        >
          <Link
            to="/onboarding"
            className="text-xs text-[#043927]/40 tracking-[0.15em] uppercase font-light hover:text-[#043927]/60 transition-colors"
          >
            Create your Beauty Profile
          </Link>
        </motion.div>
      </div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="pb-10 text-center"
      >
        <p className="text-[10px] text-[#043927]/30 tracking-widest uppercase font-light">The Muse</p>
      </motion.div>
    </div>
  );
}