import { motion } from 'framer-motion';
import { EASE } from '../lib/motion.js';

// Reliable scroll reveal via Framer Motion whileInView (triggers once).
export default function Reveal({ children, delay = 0, y = 24, className = '', ...rest }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.65, ease: EASE, delay: delay / 1000 }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
