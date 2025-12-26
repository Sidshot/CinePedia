'use client';

import { motion } from 'framer-motion';

export default function AnimatedMovieCard({ children, index = 0 }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.05, y: -8 }}
            whileTap={{ scale: 0.98 }}
            transition={{
                type: "spring",
                stiffness: 300,
                damping: 20,
                delay: index * 0.05, // Stagger effect
            }}
            className="h-full"
        >
            {children}
        </motion.div>
    );
}
