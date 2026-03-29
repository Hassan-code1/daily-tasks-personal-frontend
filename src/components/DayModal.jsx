import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { format } from 'date-fns';
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

    // Close on Escape key
    useEffect(() => {
        const handler = (e) => e.key === 'Escape' && onClose();
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [onClose]);

    const handleToggle = async (taskId, currentStatus) => {
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
        if (!newTitle.trim()) return;
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
                        <h3 className="text-lg font-semibold tracking-tight">{displayDate}</h3>
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
                            <span className="text-4xl opacity-70">📋</span>
                            <p>Add your first task for this day</p>
                        </div>
                    ) : (
                        // Use popLayout for smoother removal animations
                        <AnimatePresence mode="popLayout">
                            {tasks.map((task) => (
                                <motion.div
                                    key={task._id}
                                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 hover:bg-white/[0.09] transition-colors group"
                                    layout="position" // only animate position changes, not size
                                    initial={{ opacity: 0, x: -16 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 16, transition: { duration: 0.12 } }}
                                    transition={{ duration: 0.18 }}
                                    style={{ willChange: 'transform, opacity' }}
                                >
                                    {/* Checkbox */}
                                    <motion.button
                                        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center text-xs flex-shrink-0 cursor-pointer transition-colors ${task.completed
                                                ? 'bg-[#34d399]/15 border-[#34d399] text-[#34d399]'
                                                : 'bg-transparent border-white/20'
                                            }`}
                                        style={{ willChange: 'transform' }}
                                        whileHover={shouldReduceMotion ? {} : { scale: 1.15 }}
                                        whileTap={shouldReduceMotion ? {} : { scale: 0.85 }}
                                        onClick={() => handleToggle(task._id, task.completed)}
                                        aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}
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

                                    {/* Delete */}
                                    <motion.button
                                        className="text-white/30 text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:text-[#f87171] cursor-pointer px-1 rounded flex-shrink-0"
                                        whileHover={shouldReduceMotion ? {} : { scale: 1.2 }}
                                        whileTap={shouldReduceMotion ? {} : { scale: 0.8 }}
                                        onClick={() => handleDelete(task._id)}
                                        aria-label="Delete task"
                                    >✕</motion.button>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    )}
                </div>

                {/* Add task form */}
                <form className="flex gap-2 px-4 py-3.5 border-t border-white/10" onSubmit={handleAdd}>
                    <input
                        className="flex-1 px-4 py-2.5 rounded-xl text-sm font-normal text-white/90 placeholder-white/30 bg-white/[0.08] border border-white/20 outline-none focus:border-[#a78bfa] focus:shadow-[0_0_12px_rgba(167,139,250,0.4)] transition-all"
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
                        whileHover={shouldReduceMotion ? {} : { scale: 1.05 }}
                        whileTap={shouldReduceMotion ? {} : { scale: 0.95 }}
                        disabled={adding || !newTitle.trim()}
                    >{adding ? '…' : '+'}</motion.button>
                </form>
            </motion.div>
        </motion.div>,
        document.body
    );
}
