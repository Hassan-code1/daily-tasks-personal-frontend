import { memo } from 'react';
import { motion } from 'framer-motion';
import { format, isToday } from 'date-fns';
import StatusMarker from './StatusMarker';

// GPU-only transform animations (no layout shifts, fully composited)
const tileVariants = {
    hidden: { opacity: 0, scale: 0.88 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: { duration: 0.18, type: 'spring', stiffness: 280, damping: 22 },
    },
};

function CalendarTile({ date, isCurrentMonth, summary, onClick, index }) {
    const today = isToday(date);
    const staggerDelay = Math.min(index * 0.008, 0.25); // cap at 250ms

    return (
        <motion.div
            className={[
                'glass rounded-xl flex flex-col items-center justify-between p-2 cursor-pointer select-none',
                'min-h-[72px] transition-colors duration-200',
                'hover:border-[#a78bfa] hover:shadow-[0_0_16px_rgba(167,139,250,0.4),0_8px_32px_rgba(0,0,0,0.4)]',
                'focus-visible:outline-2 focus-visible:outline-[#a78bfa] focus-visible:outline-offset-2',
                !isCurrentMonth ? 'opacity-30' : '',
                today ? 'tile-today' : '',
            ].join(' ')}
            // GPU-accelerated only — scale + opacity, no position changes
            style={{ willChange: 'transform, opacity' }}
            variants={tileVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: staggerDelay }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => onClick(date)}
            role="button"
            tabIndex={0}
            aria-label={`${format(date, 'MMMM d, yyyy')} — ${summary.total} tasks`}
            onKeyDown={(e) => e.key === 'Enter' && onClick(date)}
        >
            <span className={`text-sm font-medium self-start leading-none ${today ? 'text-[#a78bfa] font-bold' : 'text-white/90'}`}>
                {format(date, 'd')}
            </span>
            <StatusMarker completed={summary.completed} total={summary.total} />
        </motion.div>
    );
}

// React.memo: only re-renders when date, summary, or isCurrentMonth changes
export default memo(CalendarTile, (prev, next) =>
    prev.date.getTime() === next.date.getTime() &&
    prev.isCurrentMonth === next.isCurrentMonth &&
    prev.summary.completed === next.summary.completed &&
    prev.summary.total === next.summary.total
);
