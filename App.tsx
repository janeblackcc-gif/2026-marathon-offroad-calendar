
import React, { useState, useMemo } from 'react';
import { RAW_EVENTS, groupEventsByDate, sortDates } from './constants';
import { EventCard } from './components/EventCard';
import { MarathonEvent } from './types';

const MONTHS = ['全部', '1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月', '待定'];

const App: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedMonth, setSelectedMonth] = useState<string>('全部');
  const [selectedDate, setSelectedDate] = useState<string>(''); // YYYY-MM-DD

  const filteredEvents = useMemo(() => {
    return RAW_EVENTS.filter(event => {
      // 1. Text Search
      const matchesSearch = 
        event.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        event.province.includes(searchTerm);

      // 2. Category Filter
      const matchesCategory = selectedCategory === 'All' || event.category === selectedCategory;

      // 3. Month Filter (Fixed the 2月 matching 12月 bug)
      let matchesMonth = true;
      if (selectedMonth !== '全部') {
        if (selectedMonth === '待定') {
          matchesMonth = event.time === '待定';
        } else {
          const monthNum = selectedMonth.replace('月', '');
          // Precise match: number must be preceded by a non-digit character or start of string
          const monthRegex = new RegExp(`(^|\\D)${monthNum}月`);
          matchesMonth = monthRegex.test(event.time);
        }
      }

      // 4. Specific Date Filter (via calendar picker)
      let matchesDate = true;
      if (selectedDate) {
        const [_, m, d] = selectedDate.split('-');
        const mNum = parseInt(m);
        const dNum = parseInt(d);
        const exactDateStr = `${mNum}月${dNum}日`;
        const fuzzyMonthStr = `${mNum}月`;
        
        // If specific date is picked, match exactly or match the month-only entry
        matchesDate = event.time === exactDateStr || event.time === fuzzyMonthStr;
      }

      return matchesSearch && matchesCategory && matchesMonth && matchesDate;
    });
  }, [searchTerm, selectedCategory, selectedMonth, selectedDate]);

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
  };

  const isFiltered = searchTerm || selectedCategory !== 'All' || selectedMonth !== '全部' || selectedDate;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-red-100 selection:text-red-600">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm backdrop-blur-md bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center shadow-lg shadow-red-200 shrink-0">
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-black text-slate-900 leading-none tracking-tight">2026全国马拉松赛事历</h1>
                <p className="text-[10px] text-slate-400 mt-1.5 font-bold uppercase tracking-widest flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                  同步中国田径协会 492 场赛事
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 grow max-w-4xl">
              <div className="relative grow">
                <input
                  type="text"
                  placeholder="搜索赛事名称或省份..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-100 border-2 border-transparent rounded-2xl focus:bg-white focus:border-red-500 transition-all outline-none text-sm font-medium"
                />
                <svg className="w-5 h-5 absolute left-4 top-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              
              <div className="flex gap-2">
                <div className="relative group">
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => {
                      setSelectedDate(e.target.value);
                      setSelectedMonth('全部');
                    }}
                    className="w-full px-4 py-3 bg-slate-100 border-2 border-transparent rounded-2xl focus:bg-white focus:border-red-500 transition-all outline-none text-sm font-bold cursor-pointer"
                  />
                  {!selectedDate && (
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center gap-2 text-slate-400 bg-slate-100 rounded-2xl group-focus-within:hidden">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>选择日期</span>
                    </div>
                  )}
                </div>

                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-3 bg-slate-100 border-2 border-transparent rounded-2xl focus:bg-white focus:border-red-500 transition-all outline-none text-sm font-bold appearance-none cursor-pointer min-w-[120px]"
                >
                  <option value="All">全部级别</option>
                  <option value="A">A类认证</option>
                  <option value="B">B类标准</option>
                  <option value="C">C类地方</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-3 mt-2 -mx-4 px-4 sm:mx-0 sm:px-0">
            {MONTHS.map(m => (
              <button
                key={m}
                onClick={() => {
                  setSelectedMonth(m);
                  setSelectedDate('');
                }}
                className={`px-4 py-1.5 rounded-full text-xs font-black whitespace-nowrap transition-all border-2 ${
                  selectedMonth === m 
                    ? 'bg-red-600 border-red-600 text-white shadow-lg shadow-red-100' 
                    : 'bg-white border-slate-200 text-slate-500 hover:border-red-300 hover:text-red-600'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isFiltered && (
          <div className="mb-8 flex items-center justify-between bg-red-50 border border-red-100 p-4 rounded-3xl">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
              </div>
              <span className="text-sm font-bold text-red-900">
                筛选出 <span className="text-lg">{filteredEvents.length}</span> 场赛事
              </span>
            </div>
            <button 
              onClick={resetFilters}
              className="text-xs font-black text-red-600 hover:text-red-800 flex items-center gap-1 bg-white px-4 py-2 rounded-xl border border-red-200 shadow-sm transition-all"
            >
              重置筛选
            </button>
          </div>
        )}

        {grouped.length > 0 ? (
          <div className="space-y-16">
            {grouped.map((group) => {
              const isFuzzyDate = !group.date.includes('日') && group.date !== '待定';
              
              return (
                <section key={group.date} className="relative">
                  <div className="flex items-center gap-4 mb-8 sticky top-[180px] lg:top-[140px] bg-slate-50/95 py-4 z-40 backdrop-blur-sm">
                    <div className={`px-5 py-2 rounded-2xl shadow-xl flex items-center gap-3 transition-colors ${
                      isFuzzyDate ? 'bg-amber-500 shadow-amber-100' : 
                      group.date === '待定' ? 'bg-slate-400 shadow-slate-100' :
                      'bg-red-600 shadow-red-100'
                    }`}>
                      <span className="text-white text-xl font-black tracking-tighter">
                        {group.date}
                      </span>
                      {isFuzzyDate && (
                        <span className="bg-white/20 text-white text-[10px] px-2 py-0.5 rounded-lg font-bold">日期待定</span>
                      )}
                    </div>
                    <div className="h-px bg-slate-200 grow"></div>
                    <div className="bg-white px-4 py-2 rounded-2xl border border-slate-200 shadow-sm">
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        {group.events.length} 场
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {group.events.map((event) => (
                      <EventCard key={event.id} event={event} />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 text-center bg-white rounded-[40px] border-4 border-dashed border-slate-100">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-8">
              <svg className="w-12 h-12 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-black text-slate-900">该条件下未找到比赛</h3>
            <p className="text-slate-500 mt-3 max-w-sm font-medium">您可以尝试切换月份、重置级别筛选或清空搜索词。</p>
            <button 
              onClick={resetFilters}
              className="mt-10 px-8 py-3.5 bg-red-600 text-white font-black rounded-2xl shadow-2xl shadow-red-200 hover:bg-red-700 transition-all hover:scale-105 active:scale-95"
            >
              查看全部赛事
            </button>
          </div>
        )}
      </main>

      {/* Floating Action Button */}
      <button 
        onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}
        className="fixed bottom-8 right-8 w-14 h-14 bg-white text-slate-900 border border-slate-200 rounded-full shadow-2xl flex items-center justify-center hover:bg-red-600 hover:text-white transition-all hover:scale-110 active:scale-90 z-50 shadow-red-200/50"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      </button>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-20 mt-20">
        <div className="max-w-7xl mx-auto px-4 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center mb-8 shadow-2xl shadow-red-900/40">
            <svg className="w-9 h-9 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h2 className="text-3xl font-black tracking-tight mb-4">中国马拉松赛事官方历</h2>
          <p className="text-slate-400 text-sm max-w-2xl leading-relaxed font-medium">
            数据严格同步自中国田径协会发布的《2026年全国马拉松赛事目录》。<br/>
            旨在为全国跑友提供便捷、准确的参赛信息查询服务。
          </p>
          <div className="mt-16 pt-10 border-t border-slate-800 w-full flex flex-col sm:flex-row items-center justify-between gap-6 text-slate-500 text-xs font-bold uppercase tracking-widest">
            <p>© 2026 MARATHON CALENDAR. 全国 492 场赛事</p>
            <div className="flex gap-8">
                <span className="hover:text-red-500 transition-colors cursor-default">实时更新</span>
                <span className="hover:text-red-500 transition-colors cursor-default">官方认证</span>
                <span className="hover:text-red-500 transition-colors cursor-default">中国田协</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
