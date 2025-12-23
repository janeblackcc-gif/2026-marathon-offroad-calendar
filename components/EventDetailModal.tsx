
import React, { useEffect } from 'react';
import { MarathonEvent } from '../types';

interface EventDetailModalProps {
  event: MarathonEvent | null;
  onClose: () => void;
}

export const EventDetailModal: React.FC<EventDetailModalProps> = ({ event, onClose }) => {
  // Prevent scrolling when modal is open
  useEffect(() => {
    if (event) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [event]);

  if (!event) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-300" 
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative bg-white w-full max-w-2xl rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Decorative Header */}
        <div className="h-32 bg-red-600 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
                <svg className="w-48 h-48 rotate-12" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
            </div>
            <button 
                onClick={onClose}
                className="absolute top-4 right-4 w-10 h-10 bg-black/10 hover:bg-black/20 text-white rounded-full flex items-center justify-center transition-colors"
            >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
            <div className="absolute bottom-0 left-0 p-8">
                <span className="text-white/80 text-[10px] font-black uppercase tracking-[0.2em] mb-1 block">
                    {event.province} · 2026 赛事详情
                </span>
                <h2 className="text-white text-2xl font-black truncate max-w-md">
                    {event.name}
                </h2>
            </div>
        </div>

        <div className="p-8 space-y-8">
            {/* Quick Status Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">赛事级别</div>
                    <div className="text-slate-900 font-black flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${event.category === 'A' ? 'bg-red-500' : event.category === 'B' ? 'bg-blue-500' : 'bg-slate-500'}`}></span>
                        {event.category}类认证
                    </div>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">举办时间</div>
                    <div className="text-slate-900 font-black">{event.time}</div>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">项目类型</div>
                    <div className="text-slate-900 font-black">{event.eventType}</div>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">举办省份</div>
                    <div className="text-slate-900 font-black">{event.province}</div>
                </div>
            </div>

            {/* Detailed Info Section */}
            <div className="space-y-6">
                <section>
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                        <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        主办/承办单位
                    </h3>
                    <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                        <p className="text-slate-700 font-bold leading-relaxed">
                            {event.organizer}
                        </p>
                    </div>
                </section>

                <section>
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                        <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        官方说明
                    </h3>
                    <div className="space-y-4">
                        <div className="flex gap-4">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 shrink-0"></div>
                            <p className="text-sm text-slate-600 font-medium">
                                该赛事属于 <strong className="text-slate-900">{event.category}类赛事</strong>。{event.category === 'A' ? '赛事由中国田径协会共同主办或认证，其竞赛组织、赛道测量、裁判员选派和兴奋剂检查均符合田协标准，成绩可计入官方排名。' : '该赛事为地方性质赛事，旨在推广全民健身和城市文化，具有较高的参与价值。'}
                            </p>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 shrink-0"></div>
                            <p className="text-sm text-slate-600 font-medium">
                                赛事涵盖 <strong className="text-slate-900">{event.eventType}</strong> 项目。预计报名人数规模在 5,000 至 30,000 人之间。
                            </p>
                        </div>
                    </div>
                </section>
            </div>

            {/* Action Buttons */}
            <div className="pt-6 flex flex-col sm:flex-row gap-4">
                <button className="flex-1 bg-red-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-red-100 hover:bg-red-700 transition-all hover:scale-[1.02] active:scale-[0.98]">
                    关注报名信息
                </button>
                <button className="flex-1 bg-slate-100 text-slate-900 font-black py-4 rounded-2xl hover:bg-slate-200 transition-all" onClick={onClose}>
                    返回赛事列表
                </button>
            </div>

            <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-widest">
                信息来源于中国田径协会官方公示目录 · 2026
            </p>
        </div>
      </div>
    </div>
  );
};
