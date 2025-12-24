
import React, { useMemo, useState, useEffect } from 'react';
import { geoMercator, geoPath } from 'd3-geo';
import { ALL_EVENTS } from '../constants';
import { EventKind } from '../types';

interface ProvinceHeatmapProps {
  eventType: EventKind;
  selectedProvince: string | null;
  onSelectProvince: (province: string | null) => void;
}

interface GeoFeature {
  type: 'Feature';
  properties: { name: string };
  geometry: any;
}

interface GeoJSON {
  type: 'FeatureCollection';
  features: GeoFeature[];
}

const PROVINCE_COORDINATES = [
  { name: '黑龙江', lon: 126.6433, lat: 45.7567 },
  { name: '吉林', lon: 125.3245, lat: 43.8868 },
  { name: '辽宁', lon: 123.4291, lat: 41.8057 },
  { name: '内蒙古', lon: 111.6708, lat: 40.8183 },
  { name: '北京', lon: 116.4074, lat: 39.9042 },
  { name: '天津', lon: 117.2008, lat: 39.0842 },
  { name: '河北', lon: 114.5024, lat: 38.0457 },
  { name: '山东', lon: 117.0208, lat: 36.6683 },
  { name: '江苏', lon: 118.7969, lat: 32.0603 },
  { name: '上海', lon: 121.4737, lat: 31.2304 },
  { name: '浙江', lon: 120.1536, lat: 30.2875 },
  { name: '福建', lon: 119.2965, lat: 26.1004 },
  { name: '广东', lon: 113.2644, lat: 23.1291 },
  { name: '海南', lon: 110.3312, lat: 20.0311 },
  { name: '广西', lon: 108.3661, lat: 22.8172 },
  { name: '云南', lon: 102.7103, lat: 25.0406 },
  { name: '贵州', lon: 106.7073, lat: 26.5981 },
  { name: '四川', lon: 104.0665, lat: 30.5723 },
  { name: '重庆', lon: 106.5516, lat: 29.5630 },
  { name: '湖南', lon: 112.9388, lat: 28.2282 },
  { name: '湖北', lon: 114.3055, lat: 30.5931 },
  { name: '江西', lon: 115.8581, lat: 28.6832 },
  { name: '安徽', lon: 117.2272, lat: 31.8206 },
  { name: '河南', lon: 113.6254, lat: 34.7466 },
  { name: '山西', lon: 112.5489, lat: 37.8570 },
  { name: '陕西', lon: 108.9540, lat: 34.2656 },
  { name: '宁夏', lon: 106.2586, lat: 38.4681 },
  { name: '甘肃', lon: 103.8236, lat: 36.0581 },
  { name: '青海', lon: 101.7782, lat: 36.6171 },
  { name: '新疆', lon: 87.6278, lat: 43.7928 },
  { name: '西藏', lon: 91.1174, lat: 29.6470 }
];

let cachedGeoData: GeoJSON | null = null;

