import { motion, AnimatePresence } from 'framer-motion';

export default function StatusMarker({ completed, total }) {
    if (total === 0) return null;
    const allDone = completed === total;

    return (
        <AnimatePresence mode="wait">
            {allDone ? (
                <motion.div
                    key="tick"
                    className="text-[#34d399] text-base font-bold leading-none"
                    style={{ filter: 'drop-shadow(0 0 6px rgba(52,211,153,0.6))' }}
                    initial={{ scale: 0, rotate: -30 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0 }}
                    transition={{ type: 'spring', stiffness: 320, damping: 18 }}
                    aria-label="All tasks complete"
                >✓</motion.div>
            ) : (
                <motion.div
                    key="ratio"
                    className="text-[0.68rem] font-medium text-white/50 tabular-nums"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    aria-label={`${completed} of ${total} tasks complete`}
                >{completed}/{total}</motion.div>
            )}
        </AnimatePresence>
    );
}
