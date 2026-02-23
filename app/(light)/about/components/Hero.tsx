"use client";

import { motion } from "framer-motion";
import { fadeUp } from "../motion/variants";
import { typography, spacing } from "../theme/tokens";

export default function Hero() {
  return (
    <section className={`${spacing.sectionY} text-center`}>
      <motion.h1
        {...fadeUp}
        className={`${typography.h1}`}
      >
        تخمینو: پلتفرم تصمیم‌سازی مالی — نه پیش‌بینی.
      </motion.h1>

      <motion.p
        {...fadeUp}
        transition={{ delay: 0.2 }}
        className="mt-6 text-lg text-gray-600 dark:text-gray-300"
      >
        ما آینده را پیش‌بینی نمی‌کنیم. سناریو می‌سازیم تا شما تصمیم بهتری بگیرید.
      </motion.p>
    </section>
  );
}
