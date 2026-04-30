'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, MapPin, Calendar, Users, ChevronDown, Plus, Minus, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { GlobalSearch } from '@/components/GlobalSearch';

const HERO_IMAGES = [

  {
    url: 'https://images.unsplash.com/photo-1660562925534-3f6948ac654f?w=1920&q=80',
    location: 'Hội An, Việt Nam',
  },
  {
    url: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=1920&q=80',
    location: 'Sài Gòn, Việt Nam',
  },
  {
    url: 'https://images.unsplash.com/photo-1601108644994-1e450e786d3d?w=1920&q=80',
    location: 'Hà Nội, Việt Nam',
  },
  {
    url: 'https://images.unsplash.com/photo-1696993545232-2b2717676c40?w=1920&q=80',
    location: 'Đà Nẵng, Việt Nam',
  },
];

export function HeroSection() {
  const router = useRouter();
  const [location, setLocation] = useState('');
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showGuestPicker, setShowGuestPicker] = useState(false);
  const [checkIn, setCheckIn] = useState<Date | null>(null);
  const [checkOut, setCheckOut] = useState<Date | null>(null);
  const [selectingCheckOut, setSelectingCheckOut] = useState(false);
  const [guests, setGuests] = useState({ adults: 2, children: 0 });
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 3));
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowLocationDropdown(false);
        setShowDatePicker(false);
        setShowGuestPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const popularDestinations = [
    { city: 'Hà Nội', country: 'Việt Nam', icon: '🏯' },
    { city: 'Hồ Chí Minh', country: 'Việt Nam', icon: '🌆' },
    { city: 'Đà Nẵng', country: 'Việt Nam', icon: '🏖️' },
    { city: 'Hội An', country: 'Việt Nam', icon: '🏮' },
    { city: 'Phú Quốc', country: 'Việt Nam', icon: '🌴' },
    { city: 'Nha Trang', country: 'Việt Nam', icon: '🐚' },
  ];

  const formatDate = (date: Date | null) => {
    if (!date) return null;
    return date.toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' });
  };

  const getDaysInMonth = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

  const getFirstDayOfMonth = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const isDateSelected = (day: number, monthOffset = 0) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + monthOffset, day);
    if (checkIn && checkOut) return date >= checkIn && date <= checkOut;
    return (checkIn && date.getTime() === checkIn.getTime()) ||
           (checkOut && date.getTime() === checkOut.getTime()) || false;
  };

  const isStartDate = (day: number, monthOffset = 0) => {
    if (!checkIn) return false;
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + monthOffset, day);
    return date.getTime() === checkIn.getTime();
  };

  const isEndDate = (day: number, monthOffset = 0) => {
    if (!checkOut) return false;
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + monthOffset, day);
    return date.getTime() === checkOut.getTime();
  };

  const handleDateClick = (day: number, monthOffset = 0) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + monthOffset, day);
    if (!checkIn || (checkIn && checkOut)) {
      setCheckIn(date); setCheckOut(null); setSelectingCheckOut(true);
    } else if (selectingCheckOut && date > checkIn) {
      setCheckOut(date); setSelectingCheckOut(false);
    } else {
      setCheckIn(date); setCheckOut(null); setSelectingCheckOut(true);
    }
  };

  const renderCalendar = (monthOffset = 0) => {
    const monthDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + monthOffset, 1);
    const daysInMonth = getDaysInMonth(monthDate);
    const firstDay = getFirstDayOfMonth(monthDate);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const monthName = monthDate.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' });
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(<div key={`e-${i}`} />);
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(monthDate.getFullYear(), monthDate.getMonth(), day);
      const isPast = date < today;
      const selected = isDateSelected(day, monthOffset);
      const isStart = isStartDate(day, monthOffset);
      const isEnd = isEndDate(day, monthOffset);
      days.push(
        <button key={day} disabled={isPast} onClick={() => !isPast && handleDateClick(day, monthOffset)}
          className={`h-8 w-8 rounded-full text-xs transition-all flex items-center justify-center
            ${isPast ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-violet-100 cursor-pointer'}
            ${selected && !isStart && !isEnd ? 'bg-violet-50 text-violet-700 rounded-none' : ''}
            ${isStart || isEnd ? 'bg-violet-600 text-white hover:bg-violet-700' : ''}
          `}>
          {day}
        </button>
      );
    }
    return (
      <div>
        <p className="text-center text-sm mb-3 text-gray-800 font-semibold">{monthName}</p>
        <div className="grid grid-cols-7 gap-0 text-center">
          {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map((d) => (
            <div key={d} className="text-xs text-gray-400 mb-2 h-6 flex items-center justify-center font-semibold">{d}</div>
          ))}
          {days}
        </div>
      </div>
    );
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (location) params.set('search', location);
    if (checkIn) params.set('checkIn', checkIn.toISOString().split('T')[0]);
    if (checkOut) params.set('checkOut', checkOut.toISOString().split('T')[0]);
    router.push(`/hotels?${params.toString()}`);
  };
  const [currentSlide, setCurrentSlide] = useState(0);

// Auto-advance slideshow mỗi 5 giây
useEffect(() => {
  const timer = setInterval(() => {
    setCurrentSlide((prev) => (prev + 1) % HERO_IMAGES.length);
  }, 5000);
  return () => clearInterval(timer);
}, []);

  const totalGuests = guests.adults + guests.children;

  return (
    <div className="bg-white px-3 pt-3 pb-0">
      <section className="relative w-full h-[680px] flex flex-col overflow-hidden flex items-center justify-center"
      style={{
          height: '92vh',
          borderRadius: '24px',
        }}>
      <div className="absolute inset-0">
  {HERO_IMAGES.map((img, index) => (
    <div
      key={img.url}
      className="absolute inset-0 transition-opacity duration-1000"
      style={{ opacity: index === currentSlide ? 1 : 0 }}
    >
      <img
        src={img.url}
        alt={img.location}
        className="w-full h-full object-cover"
      />
    </div>
  ))}
  <div className="absolute bottom-6 right-8 z-10 flex items-center gap-3 text-white/90 text-xs">
  <span className="flex items-center gap-1.5">
    <span className="w-1.5 h-1.5 rounded-full bg-white/60" />
    {HERO_IMAGES[currentSlide].location}
  </span>
  {/* Dot indicators */}
  <div className="flex gap-1.5">
    {HERO_IMAGES.map((_, i) => (
      <button
        key={i}
        onClick={() => setCurrentSlide(i)}
        className={`transition-all duration-300 rounded-full ${
          i === currentSlide
            ? 'w-5 h-1.5 bg-white'
            : 'w-1.5 h-1.5 bg-white/40 hover:bg-white/60'
        }`}
      />
    ))}
  </div>
</div>
</div>

      <div className="relative z-10 w-full max-w-lg px-6">
  <div className="relative w-full">
    
    {/* Search input */}
    <GlobalSearch
      size="lg"
      placeholder="Tìm thành phố, khách sạn..."
      className="w-full pr-16"
    />

    {/* Nút search nằm trong input */}
    <button
      onClick={() => router.push('/hotels')}
      className="absolute right-2 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all active:scale-95 hover:scale-105"
      style={{
        background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
      }}
    >
      <Search size={20} className="text-white" />
    </button>

  </div>
</div>
    </section>
    </div>
  );
}