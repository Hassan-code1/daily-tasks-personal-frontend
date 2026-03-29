import { memo } from 'react';
import { motion } from 'framer-motion';
import { format, isToday, isPast } from 'date-fns';
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
    const isDatePast = isPast(date) && !today;
    const allDone = summary.total > 0 && summary.completed === summary.total;
    const incompletePast = isDatePast && summary.total > 0 && summary.completed < summary.total;

    const staggerDelay = Math.min(index * 0.008, 0.25);

    // Dynamic status classes with !important (!) to override base glass background
    const statusClasses = [
        'glass rounded-xl flex flex-col items-center justify-between p-2 cursor-pointer select-none',
        'min-h-[72px] transition-all duration-300',
        !isCurrentMonth ? 'opacity-30' : '',
        today ? 'tile-today' : '',
        // Green: All tasks done (vibrant enough to override)
        allDone ? '!bg-emerald-500/35 border-emerald-400/60 shadow-[0_0_20px_rgba(16,185,129,0.3)]' : '',
        // Red: Past day with incomplete tasks
        incompletePast ? '!bg-rose-500/35 border-rose-400/60 shadow-[0_0_20px_rgba(244,63,94,0.3)]' : '',
        'hover:border-accent hover:shadow-[0_0_16px_rgba(167,139,250,0.4)]',
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
            aria-label={`${format(date, 'MMMM d, yyyy')} — ${summary.completed}/${summary.total} tasks`}
            onKeyDown={(e) => e.key === 'Enter' && onClick(date)}
        >
            <span className={[
                'text-sm font-medium self-start leading-none transition-colors px-1 rounded',
                today ? 'text-accent font-bold underline underline-offset-4' : 'text-white/90',
                allDone ? 'text-white bg-emerald-600/40' : '',
                incompletePast ? 'text-white bg-rose-600/40' : '',
            ].join(' ')}>
                {format(date, 'd')}
            </span>
            <StatusMarker completed={summary.completed} total={summary.total} />
        </motion.div>
    );
}

export default memo(CalendarTile, (prev, next) =>
    prev.date.getTime() === next.date.getTime() &&
    prev.isCurrentMonth === next.isCurrentMonth &&
    prev.summary.completed === next.summary.completed &&
    prev.summary.total === next.summary.total
);
