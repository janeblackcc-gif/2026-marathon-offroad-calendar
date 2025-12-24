
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { ALL_EVENTS, groupEventsByDate, sortDates } from './constants';
import { EventCard } from './components/EventCard';
import { EventDetailModal } from './components/EventDetailModal';
import { ProvinceHeatmap } from './components/ProvinceHeatmap';
import { RaceEvent, EventKind, isTrailEvent } from './types';

const MONTHS = ['全部', '1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月', '待定'];

const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [eventType, setEventType] = useState<EventKind>('road');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedMonth, setSelectedMonth] = useState<string>('全部');
  const [selectedDate, setSelectedDate] = useState<string>(''); // YYYY-MM-DD
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<RaceEvent | null>(null);

  const dateInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setSearchTerm('');
    setSelectedCategory('All');
    setSelectedMonth('全部');
    setSelectedDate('');
    setSelectedProvince(null);
    setSelectedEvent(null);
  }, [eventType]);

  const filteredEvents = useMemo(() => {
    return ALL_EVENTS.filter(event => {
      const matchesType = event.kind === eventType;
      const matchesSearch =
        event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.province.includes(searchTerm);
      const matchesCategory = selectedCategory === 'All' || event.category === selectedCategory;

      let matchesMonth = true;
      if (selectedMonth !== '全部') {
        if (selectedMonth === '待定') {
          matchesMonth = event.time === '待定';
        } else {
          const monthNum = selectedMonth.replace('月', '');
          const monthRegex = new RegExp(`(^|\\D)${monthNum}月`);
          matchesMonth = monthRegex.test(event.time);
        }
      }

      let matchesDate = true;
      if (selectedDate) {
        const [_, m, d] = selectedDate.split('-');
        const mNum = parseInt(m);
        const dNum = parseInt(d);
        const exactDateStr = `${mNum}月${dNum}日`;
        const fuzzyMonthStr = `${mNum}月`;
        matchesDate = event.time === exactDateStr || event.time === fuzzyMonthStr;
      }

      const matchesProvince = !selectedProvince || event.province === selectedProvince;

      return matchesType && matchesSearch && matchesCategory && matchesMonth && matchesDate && matchesProvince;
    });
  }, [eventType, searchTerm, selectedCategory, selectedMonth, selectedDate, selectedProvince]);

  const grouped = useMemo(() => {
    const groups = groupEventsByDate(filteredEvents);
    return Object.keys(groups).sort(sortDates).map(date => ({
      date,
      events: groups[date]
    }));
  }, [filteredEvents]);

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All');
    setSelectedMonth('全部');
    setSelectedDate('');
    setSelectedProvince(null);
  };

  const isFiltered = searchTerm || selectedCategory !== 'All' || selectedMonth !== '全部' || selectedDate || selectedProvince;

  const isTrail = eventType === 'trail';
  const themeColor = isTrail ? 'green' : 'red';

  const renderEventList = () => (
    <div className="animate-in slide-in-from-bottom-4 duration-500">
      {isFiltered && (
        <div className={`mb-6 sm:mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white border p-4 rounded-3xl shadow-sm ring-1 gap-4 ${isTrail ? 'border-green-100 ring-green-50' : 'border-red-100 ring-red-50'}`}>
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 text-white rounded-xl flex items-center justify-center shrink-0 ${isTrail ? 'bg-green-600' : 'bg-red-600'}`}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
            </div>
            <span className="text-sm font-bold text-slate-600">
              筛选出 <span className={`text-lg ${isTrail ? 'text-green-600' : 'text-red-600'}`}>{filteredEvents.length}</span> 场赛事
              {selectedProvince && (
                <span className={`ml-2 inline-block px-3 py-1 text-white rounded-full text-[10px] font-black uppercase ${isTrail ? 'bg-green-600' : 'bg-red-600'}`}>
                  {selectedProvince}
                </span>
              )}
            </span>
          </div>
          <button
            onClick={resetFilters}
            className={`w-full sm:w-auto text-xs font-black text-slate-400 border border-slate-200 px-4 py-2 rounded-xl transition-all hover:bg-slate-50 flex items-center justify-center gap-2 ${isTrail ? 'hover:text-green-600' : 'hover:text-red-600'}`}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357-2H15" />
            </svg>
            重置筛选
          </button>
        </div>
      )}

      {grouped.length > 0 ? (
        <div className="space-y-12 sm:space-y-16">
          {grouped.map((group) => {
            const isFuzzyDate = !group.date.includes('日') && group.date !== '待定';
            const isPeakDay = group.events.length >= 5;
            
            return (
              <section key={group.date} className="relative">
                <div className="flex items-center gap-4 mb-6 sm:mb-8 sticky top-[165px] sm:top-[180px] lg:top-[140px] bg-white/95 py-3 sm:py-4 z-40 backdrop-blur-sm">
                  <div className={`px-4 sm:px-5 py-2 rounded-2xl shadow-xl flex items-center gap-3 transition-colors ${
                    isPeakDay ? 'bg-orange-600' :
                    isFuzzyDate ? 'bg-amber-500' :
                    group.date === '待定' ? 'bg-slate-400' :
                    isTrail ? 'bg-green-600 shadow-green-200/50' : 'bg-red-600 shadow-red-200/50'
                  }`}>
                    <span className="text-white text-lg sm:text-xl font-black tracking-tighter">
                      {group.date}
                    </span>
                    {isPeakDay && (
                      <span className="bg-white/20 text-white text-[10px] px-2 py-0.5 rounded-lg font-black uppercase hidden sm:inline-flex">
                        撞期巅峰
                      </span>
                    )}
                  </div>
                  <div className="h-px bg-slate-100 grow"></div>
                  <div className="bg-slate-50 px-3 sm:px-4 py-1.5 sm:py-2 rounded-2xl border border-slate-100 flex items-center gap-2">
                     <span className="text-xs sm:text-sm font-black text-slate-400">
                      {group.events.length} 场
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {group.events.map((event) => (
                    <EventCard 
                      key={event.id} 
                      event={event} 
                      onClick={() => setSelectedEvent(event)} 
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 sm:py-32 text-center bg-slate-50 rounded-[32px] sm:rounded-[40px] border-2 border-dashed border-slate-200 px-6">
          <h3 className="text-xl sm:text-2xl font-black text-slate-400">该条件下未找到比赛</h3>
          <button
            onClick={resetFilters}
            className={`mt-8 px-6 sm:px-8 py-3 sm:py-3.5 text-white font-black rounded-2xl shadow-xl transition-all active:scale-95 ${isTrail ? 'bg-green-600 shadow-green-100' : 'bg-red-600 shadow-red-100'}`}
          >
            查看全部赛事
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className={`min-h-screen bg-white text-slate-900 font-sans ${isTrail ? 'selection:bg-green-100 selection:text-green-600' : 'selection:bg-red-100 selection:text-red-600'}`}>
      {/* Header */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-50 backdrop-blur-md bg-white/95">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8">
              {/* Logo */}
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shadow-lg shrink-0 transition-colors duration-500 ${isTrail ? 'bg-green-600 shadow-green-200' : 'bg-red-600 shadow-red-200'}`}>
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-base sm:text-lg font-black text-slate-900 leading-none">2026全国{isTrail ? '越野跑' : '马拉松'}赛事日历</h1>
                  <p className="text-[9px] sm:text-[10px] text-slate-400 mt-1 font-bold flex items-center gap-1">
                    <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-green-500 rounded-full"></span>
                    {isTrail ? '精选 67 场越野赛事' : '同步中国田协 492 场赛事'}
                  </p>
                </div>
              </div>

              {/* Event Type Switcher */}
              <div className="bg-slate-100 p-1 rounded-xl flex items-center w-full sm:w-auto">
                <button
                  onClick={() => setEventType('road')}
                  className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-bold transition-all ${eventType === 'road' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  城市路跑
                </button>
                <button
                  onClick={() => setEventType('trail')}
                  className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-bold transition-all ${eventType === 'trail' ? 'bg-white text-green-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  山地越野
                </button>
              </div>

              {/* View Toggle */}
              <div className="bg-slate-100 p-1 rounded-xl flex items-center w-full sm:w-auto">
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'list' ? `bg-white shadow-sm ${isTrail ? 'text-green-600' : 'text-red-600'}` : 'text-slate-500 hover:text-slate-700'}`}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                  列表
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'map' ? `bg-white shadow-sm ${isTrail ? 'text-green-600' : 'text-red-600'}` : 'text-slate-500 hover:text-slate-700'}`}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  地图
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 grow max-w-5xl">
              {/* Search */}
              <div className="relative grow">
                <input
                  type="text"
                  placeholder="搜索赛事名称或省份..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 sm:py-2.5 bg-slate-100 border-none rounded-xl focus:ring-2 transition-all outline-none text-sm font-medium ${isTrail ? 'focus:ring-green-500' : 'focus:ring-red-500'}`}
                />
                <svg className="w-4 h-4 absolute left-3.5 top-2.5 sm:top-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              <div className="grid grid-cols-2 gap-2 shrink-0">
                {/* Fixed Robust Date Picker for PC & Mobile */}
                <div className="relative h-full min-h-[36px] sm:min-h-[44px]">
                  <div className={`pointer-events-none flex items-center justify-center gap-2 rounded-xl px-4 py-2 sm:py-2.5 w-full h-full border transition-all ${selectedDate ? isTrail ? 'bg-green-50 text-green-600 border-green-200' : 'bg-red-50 text-red-600 border-red-200' : 'bg-slate-100 text-slate-400 border-transparent'}`}>
                    <svg className={`w-3.5 h-3.5 shrink-0 ${selectedDate ? isTrail ? 'text-green-500' : 'text-red-500' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-[10px] sm:text-xs font-black truncate">
                      {selectedDate ? selectedDate.split('-').slice(1).join('/') : '选择日期'}
                    </span>
                  </div>
                  {/* Actual visible input but transparent, overlaying the design */}
                  <input
                    ref={dateInputRef}
                    type="date"
                    value={selectedDate}
                    onChange={(e) => {
                      setSelectedDate(e.target.value);
                      setSelectedMonth('全部');
                    }}
                    onClick={(e) => {
                      try {
                        (e.target as HTMLInputElement).showPicker?.();
                      } catch (err) {}
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10 block"
                    style={{ colorScheme: 'light' }}
                  />
                </div>

                {/* Category Select */}
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className={`w-full px-4 py-2 sm:py-2.5 bg-slate-100 border-none rounded-xl focus:ring-2 transition-all outline-none text-[10px] sm:text-sm font-black appearance-none cursor-pointer text-center hover:bg-slate-200 ${isTrail ? 'focus:ring-green-500' : 'focus:ring-red-500'}`}
                >
                  <option value="All">全部级别</option>
                  <option value="A">A类认证</option>
                  <option value="B">B类标准</option>
                  <option value="C">C类地方</option>
                </select>
              </div>
            </div>
          </div>

          {/* Month Bar */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 pt-3 -mx-4 px-4 sm:mx-0 sm:px-0">
            {MONTHS.map(m => (
              <button
                key={m}
                onClick={() => {
                  setSelectedMonth(m);
                  setSelectedDate('');
                }}
                className={`px-4 py-1.5 rounded-full text-[10px] sm:text-xs font-black whitespace-nowrap transition-all flex-shrink-0 ${
                  selectedMonth === m
                    ? isTrail ? 'bg-green-600 text-white shadow-md' : 'bg-red-600 text-white shadow-md'
                    : isTrail ? 'bg-white border border-slate-200 text-slate-500 hover:border-green-400 hover:text-green-600' : 'bg-white border border-slate-200 text-slate-500 hover:border-red-400 hover:text-red-600'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {viewMode === 'map' ? (
          <div className="space-y-8 sm:space-y-12 animate-in fade-in duration-500">
             <div className="bg-[#0f172a] rounded-[24px] sm:rounded-[40px] overflow-hidden shadow-2xl relative">
                <ProvinceHeatmap
                  eventType={eventType}
                  selectedProvince={selectedProvince}
                  onSelectProvince={setSelectedProvince}
                />
             </div>
             
             <div className="pt-8 border-t border-slate-100">
                <div className="flex items-center gap-2 mb-6 sm:mb-8">
                   <div className="w-1 h-6 bg-red-600 rounded-full"></div>
                   <h2 className="text-lg font-black text-slate-900">
                     {selectedProvince ? `${selectedProvince}赛事详情` : '全部赛事列表'}
                   </h2>
                </div>
                {renderEventList()}
             </div>
          </div>
        ) : (
          renderEventList()
        )}
      </main>

      {/* Brand Footer Section */}
      <footer className="bg-[#0a0f1d] text-white pt-16 pb-8 px-4 sm:px-6 lg:px-8 mt-20">
        <div className="max-w-[1400px] mx-auto flex flex-col items-center text-center">
          {/* Brand Logo Icon */}
          <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center mb-8 shadow-2xl shadow-red-900/20">
            <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          
          <h2 className="text-2xl sm:text-3xl font-black mb-6 tracking-tight">中国马拉松赛事官方日历</h2>
          
          <p className="max-w-2xl text-slate-400 text-sm sm:text-base leading-relaxed mb-16 px-4">
            数据严格同步自中国田径协会发布的《2026年全国马拉松赛事目录》。<br className="hidden sm:block" />
            旨在为全国跑友提供便捷、准确的参赛信息查询服务。
          </p>

          {/* Bottom Bar */}
          <div className="w-full pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-6 text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-widest">
            <div>
              © 2026 MARATHON CALENDAR. 全国 492 场赛事
            </div>
            <div className="flex items-center gap-8">
              <span className="hover:text-red-500 transition-colors cursor-default">实时更新</span>
              <span className="hover:text-red-500 transition-colors cursor-default">官方认证</span>
              <span className="hover:text-red-500 transition-colors cursor-default">中国田协</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Scroll Top Button */}
      <button 
        onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}
        className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 w-12 h-12 sm:w-14 sm:h-14 bg-white text-slate-900 border border-slate-200 rounded-full shadow-2xl flex items-center justify-center hover:bg-red-600 hover:text-white transition-all z-50 active:scale-90"
      >
        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      </button>

      <EventDetailModal 
        event={selectedEvent} 
        onClose={() => setSelectedEvent(null)} 
      />
    </div>
  );
};

export default App;
