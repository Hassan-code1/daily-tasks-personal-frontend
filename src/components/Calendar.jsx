import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addDays, getDay } from 'date-fns';
import { useCalendar } from '../context/CalendarContext';
import CalendarTile from './CalendarTile';
import DayModal from './DayModal';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function buildGrid(month, year) {
    const first = startOfMonth(new Date(year, month - 1, 1));
    const last = endOfMonth(first);
    const startPad = getDay(first);
    const endPad = 6 - getDay(last);

    const days = [];
    for (let i = startPad; i > 0; i--) days.push({ date: addDays(first, -i), isCurrentMonth: false });
    eachDayOfInterval({ start: first, end: last }).forEach((d) =>
        days.push({ date: d, isCurrentMonth: true })
    );
    for (let i = 1; i <= endPad; i++) days.push({ date: addDays(last, i), isCurrentMonth: false });
    return days;
}

export default function Calendar() {
    const { currentMonth, currentYear, summaryMap, loadingSummary, goNextMonth, goPrevMonth } = useCalendar();
    const [selectedDate, setSelectedDate] = useState(null);
    const shouldReduceMotion = useReducedMotion();

    // Memoize expensive grid calculation — only recomputes when month/year changes
    const grid = useMemo(() => buildGrid(currentMonth, currentYear), [currentMonth, currentYear]);
    const monthLabel = useMemo(
        () => format(new Date(currentYear, currentMonth - 1, 1), 'MMMM yyyy'),
        [currentMonth, currentYear]
    );

    const handleTileClick = useCallback((date) => setSelectedDate(date), []);

    return (
        <div className="flex flex-col gap-3">
            {/* Month Header */}
            <div className="glass flex items-center justify-between px-6 py-4 rounded-2xl">
                <motion.button
                    className="w-11 h-11 rounded-full bg-white/10 border border-white/20 text-white text-2xl flex items-center justify-center cursor-pointer hover:bg-white/20 transition-colors"
                    style={{ willChange: 'transform' }}
                    whileHover={shouldReduceMotion ? {} : { scale: 1.1 }}
                    whileTap={shouldReduceMotion ? {} : { scale: 0.9 }}
                    onClick={goPrevMonth} aria-label="Previous month"
                >‹</motion.button>

                <AnimatePresence mode="wait">
                    <motion.h2
                        key={monthLabel}
                        className="text-2xl font-semibold tracking-tight"
                        initial={shouldReduceMotion ? {} : { opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={shouldReduceMotion ? {} : { opacity: 0, y: 10 }}
                        transition={{ duration: 0.18 }}
                    >{monthLabel}</motion.h2>
                </AnimatePresence>

                <motion.button
                    className="w-11 h-11 rounded-full bg-white/10 border border-white/20 text-white text-2xl flex items-center justify-center cursor-pointer hover:bg-white/20 transition-colors"
                    style={{ willChange: 'transform' }}
                    whileHover={shouldReduceMotion ? {} : { scale: 1.1 }}
                    whileTap={shouldReduceMotion ? {} : { scale: 0.9 }}
                    onClick={goNextMonth} aria-label="Next month"
                >›</motion.button>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1.5 px-0.5">
                {DAYS.map((d) => (
                    <div key={d} className="text-center text-[0.68rem] font-semibold tracking-widest uppercase text-white/50 py-1">
                        {d}
                    </div>
                ))}
            </div>

            {/* Grid */}
            <motion.div
                key={`${currentMonth}-${currentYear}`}
                className={`grid grid-cols-7 gap-1.5 transition-opacity duration-200 ${loadingSummary ? 'opacity-50 pointer-events-none' : ''}`}
                initial={shouldReduceMotion ? {} : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
            >
                {grid.map((cell, i) => {
                    const dateKey = format(cell.date, 'yyyy-MM-dd');
                    return (
                        <CalendarTile
                            key={dateKey}
                            date={cell.date}
                            isCurrentMonth={cell.isCurrentMonth}
                            summary={summaryMap[dateKey] || { completed: 0, total: 0 }}
                            onClick={handleTileClick}
                            index={i}
                        />
                    );
                })}
            </motion.div>

            <AnimatePresence>
                {selectedDate && (
                    <DayModal date={selectedDate} onClose={() => setSelectedDate(null)} />
                )}
            </AnimatePresence>
        </div>
    );
}
