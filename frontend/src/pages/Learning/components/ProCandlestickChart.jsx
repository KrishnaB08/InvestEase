import React, { useEffect, useRef } from 'react';
import { createChart, CandlestickSeries, createSeriesMarkers } from 'lightweight-charts';

const ProCandlestickChart = ({ data, markers = [] }) => {
  const chartContainerRef = useRef();

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const container = chartContainerRef.current;
    let chart;
    
    try {
      // Ensure container is empty to avoid duplicate charts
      container.innerHTML = '';
      
      const initialWidth = container.clientWidth || 300;
      if (initialWidth === 0) return; // Still not ready

      chart = createChart(container, {
        layout: {
          background: { color: 'transparent' },
          textColor: '#94a3b8',
        },
        grid: {
          vertLines: { color: 'rgba(255, 255, 255, 0.02)' },
          horzLines: { color: 'rgba(255, 255, 255, 0.02)' },
        },
        crosshair: {
          mode: 0,
          vertLine: { color: '#3b82f6', labelBackgroundColor: '#3b82f6' },
          horzLine: { color: '#3b82f6', labelBackgroundColor: '#3b82f6' },
        },
        rightPriceScale: {
          borderColor: 'rgba(255, 255, 255, 0.05)',
        },
        timeScale: {
          borderColor: 'rgba(255, 255, 255, 0.05)',
        },
        width: initialWidth,
        height: 400,
      });

      const candlestickSeries = chart.addSeries(CandlestickSeries, {
        upColor: '#10b981',
        downColor: '#f43f5e',
        borderVisible: false,
        wickUpColor: '#10b981',
        wickDownColor: '#f43f5e',
      });

      if (data && data.length > 0) {
        candlestickSeries.setData(data);
      }
      
      const markersPlugin = createSeriesMarkers(candlestickSeries);
      if (markers && markers.length > 0) {
        markersPlugin.setMarkers(markers);
      }

      const handleResize = () => {
        if (chart && container) {
          chart.applyOptions({ width: container.clientWidth });
        }
      };

      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        if (chart) {
          chart.remove();
        }
      };
    } catch (error) {
      console.error("Chart Initialization Error:", error);
    }
  }, [data, markers]);

  return (
    <div className="w-full glass-card p-4 overflow-hidden">
      <div ref={chartContainerRef} className="w-full" />
      <div className="flex justify-between items-center mt-4 px-2">
        <div className="flex gap-4">
           <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#10b981]"></span><span className="text-[10px] font-bold text-slate-500 uppercase">Bullish</span></div>
           <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#f43f5e]"></span><span className="text-[10px] font-bold text-slate-500 uppercase">Bearish</span></div>
        </div>
        <div className="text-[10px] text-slate-600 font-mono">POWERED BY LIGHTWEIGHT CHARTS™</div>
      </div>
    </div>
  );
};

export default ProCandlestickChart;
