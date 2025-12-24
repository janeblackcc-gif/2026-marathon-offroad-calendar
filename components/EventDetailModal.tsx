import React, { useEffect, useState } from 'react';
import { RaceEvent, isTrailEvent } from '../types';

interface EventDetailModalProps {
  event: RaceEvent | null;
  onClose: () => void;
}

interface MapInfo {
  uri: string;
  title: string;
  description: string;
}

export const EventDetailModal: React.FC<EventDetailModalProps> = ({ event, onClose }) => {
  const [mapInfo, setMapInfo] = useState<MapInfo | null>(null);
  const [loadingMap, setLoadingMap] = useState(false);

  useEffect(() => {
    if (event) {
      document.body.style.overflow = 'hidden';
      // ✅ 已禁止自动调用 API，为您省钱
      // fetchMapLocation();
    } else {
      document.body.style.overflow = 'unset';
      setMapInfo(null);
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [event]);

  // --------------- 核心修改：适配中转 API ---------------
  const fetchMapLocation = async () => {
    if (!event) return;
    setLoadingMap(true);

    try {
      const apiKey = import.meta.env.VITE_OPENAI_API_KEY || import.meta.env.VITE_GEMINI_API_KEY; 
      const baseUrl = import.meta.env.VITE_OPENAI_BASE_URL || "https://yinli.one/v1"; 
      const model = import.meta.env.VITE_OPENAI_MODEL || "gemini-1.5-flash"; 

      if (!apiKey) {
        throw new Error("API Key 未配置");
      }

      const prompt = `请查找位于${event.province}的"${event.name}"具体的比赛起点、场馆位置或起跑区域信息。并请用中文描述其典型的赛道特点或起点环境。请以JSON格式返回，包含 title (地点名称) 和 description (描述) 两个字段。`;

      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: model,
          messages: [
            { role: "user", content: prompt }
          ],
          response_format: { type: "json_object" }
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error?.message || "AI 请求失败");
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;
      
      let aiResult = { title: "", description: "" };
      try {
        aiResult = JSON.parse(content);
      } catch (e) {
        aiResult = {
            title: `${event.province} ${event.name}`,
            description: content || "已为您找到相关信息。"
        };
      }

      const amapBaseUri = "https://www.amap.com/search?query=";
      const searchKeyword = aiResult.title || `${event.province} ${event.name}`;
      const amapUri = `${amapBaseUri}${encodeURIComponent(searchKeyword)}`;

      setMapInfo({
        uri: amapUri,
        title: aiResult.title || event.name,
        description: aiResult.description || "点击可跳转高德地图查看详情。"
      });
      
    } catch (error) {
      console.error("Map fetching failed:", error);
      const amapUri = `https://www.amap.com/search?query=${encodeURIComponent(event.province + " " + event.name)}`;
      setMapInfo({
        uri: amapUri,
        title: event.name,
        description: "正在查找详细地点，您可以直接在高德地图中搜索该赛事。"
      });
    } finally {
      setLoadingMap(false);
    }
  };

  if (!event) return null;

  const isTrail = isTrailEvent(event);

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6 lg:p-8">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-300"
        onClick={onClose}
      />

      <div className="relative bg-white w-full max-w-2xl rounded-t-[32px] sm:rounded-[32px] shadow-2xl overflow-hidden animate-in slide-in-from-bottom sm:zoom-in-95 duration-300 flex flex-col h-[92vh] sm:max-h-[90vh]">
        <div className={`h-28 sm:h-32 relative overflow-hidden shrink-0 ${isTrail ? 'bg-green-600' : 'bg-red-600'}`}>
            <div className="absolute top-0 right-0 p-6 sm:p-8 opacity-10">
                <svg className="w-32 h-32 sm:w-48 sm:h-48 rotate-12" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
            </div>
            <button 
                onClick={onClose}
                className="absolute top-3 right-3 sm:top-4 sm:right-4 w-9 h-9 sm:w-10 sm:h-10 bg-black/10 hover:bg-black/20 text-white rounded-full flex items-center justify-center transition-colors z-10"
            >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
            <div className="absolute bottom-0 left-0 p-6 sm:p-8">
                <span className="text-white/80 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] mb-1 block">
                    {event.province} · 2026 赛事详情
                </span>
                <h2 className="text-white text-xl sm:text-2xl font-black truncate max-w-[280px] sm:max-w-md">
                    {event.name}
                </h2>
            </div>
        </div>

        <div className="p-6 sm:p-8 space-y-6 sm:space-y-8 overflow-y-auto no-scrollbar">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="bg-slate-50 p-3 sm:p-4 rounded-2xl border border-slate-100">
                    <div className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">赛事级别</div>
                    <div className="text-slate-900 text-xs sm:text-sm font-black flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${event.category === 'A' ? isTrail ? 'bg-green-500' : 'bg-red-500' : event.category === 'B' ? 'bg-blue-500' : 'bg-slate-500'}`}></span>
                        {event.category}类认证
                    </div>
                </div>
                <div className="bg-slate-50 p-3 sm:p-4 rounded-2xl border border-slate-100">
                    <div className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">举办时间</div>
                    <div className="text-slate-900 text-xs sm:text-sm font-black">{event.time}</div>
                </div>
                <div className="bg-slate-50 p-3 sm:p-4 rounded-2xl border border-slate-100">
                    <div className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">项目类型</div>
                    <div className="text-slate-900 text-xs sm:text-sm font-black">{event.eventType}</div>
                </div>
                <div className="bg-slate-50 p-3 sm:p-4 rounded-2xl border border-slate-100">
                    <div className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">举办省份</div>
                    <div className="text-slate-900 text-xs sm:text-sm font-black">{event.province}</div>
                </div>
                {isTrail && event.distanceOptions.length > 0 && (
                  <>
                    <div className="bg-slate-50 p-3 sm:p-4 rounded-2xl border border-slate-100 col-span-2 lg:col-span-4">
                        <div className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">距离选项</div>
                        <div className="flex flex-wrap gap-2">
                          {event.distanceOptions.map((option, idx) => (
                            <div key={idx} className="bg-white border border-amber-100 rounded-lg px-3 py-2">
                              <div className="text-xs font-black text-amber-700">{option.distance}</div>
                              <div className="flex flex-wrap gap-2 mt-1 text-[10px] text-slate-600">
                                {option.elevationGain && <span>↑{option.elevationGain}</span>}
                                {option.itraPoints && <span className="text-green-600 font-bold">ITRA {option.itraPoints}</span>}
                                {option.entryFee && <span>{option.entryFee}</span>}
                              </div>
                            </div>
                          ))}
                        </div>
                    </div>
                    <div className="bg-slate-50 p-3 sm:p-4 rounded-2xl border border-slate-100">
                        <div className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">报名时间</div>
                        <div className="text-slate-900 text-xs sm:text-sm font-black">{event.registrationPeriod}</div>
                    </div>
                    <div className="bg-slate-50 p-3 sm:p-4 rounded-2xl border border-slate-100">
                        <div className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">参赛人数</div>
                        <div className="text-slate-900 text-xs sm:text-sm font-black">{event.participantLimit}</div>
                    </div>
                  </>
                )}
            </div>

            {/* ✅ 地图部分：已修改为手动触发模式 */}
            <section>
                <h3 className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-3 sm:mb-4 flex items-center gap-2">
                    <svg className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isTrail ? 'text-green-600' : 'text-red-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                    地点地图 (AI + 高德)
                </h3>
                
                {loadingMap ? (
                  <div className="bg-slate-50 rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center border border-dashed border-slate-200 animate-pulse">
                    <div className={`w-6 h-6 sm:w-8 sm:h-8 border-4 border-t-transparent rounded-full animate-spin mb-3 ${isTrail ? 'border-green-500' : 'border-red-500'}`}></div>
                    <p className="text-[10px] sm:text-xs font-bold text-slate-400 text-center">正在请求 AI 分析赛道信息...</p>
                  </div>
                ) : mapInfo ? (
                  <div className={`rounded-2xl p-4 sm:p-6 border ${isTrail ? 'bg-green-50/50 border-green-100' : 'bg-red-50/50 border-red-100'}`}>
                    <div className="flex flex-col gap-4">
                      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                        {mapInfo.description}
                      </p>
                      <a
                        href={mapInfo.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex items-center justify-between bg-white px-4 sm:px-5 py-3 sm:py-4 rounded-xl border transition-all group hover:shadow-md ${isTrail ? 'border-green-200 hover:border-green-400' : 'border-red-200 hover:border-red-400'}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center shrink-0 ${isTrail ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          </div>
                          <div className="min-w-0">
                            <p className={`text-[9px] sm:text-[10px] font-black uppercase tracking-wider ${isTrail ? 'text-green-600' : 'text-red-600'}`}>在高德地图中查看</p>
                            <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">{mapInfo.title}</p>
                          </div>
                        </div>
                        <svg className={`w-4 h-4 sm:w-5 sm:h-5 text-slate-400 transform group-hover:translate-x-1 transition-all ${isTrail ? 'group-hover:text-green-600' : 'group-hover:text-red-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </a>
                    </div>
                  </div>
                ) : (
                  /* ✅ 这里就是你要的按钮 */
                  <div className="bg-slate-50 rounded-2xl p-6 sm:p-8 border border-slate-100 flex flex-col items-center gap-3">
                    <p className="text-xs sm:text-sm text-slate-500 font-bold">需要查看赛道起跑点和周边信息吗？</p>
                    <button 
                        onClick={fetchMapLocation}
                        className={`px-5 py-2.5 rounded-xl text-white font-black text-xs sm:text-sm shadow-lg active:scale-95 transition-all flex items-center gap-2 ${isTrail ? 'bg-green-500 shadow-green-200 hover:bg-green-600' : 'bg-red-500 shadow-red-200 hover:bg-red-600'}`}
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                        </svg>
                        AI 智能分析赛道 (点击生成)
                    </button>
                  </div>
                )}
            </section>

            <div className="space-y-6">
                <section>
                    <h3 className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-3 sm:mb-4 flex items-center gap-2">
                        <svg className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isTrail ? 'text-green-500' : 'text-red-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        主办/承办单位
                    </h3>
                    <div className="bg-slate-50 rounded-2xl p-4 sm:p-6 border border-slate-100">
                        <p className="text-xs sm:text-sm text-slate-700 font-bold leading-relaxed">
                            {event.organizer}
                        </p>
                    </div>
                </section>

                <section>
                    <h3 className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-3 sm:mb-4 flex items-center gap-2">
                        <svg className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isTrail ? 'text-green-500' : 'text-red-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        官方说明
                    </h3>
                    <div className="space-y-4">
                        <div className="flex gap-3 sm:gap-4">
                            <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${isTrail ? 'bg-green-500' : 'bg-red-500'}`}></div>
                            <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                                该赛事属于 <strong className="text-slate-900 font-bold">{event.category}类赛事</strong>。{event.category === 'A' ? isTrail ? '赛事具有高水准的组织和竞赛标准，成绩可用于国际积分认证。' : '赛事由中国田径协会共同主办或认证，其竞赛组织、赛道测量、裁判员选派和兴奋剂检查均符合田协标准，成绩可计入官方排名。' : '该赛事为地方性质赛事，具有较高的参与价值。'}
                            </p>
                        </div>
                    </div>
                </section>
            </div>

            <div className="pt-4 sm:pt-6 flex flex-col sm:flex-row gap-3 sm:gap-4 shrink-0 pb-6">
                <button className={`flex-1 text-white font-black py-4 sm:py-4 rounded-2xl shadow-xl transition-all active:scale-[0.98] ${isTrail ? 'bg-green-600 shadow-green-100 hover:bg-green-700' : 'bg-red-600 shadow-red-100 hover:bg-red-700'}`}>
                    关注报名信息
                </button>
                <button className="flex-1 bg-slate-100 text-slate-900 font-black py-4 sm:py-4 rounded-2xl hover:bg-slate-200 transition-all" onClick={onClose}>
                    返回赛事列表
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};