export const ProvinceHeatmap: React.FC<ProvinceHeatmapProps> = ({
  eventType,
  selectedProvince,
  onSelectProvince
}) => {
  const [geoData, setGeoData] = useState<GeoJSON | null>(cachedGeoData);
  const isTrail = eventType === 'trail';

  useEffect(() => {
    if (cachedGeoData) return;

    fetch('/2026-marathon-offroad-calendar/china.json')
      .then(res => {
        if (!res.ok) throw new Error('Network response failed');
        return res.json();
      })
      .then(data => {
        cachedGeoData = data;
        setGeoData(data);
      })
      .catch(() => setGeoData(null));
  }, []);

  const provinceCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    ALL_EVENTS.filter(event => event.kind === eventType).forEach(event => {
      const province = event.province === '新疆兵团' ? '新疆' : event.province;
      counts[province] = (counts[province] || 0) + 1;
    });
    return counts;
  }, [eventType]);

  const projection = useMemo(() => {
    if (!geoData) return null;
    return geoMercator()
      .center([105, 38])
      .scale(835)
      .translate([500, 375]);
  }, [geoData]);

  const mapPath = useMemo(() => {
    if (!geoData || !projection) return '';
    const pathGenerator = geoPath().projection(projection);
    return geoData.features.map(f => pathGenerator(f.geometry)).join(' ');
  }, [geoData, projection]);

  const provincePositions = useMemo(() => {
    if (!projection) return [];
    return PROVINCE_COORDINATES.map(coord => {
      const [x, y] = projection([coord.lon, coord.lat]);
      return {
        name: coord.name,
        x: (x / 1000) * 100,
        y: (y / 750) * 100
      };
    });
  }, [projection]);

  const getBubbleSize = (count: number) => {
    if (count === 0) return 'w-1.5 h-1.5 sm:w-2 sm:h-2';
    if (count < 10) return 'w-2 h-2 sm:w-3 sm:h-3';
    if (count < 20) return 'w-3 h-3 sm:w-4 sm:h-4';
    if (count < 30) return 'w-4 h-4 sm:w-6 sm:h-6';
    return 'w-6 h-6 sm:w-8 sm:h-8';
  };

  const getBubbleColor = (count: number) => {
    if (count === 0) return 'bg-slate-600/60';
    if (isTrail) {
      if (count < 5) return 'bg-green-300';
      if (count < 15) return 'bg-green-400';
      return 'bg-green-500';
    }
    if (count < 10) return 'bg-orange-400/70';
    if (count < 20) return 'bg-orange-500';
    return 'bg-red-600';
  };

  const themeColor = isTrail ? 'green' : 'red';
  const primaryColor = isTrail ? 'bg-green-500' : 'bg-red-600';
  const ringColor = isTrail ? 'ring-green-300' : 'ring-red-400';
  const hoverColor = isTrail ? 'group-hover:text-green-500' : 'group-hover:text-red-600';
  const selectedBg = isTrail ? 'bg-green-500' : 'bg-red-600';
  const shadowGlow = isTrail ? 'shadow-[0_0_20px_rgba(134,239,172,0.8)]' : 'shadow-[0_0_20px_rgba(239,68,68,0.6)]';
  const legendColor = isTrail ? 'bg-green-500' : 'bg-red-600';
  const legendGlow = isTrail ? 'shadow-[0_0_15px_rgba(134,239,172,1)]' : 'shadow-[0_0_15px_rgba(220,38,38,1)]';

  return (
    <div className="relative w-full aspect-[4/3] min-h-[300px] bg-[#0f172a] overflow-hidden">
      <div className="absolute inset-0 opacity-20 pointer-events-none overflow-hidden">
        <div className={`absolute top-1/4 left-1/3 w-64 sm:w-96 h-64 sm:h-96 ${isTrail ? 'bg-green-600/30' : 'bg-red-600/30'} rounded-full blur-[80px] sm:blur-[120px]`}></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-blue-600/20 rounded-full blur-[80px] sm:blur-[120px]"></div>
      </div>

      <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20">
        <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
          <div className={`w-1 sm:w-1.5 h-4 sm:h-6 ${primaryColor} rounded-full`}></div>
          <h2 className="text-white text-sm sm:text-xl font-black">赛事分布热力图</h2>
        </div>
        <p className="text-slate-500 text-[10px] sm:text-xs font-bold">点击省份点位快速筛选</p>
      </div>

      <div className="absolute inset-0">
        {geoData && (
          <svg
            viewBox="0 0 1000 750"
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ opacity: 0.35 }}
          >
            <path
              d={mapPath}
              fill="rgba(30, 41, 59, 0.3)"
              stroke="#94a3b8"
              strokeWidth="2"
              strokeLinejoin="round"
            />
          </svg>
        )}

        {provincePositions.map((pos, idx) => {
          const count = provinceCounts[pos.name] || 0;
          const isSelected = selectedProvince === pos.name;
          const shouldShowLabel = true;

          return (
            <div
              key={pos.name}
              style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 group transition-all duration-300 ${isSelected ? 'z-30' : 'z-10'}`}
            >
              <button
                onClick={() => onSelectProvince(isSelected ? null : pos.name)}
                className={`
                  ${getBubbleSize(count)}
                  ${getBubbleColor(count)}
                  rounded-full transition-all duration-300 relative
                  ${isSelected ? `scale-125 ring-2 sm:ring-4 ${ringColor} ring-offset-2 sm:ring-offset-4 ring-offset-[#0f172a]` : `hover:scale-110 ${shadowGlow}`}
                `}
              >
                {isSelected && (
                  <div className={`absolute inset-0 ${isTrail ? 'bg-green-300' : 'bg-red-400'} rounded-full animate-ping opacity-75`}></div>
                )}
              </button>

              {shouldShowLabel && (
                <div
                  className={`
                    whitespace-nowrap px-1.5 py-0.5 rounded-md text-[8px] sm:text-[10px] font-bold transition-all shadow-sm
                    ${isSelected ? `${selectedBg} text-white translate-y-1` : 'text-slate-400 group-hover:text-white group-hover:bg-slate-800/50'}
                  `}
                >
                  {pos.name}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 bg-slate-800/90 backdrop-blur-md border border-slate-600 p-3 sm:p-4 rounded-xl sm:rounded-2xl min-w-[100px] sm:min-w-[140px] z-20">
        <div className="space-y-2 sm:space-y-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className={`w-3 h-3 sm:w-4 sm:h-4 ${legendColor} rounded-full ${legendGlow}`}></div>
            <div className="flex flex-col">
              <span className="text-[9px] sm:text-[10px] font-black text-white">密集</span>
              <span className="text-[7px] sm:text-[8px] text-slate-400">≥{isTrail ? '15' : '20'}场</span>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className={`w-2.5 h-2.5 sm:w-3 sm:h-3 ${isTrail ? 'bg-green-400' : 'bg-orange-500'} rounded-full`}></div>
            <div className="flex flex-col">
              <span className="text-[9px] sm:text-[10px] font-black text-slate-200">活跃</span>
              <span className="text-[7px] sm:text-[8px] text-slate-400">{isTrail ? '5-14' : '10-19'}场</span>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className={`w-2 h-2 sm:w-2.5 sm:h-2.5 ${isTrail ? 'bg-green-300' : 'bg-orange-400/70'} rounded-full`}></div>
            <div className="flex flex-col">
              <span className="text-[9px] sm:text-[10px] font-black text-slate-200">常规</span>
              <span className="text-[7px] sm:text-[8px] text-slate-400">&lt;{isTrail ? '5' : '10'}场</span>
            </div>
          </div>
          {PROVINCE_COORDINATES.some(coord => (provinceCounts[coord.name] ?? 0) === 0) && (
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-slate-600/60 rounded-full"></div>
              <span className="text-[9px] sm:text-[10px] font-bold text-slate-400">暂无</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
