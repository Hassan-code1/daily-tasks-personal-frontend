import { memo } from 'react';
import { motion } from 'framer-motion';
import { format, isToday } from 'date-fns';
import StatusMarker from './StatusMarker';

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
    const total = summary.total || 0;
    const completed = summary.completed || 0;

    const allDone = total > 0 && completed === total;
    const anyPending = total > 0 && completed < total;

    const staggerDelay = Math.min(index * 0.008, 0.25);

    // Dynamic status classes
    const statusClasses = [
        'glass rounded-xl flex flex-col items-center justify-between p-2 cursor-pointer select-none',
        'min-h-[72px] transition-all duration-300',
        !isCurrentMonth ? 'opacity-30' : '',
        today ? 'tile-today' : '',
        // Green: All tasks done
        allDone ? '!bg-emerald-500/30 border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.3)]' : '',
        // Red: Any task not completed
        anyPending ? '!bg-rose-500/30 border-rose-500/40 shadow-[0_0_20px_rgba(244,63,94,0.3)]' : '',
        // Hover effects
        'hover:border-accent/50 hover:shadow-[0_0_16px_rgba(99,102,241,0.4)]',
    ].join(' ');

    return (
        <motion.div
            className={statusClasses}
            style={{ willChange: 'transform, opacity' }}
            variants={tileVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: staggerDelay }}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => onClick(date)}
            role="button"
            tabIndex={0}
            aria-label={`${format(date, 'MMMM d, yyyy')} — ${completed}/${total} tasks`}
            onKeyDown={(e) => e.key === 'Enter' && onClick(date)}
        >
            <span className={[
                'text-sm font-medium self-start leading-none transition-colors px-1.5 py-0.5 rounded',
                today ? 'bg-white text-slate-900 font-bold' : 'text-white/90',
                allDone ? 'text-emerald-100' : '',
                anyPending ? 'text-rose-100' : '',
            ].join(' ')}>
                {format(date, 'd')}
            </span>
            <StatusMarker completed={completed} total={total} />
        </motion.div>
    );
}

export default memo(CalendarTile, (prev, next) =>
    prev.date.getTime() === next.date.getTime() &&
    prev.isCurrentMonth === next.isCurrentMonth &&
    prev.summary.completed === next.summary.completed &&
    prev.summary.total === next.summary.total
);
