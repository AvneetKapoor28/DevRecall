import { motion } from 'framer-motion';

import type { ReactNode } from 'react';

export const FadeInUp = ({
  children,
  delay = 0,
}: {
  children: ReactNode;
  delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, ease: 'easeOut', delay }}
  >
    {children}
  </motion.div>
);
