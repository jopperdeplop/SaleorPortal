'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState, useRef } from 'react';
import { Calendar, Filter, ChevronDown, Check, ChevronLeft, ChevronRight } from 'lucide-react';

// Helper for conditional classes
function cn(...classes: (string | undefined | null | false)[]) {
    return classes.filter(Boolean).join(' ');
}

type Period = 'today' | 'last-7' | 'last-30' | 'this-year' | 'last-365' | 'custom';

// --- Date Utils (Native) ---
const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function getDaysInMonth(year: number, month: number) {
    return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
    return new Date(year, month, 1).getDay();
}

// --- Custom Components ---

interface Option {
    label: string;
    value: string;
}

function CustomSelect({
    value,
    onChange,
    options,
    icon: Icon
}: {
    value: string;
    onChange: (val: string) => void;
    options: Option[];
    icon?: any
}) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const selectedOption = options.find(o => o.value === value) || options[0];

    return (
        <div className="relative min-w-[200px]" ref={containerRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "w-full flex items-center justify-between text-left pl-10 pr-4 py-2.5 text-sm font-medium bg-white border rounded-xl shadow-sm text-carbon transition-all duration-200 outline-none",
                    isOpen ? "border-terracotta ring-1 ring-terracotta/20" : "border-vapor hover:border-terracotta/50"
                )}
            >
                <div className="absolute left-3.5 flex items-center pointer-events-none text-stone-400">
                    {Icon && <Icon className="w-4 h-4" />}
                </div>
                <span className="block truncate">{selectedOption.label}</span>
                <ChevronDown className={cn("w-4 h-4 text-stone-400 transition-transform duration-200", isOpen && "rotate-180 text-terracotta")} />
            </button>

            {isOpen && (
                <div className="absolute z-50 w-full mt-2 bg-white border border-vapor rounded-xl shadow-lg py-2 animate-in fade-in zoom-in-95 duration-100 origin-top overflow-hidden">
                    {options.map((option) => {
                        const isSelected = option.value === value;
                        return (
                            <button
                                key={option.value}
                                onClick={() => {
                                    onChange(option.value);
                                    setIsOpen(false);
                                }}
                                className={cn(
                                    "w-full text-left px-4 py-2.5 text-sm flex items-center justify-between transition-colors group",
                                    isSelected ? "text-terracotta font-medium bg-orange-50" : "text-carbon hover:bg-stone-50 hover:text-terracotta"
                                )}
                            >
                                <span>{option.label}</span>
                                {isSelected && <Check className="w-3.5 h-3.5 text-terracotta" />}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

function DatePicker({
    value,
    onChange,
    placeholder = "Select Date"
}: {
    value: string;
    onChange: (date: string) => void;
    placeholder?: string;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Initial view based on value or today
    const initialDate = value ? new Date(value) : new Date();
    // Correction: new Date(string) is UTC. We want local for navigation usually, but let's stick to standard object for view state.
    const [viewYear, setViewYear] = useState(initialDate.getFullYear());
    const [viewMonth, setViewMonth] = useState(initialDate.getMonth());

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handlePrevMonth = () => {
        if (viewMonth === 0) {
            setViewMonth(11);
            setViewYear(viewYear - 1);
        } else {
            setViewMonth(viewMonth - 1);
        }
    };

    const handleNextMonth = () => {
        if (viewMonth === 11) {
            setViewMonth(0);
            setViewYear(viewYear + 1);
        } else {
            setViewMonth(viewMonth + 1);
        }
    };

    const handleSelectDay = (day: number) => {
        // Construct YYYY-MM-DD manually to avoid timezone issues
        const m = (viewMonth + 1).toString().padStart(2, '0');
        const d = day.toString().padStart(2, '0');
        onChange(`${viewYear}-${m}-${d}`);
        setIsOpen(false);
    };

    // Grid Generation
    const daysInGeneric = getDaysInMonth(viewYear, viewMonth);
    const startOffset = getFirstDayOfMonth(viewYear, viewMonth);
    const blanks = Array.from({ length: startOffset });
    const days = Array.from({ length: daysInGeneric }, (_, i) => i + 1);

    // Safe display value for Hydration
    let displayValue = '';
    if (value) {
        // Parse "YYYY-MM-DD" as local date to ensure stable rendering match
        const [y, m, d] = value.split('-').map(Number);
        const localDate = new Date(y, m - 1, d);
        displayValue = localDate.toLocaleDateString('en-GB', { month: 'short', day: 'numeric', year: 'numeric' });
    }

    return (
        <div className="relative w-full" ref={containerRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "w-full flex items-center text-left px-3 py-2.5 text-sm font-medium bg-white border rounded-xl shadow-sm transition-all duration-200 outline-none",
                    isOpen ? "border-terracotta ring-1 ring-terracotta/20" : "border-vapor hover:border-terracotta/50",
                    !value ? "text-stone-400" : "text-carbon"
                )}
            >
                <Calendar className="w-4 h-4 text-stone-400 mr-2" />
                <span className="block truncate flex-1">{displayValue || placeholder}</span>
            </button>

            {isOpen && (
                <div className="absolute z-50 mt-2 bg-white border border-vapor rounded-xl shadow-xl p-4 animate-in fade-in zoom-in-95 duration-100 origin-top min-w-[280px]">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                        <button onClick={handlePrevMonth} className="p-1 hover:bg-stone-50 rounded-full text-stone-400 hover:text-terracotta transition-colors">
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="text-sm font-serif font-bold text-carbon">
                            {MONTHS[viewMonth]} {viewYear}
                        </span>
                        <button onClick={handleNextMonth} className="p-1 hover:bg-stone-50 rounded-full text-stone-400 hover:text-terracotta transition-colors">
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Days Header */}
                    <div className="grid grid-cols-7 mb-2 text-center">
                        {DAYS.map(d => (
                            <span key={d} className="text-xs font-medium text-stone-400">{d}</span>
                        ))}
                    </div>

                    {/* Days Grid */}
                    <div className="grid grid-cols-7 gap-1 text-center">
                        {blanks.map((_, i) => (
                            <div key={`blank-${i}`} />
                        ))}
                        {days.map(d => {
                            // Check if selected
                            const isSelected = value === `${viewYear}-${(viewMonth + 1).toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;

                            // Check "Today" status using local time
                            const now = new Date();
                            const isToday = now.getDate() === d && now.getMonth() === viewMonth && now.getFullYear() === viewYear;

                            return (
                                <button
                                    key={d}
                                    onClick={() => handleSelectDay(d)}
                                    className={cn(
                                        "w-8 h-8 flex items-center justify-center text-sm rounded-lg transition-colors",
                                        isSelected
                                            ? "bg-terracotta text-white font-medium shadow-sm"
                                            : "text-carbon hover:bg-orange-50 hover:text-terracotta",
                                        !isSelected && isToday && "font-bold text-terracotta ring-1 ring-terracotta/30"
                                    )}
                                >
                                    {d}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}

// --- Main Filter Component ---

interface OrderFiltersProps {
    defaultStartDate?: Date;
    defaultEndDate?: Date;
}

export default function OrderFilters({ defaultStartDate, defaultEndDate }: OrderFiltersProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Helper to format Date to YYYY-MM-DD (Local Time logic to avoid UTC shift)
    const formatDate = (date?: Date) => {
        if (!date) return '';
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const currentStart = searchParams.get('startDate');
    const currentEnd = searchParams.get('endDate');

    // Local state for period selector
    const [period, setPeriod] = useState<Period>(() => {
        if (!currentStart && !currentEnd) return 'last-30';
        return 'custom';
    });

    const currentStatus = searchParams.get('status') || '';

    const applyPeriod = (selectedPeriod: Period) => {
        const now = new Date();
        let start = new Date();
        let end = new Date(); // Defaults to now

        // Use SetHours to clear time, but generally safe to rely on local dates
        // But for calculation (e.g. -7 days), standard Date math works on local timestamps fine

        // Reset time component isn't strictly necessary with formatDate using local YMD, 
        // but keeps things clean
        now.setHours(0, 0, 0, 0);
        start.setHours(0, 0, 0, 0);
        end.setHours(0, 0, 0, 0);

        switch (selectedPeriod) {
            case 'today': break;
            case 'last-7': start.setDate(now.getDate() - 7); break;
            case 'last-30': start.setDate(now.getDate() - 30); break;
            case 'this-year': start = new Date(now.getFullYear(), 0, 1); break;
            case 'last-365': start.setDate(now.getDate() - 365); break;
            case 'custom':
                setPeriod('custom');
                return;
        }

        setPeriod(selectedPeriod);
        updateParams(formatDate(start), formatDate(end));
    };

    const updateParams = useCallback((start: string, end: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (start) params.set('startDate', start); else params.delete('startDate');
        if (end) params.set('endDate', end); else params.delete('endDate');
        router.push(pathname + '?' + params.toString());
    }, [searchParams, pathname, router]);

    const handleStatusChange = (status: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (status) params.set('status', status); else params.delete('status');
        router.push(pathname + '?' + params.toString());
    };

    const periodOptions = [
        { label: 'Today', value: 'today' },
        { label: 'Last 7 Days', value: 'last-7' },
        { label: 'Last 30 Days', value: 'last-30' },
        { label: 'This Year', value: 'this-year' },
        { label: 'Last 365 Days', value: 'last-365' },
        { label: 'Custom Range', value: 'custom' },
    ];

    const statusOptions = [
        { label: 'All Statuses', value: '' },
        { label: 'Unfulfilled', value: 'UNFULFILLED' },
        { label: 'Fulfilled', value: 'FULFILLED' },
        { label: 'Canceled', value: 'CANCELED' },
        { label: 'Returned', value: 'RETURNED' },
    ];

    const isFiltered = searchParams.has('startDate') || searchParams.has('status');

    return (
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-8 bg-stone-50/50 p-2 rounded-2xl border border-vapor/50">

            {/* Period Select */}
            <CustomSelect
                value={period}
                onChange={(val) => applyPeriod(val as Period)}
                options={periodOptions}
                icon={Calendar}
            />

            {/* Custom Date Inputs */}
            {period === 'custom' && (
                <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-300">
                    <div className="w-[140px]">
                        <DatePicker
                            value={currentStart || ''}
                            onChange={(val) => updateParams(val, currentEnd || '')}
                            placeholder="Start"
                        />
                    </div>
                    <span className="text-stone-300">-</span>
                    <div className="w-[140px]">
                        <DatePicker
                            value={currentEnd || ''}
                            onChange={(val) => updateParams(currentStart || '', val)}
                            placeholder="End"
                        />
                    </div>
                </div>
            )}

            <div className="h-8 w-px bg-vapor mx-2 hidden sm:block"></div>

            {/* Status Select */}
            <CustomSelect
                value={currentStatus}
                onChange={handleStatusChange}
                options={statusOptions}
                icon={Filter}
            />

            <div className="flex-1" />

            {/* Clear Button */}
            {isFiltered && (
                <button
                    onClick={() => {
                        setPeriod('last-30');
                        const params = new URLSearchParams();
                        router.push(pathname);
                    }}
                    className="mr-2 text-sm text-stone-500 hover:text-terracotta font-medium transition-colors px-3 py-2 rounded-lg hover:bg-white/50"
                >
                    Reset Defaults
                </button>
            )}
        </div>
    );
}
