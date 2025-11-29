import React from 'react';
import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend
} from 'recharts';
import { GraphType, SimulationData, UnitType } from '../types';

interface ChartsProps {
  data: SimulationData[];
  graphType: GraphType;
  unitType: UnitType;
  breakEvenQ: number;
  breakEvenV: number;
  currentVolumeQ: number;
  currentVolumeV: number;
  currencyFormatter: (value: number) => string;
}

export const CvpChart: React.FC<ChartsProps> = ({
  data,
  graphType,
  unitType,
  breakEvenQ,
  breakEvenV,
  currentVolumeQ,
  currentVolumeV,
  currencyFormatter
}) => {
  const isMonetary = unitType === UnitType.MONETARY;
  const breakEvenX = isMonetary ? breakEvenV : breakEvenQ;
  const currentX = isMonetary ? currentVolumeV : currentVolumeQ;
  const xAxisKey = isMonetary ? 'v' : 'q';
  const xAxisLabel = isMonetary ? 'Volumen de Ventas ($)' : 'Unidades (Q)';

  const isConventional = graphType === GraphType.CONVENTIONAL;
  const isVolumeResults = graphType === GraphType.VOLUME_RESULTS;

  const getTitle = () => {
    switch (graphType) {
      case GraphType.CONVENTIONAL: return "Gráfico Convencional (Ingresos vs Costos)";
      case GraphType.VOLUME_RESULTS: return "Gráfico Volumen - Resultados (Ro)";
      default: return "Gráfico Volumen - Costos (Triangular)";
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataItem = payload[0].payload as SimulationData;
      return (
        <div className="bg-white/95 backdrop-blur-sm p-4 border border-gray-200 shadow-xl rounded-xl text-sm z-50 min-w-[240px]">
          <p className="font-bold mb-3 border-b border-gray-100 pb-2 text-gray-800">
            {isMonetary ? `Ventas: ${currencyFormatter(label)}` : `Ventas: ${currencyFormatter(dataItem.v)}`}
          </p>
          
          <div className="space-y-2">
            {isConventional ? (
              <>
                <div className="flex items-center justify-between gap-4 text-gray-600">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                    <span className="font-medium">Ingresos Totales (IT):</span>
                  </div>
                  <span className="font-semibold tabular-nums">{currencyFormatter(dataItem.totalRevenue)}</span>
                </div>
                <div className="flex items-center justify-between gap-4 text-gray-600">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-600"></span>
                    <span className="font-medium">Costos Totales (CT):</span>
                  </div>
                  <span className="font-semibold tabular-nums">{currencyFormatter(dataItem.totalCost)}</span>
                </div>
                 {/* Fixed Costs (Common) */}
                <div className="flex items-center justify-between gap-4 text-gray-600">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-gray-400"></span>
                    <span className="font-medium">Costos Fijos (CF):</span>
                  </div>
                  <span className="font-semibold tabular-nums">{currencyFormatter(dataItem.fixedCost)}</span>
                </div>
                 {/* Variable Costs (Common) */}
                 <div className="flex items-center justify-between gap-4 text-gray-600">
                   <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-gray-500"></span>
                    <span className="font-medium">Costos Variables (Cv):</span>
                  </div>
                  <span className="font-semibold tabular-nums">{currencyFormatter(dataItem.variableCost)}</span>
                </div>
              </>
            ) : isVolumeResults ? (
               // Volume Results Tooltip
               <>
                 <div className="flex items-center justify-between gap-4 text-gray-600">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-black"></span>
                      <span className="font-medium">Resultado Operativo (Ro):</span>
                    </div>
                    <span className={`font-semibold tabular-nums ${dataItem.operatingResult >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {currencyFormatter(dataItem.operatingResult)}
                    </span>
                  </div>
               </>
            ) : (
              // Contribution Tooltip
              <>
                 <div className="flex items-center justify-between gap-4 text-gray-600">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-green-600"></span>
                      <span className="font-medium">Margen Contrib. (MC):</span>
                    </div>
                    <span className="font-semibold tabular-nums">{currencyFormatter(dataItem.totalContributionMargin)}</span>
                  </div>
                   {/* Fixed Costs (Common) */}
                <div className="flex items-center justify-between gap-4 text-gray-600">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-gray-400"></span>
                    <span className="font-medium">Costos Fijos (CF):</span>
                  </div>
                  <span className="font-semibold tabular-nums">{currencyFormatter(dataItem.fixedCost)}</span>
                </div>
                 {/* Variable Costs (Common) */}
                 <div className="flex items-center justify-between gap-4 text-gray-600">
                   <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-600"></span>
                    <span className="font-medium">Costos Variables (Cv):</span>
                  </div>
                  <span className="font-semibold tabular-nums">{currencyFormatter(dataItem.variableCost)}</span>
                </div>
              </>
            )}

          </div>

          {!isVolumeResults && (
            <div className="mt-3 pt-3 border-t border-dashed border-gray-200">
               <div className="flex items-center justify-between gap-4">
                  <span className="text-gray-500 font-medium">Resultado (Ro):</span>
                  <span className={`font-bold text-base tabular-nums ${dataItem.operatingResult >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {currencyFormatter(dataItem.operatingResult)}
                  </span>
               </div>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-[600px] bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
        {getTitle()}
      </h3>
      
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey={xAxisKey} 
            type="number" 
            domain={['dataMin', 'dataMax']}
            label={{ value: xAxisLabel, position: 'insideBottom', offset: -10 }}
            tickFormatter={(val) => isMonetary ? `$${Math.round(val/1000)}k` : val}
            tick={{ dy: 5 }} 
          />
          <YAxis 
            width={60}
            allowDecimals={false}
            tickFormatter={(val) => {
              if (val === 0) return '$0';
              return `$${Math.round(val/1000)}k`; // Can be negative
            }}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#9ca3af', strokeWidth: 1, strokeDasharray: '4 4' }} />
          <Legend wrapperStyle={{ paddingTop: '30px', paddingBottom: '10px' }} verticalAlign="bottom" height={70}/>

          {/* Reference Lines */}
          <ReferenceLine y={0} stroke="#9ca3af" strokeWidth={1} />
          
          <ReferenceLine 
            x={breakEvenX} 
            stroke="#6b7280" 
            strokeDasharray="5 5" 
            label={{ value: "Nivelación", position: 'top', fill: '#4b5563', fontSize: 12 }} 
          />
          <ReferenceLine 
            x={currentX} 
            stroke="#3b82f6" 
            strokeWidth={2}
            label={{ value: "Actual", position: 'insideTopRight', fill: '#3b82f6', fontSize: 12 }} 
          />

          {isVolumeResults ? (
            // --- VOLUME - RESULTS GRAPH LINES ---
            <>
               {/* Loss Zone Area (Light Red) - for Ro < 0 */}
               <Area 
                 type="monotone"
                 dataKey="roLoss" 
                 stroke="none" 
                 fill="#f87171" 
                 fillOpacity={0.5} 
                 legendType="none" 
                 tooltipType="none"
                 isAnimationActive={false}
               />
               
               {/* Profit Zone Area (Light Yellow) - for Ro > 0 */}
               <Area 
                 type="monotone"
                 dataKey="roProfit" 
                 stroke="none" 
                 fill="#facc15" 
                 fillOpacity={0.4}
                 legendType="none" 
                 tooltipType="none"
                 isAnimationActive={false}
               />

               {/* Main Operating Result Line */}
               <Line 
                type="monotone" 
                dataKey="operatingResult" 
                stroke="#000000" // Black
                name="Resultado Operativo (Ro)" 
                dot={false} 
                strokeWidth={2}
                isAnimationActive={false}
              />
            </>
          ) : isConventional ? (
            // --- CONVENTIONAL GRAPH LINES ---
            <>
               {/* Loss Zone Area (Red) */}
               <Area 
                 dataKey="lossRange" 
                 stroke="none" 
                 fill="#fecaca" 
                 fillOpacity={0.4} 
                 legendType="none" 
                 tooltipType="none"
                 isAnimationActive={false}
               />
               
               {/* Profit Zone Area (Yellow) */}
               <Area 
                 dataKey="profitRange" 
                 stroke="none" 
                 fill="#fef08a" 
                 fillOpacity={0.6}
                 legendType="none" 
                 tooltipType="none"
                 isAnimationActive={false}
               />

               {/* Total Revenue (IT) */}
               <Line 
                type="monotone" 
                dataKey="totalRevenue" 
                stroke="#2563eb" // Blue
                name="Ingresos Totales (IT)" 
                dot={false} 
                strokeWidth={3}
                isAnimationActive={false}
              />

              {/* Total Cost (CT) */}
              <Line 
                type="monotone" 
                dataKey="totalCost" 
                stroke="#dc2626" // Red
                name="Costos Totales (CT)" 
                dot={false} 
                strokeWidth={3}
                isAnimationActive={false}
              />
              
              {/* Variable Cost (Cv) - purely for reference starting from 0 */}
              <Line 
                type="monotone" 
                dataKey="variableCost" 
                stroke="#9ca3af" 
                name="Costos Variables (Cv)" 
                dot={false} 
                strokeWidth={2}
                strokeDasharray="3 3"
                isAnimationActive={false}
              />

               {/* Fixed Cost (CF) - Horizontal Reference */}
               <Line 
                type="monotone" 
                dataKey="fixedCost" 
                stroke="#4b5563" 
                name="Costos Fijos (CF)" 
                dot={false} 
                strokeWidth={1}
                strokeDasharray="5 5"
                isAnimationActive={false}
              />
            </>
          ) : (
            // --- TRIANGULAR GRAPH LINES ---
            <>
              {/* Fixed Cost Line (Horizontal) */}
              <Line 
                type="monotone" 
                dataKey="fixedCost" 
                stroke="#ef4444" 
                name="Costos Fijos (CF)" 
                dot={false} 
                strokeWidth={2}
                isAnimationActive={false}
              />

              {/* Total Contribution Margin Line (Going Up) */}
              <Line 
                type="monotone" 
                dataKey="totalContributionMargin" 
                stroke="#16a34a" 
                name="Margen Contrib. (MC)" 
                dot={false} 
                strokeWidth={3}
                isAnimationActive={false}
              />
              <Area
                type="monotone"
                dataKey="totalContributionMargin"
                fill="#dcfce7"
                fillOpacity={0.3}
                stroke="none"
                legendType="none"
                tooltipType="none"
              />

              {/* Variable Cost Line (Going Down) */}
              <Line 
                type="monotone" 
                dataKey="negativeVariableCost" 
                stroke="#6b7280" 
                name="Costos Variables (Cv)" 
                dot={false} 
                strokeWidth={2}
                strokeDasharray="5 5"
                isAnimationActive={false}
              />
              <Area
                type="monotone"
                dataKey="negativeVariableCost"
                fill="#f3f4f6"
                fillOpacity={0.5}
                stroke="none"
                legendType="none"
                tooltipType="none"
              />
            </>
          )}

        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}