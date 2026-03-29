import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { format, isToday, isPast } from 'date-fns';
import { getTasks, createTask, updateTask, deleteTask } from '../api/tasks';
import { useCalendar } from '../context/CalendarContext';

const panelVariants = {
    hidden: { scale: 0.88, opacity: 0, y: 24 },
    visible: { scale: 1, opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 26 } },
    exit: { scale: 0.88, opacity: 0, y: 24, transition: { duration: 0.15 } },
};

export default function DayModal({ date, onClose }) {
    const { refreshSummary } = useCalendar();
    const shouldReduceMotion = useReducedMotion();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newTitle, setNewTitle] = useState('');
    const [adding, setAdding] = useState(false);

    const dateStr = format(date, 'yyyy-MM-dd');
    const displayDate = format(date, 'EEEE, MMMM d, yyyy');
    const completedCount = tasks.filter((t) => t.completed).length;

    // Determine if this day is in the past (locked)
    const isDateToday = isToday(date);
    const isDatePast = isPast(date) && !isDateToday;

    const fetchTasks = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await getTasks(dateStr);
            setTasks(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [dateStr]);

    useEffect(() => { fetchTasks(); }, [fetchTasks]);

    useEffect(() => {
        const handler = (e) => e.key === 'Escape' && onClose();
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [onClose]);

    const handleToggle = async (taskId, currentStatus) => {
        if (isDatePast) return; // Guard
        const snapshot = [...tasks];
        setTasks((prev) => prev.map((t) => t._id === taskId ? { ...t, completed: !currentStatus } : t));
        try {
            await updateTask(taskId, { completed: !currentStatus });
            refreshSummary();
        } catch {
            setTasks(snapshot);
        }
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!newTitle.trim() || isDatePast) return; // Guard
        setAdding(true);
        try {
            const { data } = await createTask({ title: newTitle.trim(), date: dateStr });
            setTasks((prev) => [...prev, data]);
            setNewTitle('');
            refreshSummary();
        } catch (err) {
            console.error(err);
        } finally {
            setAdding(false);
        }
    };

    const handleDelete = async (taskId) => {
        if (isDatePast) return; // Guard
        const snapshot = [...tasks];
        setTasks((prev) => prev.filter((t) => t._id !== taskId));
        try {
            await deleteTask(taskId);
            refreshSummary();
        } catch {
            setTasks(snapshot);
        }
    };

    return createPortal(
        <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[1000] p-5"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <motion.div
                className="glass w-full max-w-[480px] rounded-2xl flex flex-col overflow-hidden max-h-[85vh]"
                style={{ willChange: 'transform, opacity' }}
                variants={shouldReduceMotion ? {} : panelVariants}
                initial="hidden" animate="visible" exit="exit"
            >
                {/* Header */}
                <div className="flex items-start justify-between px-5 pt-5 pb-4 border-b border-white/10">
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold tracking-tight">{displayDate}</h3>
                            {isDatePast && (
                                <span className="px-2 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-[0.65rem] text-rose-300 font-bold uppercase tracking-wider">
                                    Locked
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-white/50 mt-1">
                            {tasks.length === 0 ? 'No tasks yet' : `${completedCount}/${tasks.length} completed`}
                        </p>
                    </div>
                    <motion.button
                        className="w-9 h-9 rounded-full bg-white/[0.08] border border-white/20 text-white/80 text-2xl flex items-center justify-center cursor-pointer leading-none flex-shrink-0"
                        style={{ willChange: 'transform' }}
                        whileHover={shouldReduceMotion ? {} : { scale: 1.15, rotate: 90 }}
                        whileTap={shouldReduceMotion ? {} : { scale: 0.9 }}
                        onClick={onClose} aria-label="Close modal"
                    >×</motion.button>
                </div>

                {/* Task list */}
                <div className="flex-1 overflow-y-auto scrollbar-thin px-4 py-3 flex flex-col gap-2">
                    {loading ? (
                        <div className="flex flex-col gap-2">
                            {[1, 2, 3].map((i) => <div key={i} className="skeleton h-11 rounded-xl" />)}
                        </div>
                    ) : tasks.length === 0 ? (
                        <div className="flex flex-col items-center gap-3 py-8 text-white/40 text-sm">
                            <span className="text-4xl opacity-70">{isDatePast ? '📔' : '📋'}</span>
                            <p>{isDatePast ? 'No history for this day' : 'Add your first task for this day'}</p>
                        </div>
                    ) : (
                        <AnimatePresence mode="popLayout">
                            {tasks.map((task) => (
                                <motion.div
                                    key={task._id}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border border-white/10 transition-colors group ${isDatePast ? 'bg-white/[0.03] cursor-default' : 'bg-white/[0.05] hover:bg-white/[0.09] cursor-pointer'
                                        }`}
                                    layout="position"
                                    initial={{ opacity: 0, x: -16 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 16, transition: { duration: 0.12 } }}
                                    transition={{ duration: 0.18 }}
                                    style={{ willChange: 'transform, opacity' }}
                                >
                                    {/* Checkbox */}
                                    <motion.button
                                        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center text-xs flex-shrink-0 transition-colors ${task.completed
                                                ? 'bg-emerald-500/15 border-emerald-500 text-emerald-500'
                                                : 'bg-transparent border-white/20'
                                            } ${isDatePast ? 'cursor-default opacity-60' : 'cursor-pointer'}`}
                                        style={{ willChange: 'transform' }}
                                        whileHover={isDatePast ? {} : { scale: 1.15 }}
                                        whileTap={isDatePast ? {} : { scale: 0.85 }}
                                        onClick={() => handleToggle(task._id, task.completed)}
                                        disabled={isDatePast}
                                    >
                                        {task.completed && (
                                            <motion.span
                                                initial={{ scale: 0 }} animate={{ scale: 1 }}
                                                transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                                            >✓</motion.span>
                                        )}
                                    </motion.button>

                                    {/* Title */}
                                    <span className={`flex-1 text-sm font-normal break-words ${task.completed ? 'text-white/40 strikethrough' : 'text-white/90'}`}>
                                        {task.title}
                                    </span>

                                    {/* Delete (Hidden for past days) */}
                                    {!isDatePast && (
                                        <motion.button
                                            className="text-white/30 text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:text-[#f87171] cursor-pointer px-1 rounded flex-shrink-0"
                                            whileHover={{ scale: 1.2 }}
                                            whileTap={{ scale: 0.8 }}
                                            onClick={() => handleDelete(task._id)}
                                            aria-label="Delete task"
                                        >✕</motion.button>
                                    )}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    )}
                </div>

                {/* Add task form - Hidden or Disabled for past days */}
                {!isDatePast ? (
                    <form className="flex gap-2 px-4 py-3.5 border-t border-white/10" onSubmit={handleAdd}>
                        <input
                            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-normal text-white/90 placeholder-white/30 bg-white/[0.08] border border-white/20 outline-none focus:border-accent focus:shadow-[0_0_12px_rgba(167,139,250,0.4)] transition-all"
                            type="text"
                            placeholder="Add a new task…"
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            disabled={adding}
                            aria-label="New task title"
                            maxLength={200}
                        />
                        <motion.button
                            className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white text-2xl flex items-center justify-center cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
                            style={{ boxShadow: '0 4px 15px rgba(124,58,237,0.4)', willChange: 'transform' }}
                            type="submit"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            disabled={adding || !newTitle.trim()}
                        >{adding ? '…' : '+'}</motion.button>
                    </form>
                ) : (
                    <div className="px-5 py-4 border-t border-white/10 bg-rose-500/5">
                        <p className="text-[0.7rem] text-center text-rose-300/80 font-medium">
                            Task history is locked for past dates.
                        </p>
                    </div>
                )}
            </motion.div>
        </motion.div>,
        document.body
    );
}
