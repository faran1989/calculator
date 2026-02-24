"use client";

import { motion } from "framer-motion";
import { stagger, fadeUp } from "../motion/variants";
import { spacing, typography } from "../theme/tokens";

const items = [
  { title: "سادگی", desc: "ابزار باید قابل فهم باشد، نه پیچیده." },
  { title: "شفافیت", desc: "عدد واقعی ارزشمندتر از دقتِ فیک است." },
  { title: "تخمین", desc: "ما قطعیت نمی‌فروشیم؛ سناریو می‌سازیم." },
];

export default function Philosophy() {
  return (
    <section className={`${spacing.sectionY} ${spacing.container}`}>
      <motion.div variants={stagger} initial="initial" whileInView="animate">
        <div className="grid md:grid-cols-3 gap-8">
          {items.map((item, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              className="border border-gray-200 dark:border-gray-700 rounded-xl p-6"
            >
              <h3 className={`${typography.h3} mb-3`}>{item.title}</h3>
              <p className={typography.body}>{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
