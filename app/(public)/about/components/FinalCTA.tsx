"use client";

import { motion } from "framer-motion";
import { fadeUp } from "../motion/variants";
import { spacing, typography } from "../theme/tokens";

export default function FinalCTA() {
  return (
    <section className="py-24 text-center">
      <motion.h2 {...fadeUp} className={`${typography.h2} mb-6`}>
        یک تصمیم بهتر فقط یک تخمین فاصله دارد.
      </motion.h2>

      <motion.button
        {...fadeUp}
        className="px-8 py-3 rounded-xl bg-black text-white dark:bg-white dark:text-black"
      >
        ورود به تخمینو
      </motion.button>
    </section>
  );
}
