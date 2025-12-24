
import React from 'react';
import { RaceEvent, EventCategory, isTrailEvent } from '../types';

interface EventCardProps {
  event: RaceEvent;
  onClick?: () => void;
}

const CategoryBadge: React.FC<{ category: EventCategory }> = ({ category }) => {
  const styles = {
    A: 'bg-red-50 text-red-700 border-red-200 shadow-red-50',
    B: 'bg-blue-50 text-blue-700 border-blue-200 shadow-blue-50',
    C: 'bg-slate-50 text-slate-700 border-slate-200 shadow-slate-50',
  };

  return (
    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black border shadow-sm ${styles[category]}`}>
      {category}类认证
    </span>
  );
};

export const EventCard: React.FC<EventCardProps> = ({ event, onClick }) => {
  const isFuzzyDate = !event.time.includes('日') && event.time !== '待定';
  const isTrail = isTrailEvent(event);

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-2xl hover:shadow-slate-200 hover:-translate-y-1 transition-all duration-300 flex flex-col h-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 w-full text-left ${isTrail ? 'focus:ring-green-500' : 'focus:ring-red-500'}`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex flex-col">
          <span className={`text-[10px] font-black uppercase tracking-widest mb-1 ${isTrail ? 'text-green-600' : 'text-red-600'}`}>
            {event.province}
          </span>
          <div className="flex items-center gap-2">
             <span className={`text-xs font-bold ${isFuzzyDate ? 'text-amber-500' : 'text-slate-400'}`}>
               {event.time}
             </span>
             {isFuzzyDate && (
               <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse"></span>
             )}
          </div>
        </div>
        <CategoryBadge category={event.category} />
      </div>

      <h3 className={`text-slate-900 font-black text-lg mb-6 leading-tight transition-colors line-clamp-2 min-h-[3.5rem] ${isTrail ? 'group-hover:text-green-600' : 'group-hover:text-red-600'}`}>
        {event.name}
      </h3>

      <div className="mt-auto space-y-3 pt-6 border-t border-slate-50">
        {isTrail && event.distanceOptions.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-2">
            {event.distanceOptions.slice(0, 3).map((option, idx) => (
              <span key={idx} className="px-2 py-0.5 bg-amber-50 text-amber-700 text-[10px] font-bold rounded-md border border-amber-100">
                {option.distance}
              </span>
            ))}
            {event.distanceOptions[0]?.elevationGain && (
              <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-md">
                ↑{event.distanceOptions[0].elevationGain}
              </span>
            )}
            {event.distanceOptions[0]?.itraPoints && (
              <span className="px-2 py-0.5 bg-green-50 text-green-700 text-[10px] font-bold rounded-md border border-green-100">
                ITRA {event.distanceOptions[0].itraPoints}
              </span>
            )}
          </div>
        )}
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 transition-colors ${isTrail ? 'group-hover:bg-green-50 group-hover:text-green-500' : 'group-hover:bg-red-50 group-hover:text-red-500'}`}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <span className="text-xs font-bold text-slate-600">{event.eventType}</span>
        </div>
        <div className="flex items-start gap-3">
          <div className={`w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 mt-0.5 transition-colors shrink-0 ${isTrail ? 'group-hover:bg-green-50 group-hover:text-green-500' : 'group-hover:bg-red-50 group-hover:text-red-500'}`}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <span className="text-[11px] font-medium text-slate-500 leading-relaxed line-clamp-2">
            {event.organizer}
          </span>
        </div>
      </div>
    </button>
  );
};
