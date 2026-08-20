import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function VanityBanner() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="px-5 mb-8"
    >
      <Link to="/vanity" className="block rounded-2xl overflow-hidden shadow-sm">
        <img
          src="https://media.base44.com/images/public/6a57507f2558691b9c2c4bcf/77f3ed91f_IMG_4512.jpg"
          alt="My Vanity"
          className="w-full h-auto object-cover"
        />
      </Link>
    </motion.div>
  );
}