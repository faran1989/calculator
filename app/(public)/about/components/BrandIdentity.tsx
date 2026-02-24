"use client";

import { motion } from "framer-motion";
import { fadeUp } from "../motion/variants";
import { spacing, typography } from "../theme/tokens";

export default function BrandIdentity() {
  return (
    <section className={`${spacing.sectionY} text-center`}>
      <motion.h2 {...fadeUp} className={`${typography.h2} mb-6`}>
        هویت برند
      </motion.h2>

      <motion.p {...fadeUp} className={typography.body}>
        لوکس. مینیمال. شفاف. مبتنی بر عدد. ضد پیش‌بینی قطعی.
      </motion.p>
    </section>
  );
}
