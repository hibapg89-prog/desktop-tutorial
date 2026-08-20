import { motion } from "framer-motion";

const MUSE_ICON =
  "https://media.base44.com/images/public/6a57507f2558691b9c2c4bcf/95a1c823a_generated_image.png";

export default function FloatingMuseButton({ onTap }) {
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.3, type: "spring", stiffness: 200, damping: 16 }}
      whileTap={{ scale: 0.92 }}
      whileHover={{
        boxShadow: "0 8px 28px rgba(11,60,38,0.28), 0 0 18px 4px rgba(201,181,138,0.45), 0 0 0 1px rgba(201,181,138,0.4)",
      }}
      onClick={onTap}
      aria-label="The Muse — Assistant"
      className="fixed z-40 w-16 h-16 rounded-full overflow-hidden flex items-center justify-center"
      style={{
        right: "20px",
        bottom: "92px",
        boxShadow: "0 8px 24px rgba(11,60,38,0.22), 0 0 0 1px rgba(201,181,138,0.25)",
      }}
    >
      <img
        src={MUSE_ICON}
        alt="The Muse"
        className="w-full h-full object-cover rounded-full"
      />
    </motion.button>
  );
}