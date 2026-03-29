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
    const [isDaily, setIsDaily] = useState(false);
    const [adding, setAdding] = useState(false);

    const dateStr = format(date, 'yyyy-MM-dd');
    const displayDate = format(date, 'EEEE, MMMM d, yyyy');
    const completedCount = tasks.filter((t) => t.completed).length;

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

    const handleToggle = async (task) => {
        if (isDatePast) return;
        const snapshot = [...tasks];
        setTasks((prev) => prev.map((t) => t._id === task._id ? { ...t, completed: !task.completed } : t));
        try {
            await updateTask(task._id, { completed: !task.completed, date: dateStr });
            refreshSummary();
        } catch {
            setTasks(snapshot);
        }
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!newTitle.trim() || isDatePast) return;
        setAdding(true);
        try {
            const { data } = await createTask({
                title: newTitle.trim(),
                date: dateStr,
                isDaily
            });
            setTasks((prev) => [...prev, data]);
            setNewTitle('');
            setIsDaily(false);
            refreshSummary();
        } catch (err) {
            console.error(err);
        } finally {
            setAdding(false);
        }
    };

    const handleDelete = async (task, mode = 'all') => {
        if (isDatePast) return;
        const snapshot = [...tasks];
        setTasks((prev) => prev.filter((t) => t._id !== task._id));
        try {
            await deleteTask(task._id, { mode, date: dateStr });
            refreshSummary();
        } catch {
            setTasks(snapshot);
        }
    };

    return createPortal(
        <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[1000] p-5"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <motion.div
                className="glass w-full max-w-[480px] rounded-2xl flex flex-col overflow-hidden max-h-[85vh] !bg-[#0f172a]/90"
                variants={shouldReduceMotion ? {} : panelVariants}
                initial="hidden" animate="visible" exit="exit"
            >
                {/* Header */}
                <div className="flex items-start justify-between px-5 pt-5 pb-4 border-b border-white/5">
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold tracking-tight">{displayDate}</h3>
                            {isDatePast && (
                                <span className="px-2 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-[0.65rem] text-rose-300 font-bold uppercase tracking-wider">
                                    History
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-white/40 mt-1">
                            {tasks.length === 0 ? 'No tasks yet' : `${completedCount}/${tasks.length} completed`}
                        </p>
                    </div>
                    <button className="text-white/40 hover:text-white transition-colors text-2xl" onClick={onClose}>×</button>
                </div>

                {/* Task list */}
                <div className="flex-1 overflow-y-auto scrollbar-thin px-4 py-3 flex flex-col gap-2">
                    {loading ? (
                        <div className="flex flex-col gap-2 p-4">Loading...</div>
                    ) : tasks.length === 0 ? (
                        <div className="flex flex-col items-center gap-3 py-10 text-white/30 text-sm">
                            <p>{isDatePast ? 'No tasks recorded.' : 'Clean slate. High five!'}</p>
                        </div>
                    ) : (
                        <AnimatePresence mode="popLayout">
                            {tasks.map((task) => (
                                <motion.div
                                    key={task._id}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border border-white/5 transition-colors group ${task.isDaily ? 'bg-indigo-500/5 border-indigo-500/20' : 'bg-white/5'
                                        }`}
                                    layout
                                >
                                    <button
                                        className={`w-5 h-5 rounded-md border flex items-center justify-center text-[10px] transition-colors ${task.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-white/20 hover:border-white/40'
                                            } ${isDatePast ? 'cursor-default opacity-50' : 'cursor-pointer'}`}
                                        onClick={() => handleToggle(task)}
                                        disabled={isDatePast}
                                    >
                                        {task.completed && '✓'}
                                    </button>

                                    <div className="flex-1 min-w-0">
                                        <span className={`block text-sm transition-all ${task.completed ? 'text-white/30 line-through' : 'text-white/90'}`}>
                                            {task.title}
                                        </span>
                                        {task.isDaily && (
                                            <span className="text-[10px] font-bold text-indigo-400/80 uppercase tracking-tighter">Daily</span>
                                        )}
                                    </div>

                                    {!isDatePast && (
                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {task.isDaily ? (
                                                <button
                                                    className="text-[10px] text-white/30 hover:text-white bg-white/5 px-2 py-1 rounded"
                                                    onClick={() => handleDelete(task, 'single')}
                                                >Hide Today</button>
                                            ) : null}
                                            <button
                                                className="text-rose-400/50 hover:text-rose-400"
                                                onClick={() => handleDelete(task, 'all')}
                                            >×</button>
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    )}
                </div>

                {/* Footer Add Form */}
                {!isDatePast && (
                    <div className="p-4 border-t border-white/5 bg-black/20">
                        <form onSubmit={handleAdd} className="flex flex-col gap-3">
                            <div className="flex gap-2">
                                <input
                                    className="flex-1 px-4 py-2 rounded-xl text-sm bg-white/5 border border-white/10 outline-none focus:border-indigo-500/50 transition-all font-light"
                                    placeholder="New task title..."
                                    value={newTitle}
                                    onChange={(e) => setNewTitle(e.target.value)}
                                    disabled={adding}
                                />
                                <button
                                    className="px-5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-lg disabled:opacity-40 transition-colors shadow-lg shadow-indigo-600/20"
                                    type="submit"
                                    disabled={adding || !newTitle.trim()}
                                >+</button>
                            </div>
                            <label className="flex items-center gap-2 cursor-pointer self-start select-none">
                                <input
                                    type="checkbox"
                                    className="w-4 h-4 rounded border-white/20 bg-white/5 text-indigo-600 focus:ring-indigo-500"
                                    checked={isDaily}
                                    onChange={(e) => setIsDaily(e.target.checked)}
                                />
                                <span className="text-xs text-white/50">Daily recurrence</span>
                            </label>
                        </form>
                    </div>
                )}
            </motion.div>
        </motion.div>,
        document.body
    );
}
