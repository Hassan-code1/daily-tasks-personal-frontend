import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getSummary } from '../api/tasks';

const CalendarContext = createContext(null);

export function CalendarProvider({ children }) {
    const today = new Date();
    const [currentMonth, setCurrentMonth] = useState(today.getMonth() + 1); // 1-12
    const [currentYear, setCurrentYear] = useState(today.getFullYear());
    const [summaryMap, setSummaryMap] = useState({}); // { "YYYY-MM-DD": { completed, total } }
    const [loadingSummary, setLoadingSummary] = useState(false);

    const fetchSummary = useCallback(async (month, year) => {
        setLoadingSummary(true);
        try {
            const { data } = await getSummary(month, year);
            const map = {};
            data.forEach((item) => { map[item.date] = item; });
            setSummaryMap(map);
        } catch (err) {
            console.error('Failed to fetch summary:', err);
        } finally {
            setLoadingSummary(false);
        }
    }, []);

    useEffect(() => {
        fetchSummary(currentMonth, currentYear);
    }, [currentMonth, currentYear, fetchSummary]);

    const goNextMonth = () => {
        if (currentMonth === 12) { setCurrentMonth(1); setCurrentYear((y) => y + 1); }
        else setCurrentMonth((m) => m + 1);
    };

    const goPrevMonth = () => {
        if (currentMonth === 1) { setCurrentMonth(12); setCurrentYear((y) => y - 1); }
        else setCurrentMonth((m) => m - 1);
    };

    const refreshSummary = () => fetchSummary(currentMonth, currentYear);

    return (
        <CalendarContext.Provider value={{
            currentMonth, currentYear,
            summaryMap, loadingSummary,
            goNextMonth, goPrevMonth, refreshSummary,
        }}>
            {children}
        </CalendarContext.Provider>
    );
}

export const useCalendar = () => useContext(CalendarContext);
