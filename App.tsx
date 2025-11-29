import React, { useState, useMemo } from 'react';
import { 
  Activity, 
  Settings2,
  Lightbulb,
  Package,
  DollarSign,
  TrendingUp,
  BarChart2,
  LineChart,
  Scale,
  Shield,
  Banknote
} from 'lucide-react';
import { UnitType, GraphType, SimulationData, AnalysisMetrics } from './types';
import { InfoCard } from './components/InfoCard';
import { CvpChart } from './components/Charts';

function App() {
  // --- State ---
  const [fixedCost, setFixedCost] = useState<number>(80000);
  const [pricePerUnit, setPricePerUnit] = useState<number>(250);
  const [variableCostPerUnit, setVariableCostPerUnit] = useState<number>(90);
  const [targetVolume, setTargetVolume] = useState<number>(620); // User's estimated sales set to 620 to match screenshot
  
  const [unitType, setUnitType] = useState<UnitType>(UnitType.PHYSICAL);
  const [graphType, setGraphType] = useState<GraphType>(GraphType.CONTRIBUTION);

  // --- Calculations ---
  const metrics: AnalysisMetrics = useMemo(() => {
    const mc = pricePerUnit - variableCostPerUnit; // Contribution margin unit
    const rc = pricePerUnit !== 0 ? mc / pricePerUnit : 0; // Contribution margin ratio

    // Avoid division by zero or negative margin for break-even
    const validMargin = mc > 0;
    
    const breakEvenQ = validMargin ? fixedCost / mc : 0;
    const breakEvenV = breakEvenQ * pricePerUnit;

    const safetyMarginQ = targetVolume - breakEvenQ;
    const safetyMarginV = safetyMarginQ * pricePerUnit;
    const safetyMarginPercent = targetVolume > 0 ? (safetyMarginQ / targetVolume) * 100 : (safetyMarginQ < 0 ? -100 : 0);

    return {
      breakEvenQ,
      breakEvenV,
      safetyMarginQ,
      safetyMarginV,
      safetyMarginPercent,
      contributionMarginUnit: mc,
      contributionMarginRatio: rc
    };
  }, [fixedCost, pricePerUnit, variableCostPerUnit, targetVolume]);

  const chartData: SimulationData[] = useMemo(() => {
    if (metrics.contributionMarginUnit <= 0) return [];

    // Determine range for graph (go up to 2x Break-even or 1.5x target, whichever is larger reasonable)
    const maxQ = Math.max(metrics.breakEvenQ * 2, targetVolume * 1.5, 100); 
    const points = 50;
    const step = maxQ / points;
    
    const data: SimulationData[] = [];
    for (let i = 0; i <= points; i++) {
      const q = Math.round(i * step);
      const v = q * pricePerUnit;
      const cvTotal = q * variableCostPerUnit;
      const ct = fixedCost + cvTotal;
      const it = v; // Total Revenue
      const mcTotal = q * metrics.contributionMarginUnit;
      const ro = it - ct; // Operating Result

      // Ranges for filled areas in Conventional Graph
      // Loss: When CT > IT. Range is [IT, CT]. 
      // We use [it, it] when not in loss so it flattens out invisibly.
      const lossRange: [number, number] = ct > it ? [it, ct] : [it, it];
      
      // Profit: When IT > CT. Range is [CT, IT].
      // We use [ct, ct] when not in profit so it flattens out invisibly.
      const profitRange: [number, number] = it > ct ? [ct, it] : [ct, ct];

      // Data for Volume-Results Graph
      // Split Ro into positive and negative for area coloring
      const roProfit = ro > 0 ? ro : 0;
      const roLoss = ro < 0 ? ro : 0;

      data.push({
        q,
        v,
        totalRevenue: it,
        totalCost: ct,
        fixedCost: fixedCost,
        variableCost: cvTotal,
        negativeVariableCost: -cvTotal, // Negative for downward plotting
        totalContributionMargin: mcTotal,
        operatingResult: ro,
        lossRange,
        profitRange,
        roProfit,
        roLoss
      });
    }
    return data;
  }, [metrics, fixedCost, pricePerUnit, variableCostPerUnit, targetVolume]);

  // --- Formatters ---
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(val);
  };
  
  const formatNumber = (val: number) => {
    return new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 }).format(val);
  };

  const formatPercent = (val: number) => {
    return new Intl.NumberFormat('es-AR', { style: 'percent', minimumFractionDigits: 2 }).format(val);
  };

  const formatSimplePercent = (val: number) => {
    return new Intl.NumberFormat('es-AR', { style: 'percent', maximumFractionDigits: 0 }).format(val);
  };

  // --- Handlers ---
  const handleInputChange = (setter: React.Dispatch<React.SetStateAction<number>>, value: string) => {
    const num = parseFloat(value);
    if (!isNaN(num) && num >= 0) setter(num);
  };

  // --- Rapid Analysis Logic ---
  const renderRapidAnalysis = () => {
    if (metrics.breakEvenQ === 0) return null;
    
    // Calculate percentage difference relative to Break Even point
    const percentDiff = (targetVolume - metrics.breakEvenQ) / metrics.breakEvenQ;
    const isProfit = percentDiff > 0;
    const isBreakeven = Math.abs(percentDiff) < 0.001; // Epsilon for float comparison

    return (
      <div className="bg-sky-50 p-5 rounded-xl border border-sky-100 shadow-sm">
        <div className="flex items-center gap-2 mb-3 text-blue-900">
          <Lightbulb className="h-5 w-5" />
          <h3 className="font-bold text-lg">Análisis Rápido</h3>
        </div>
        <p className="text-blue-800 text-sm leading-relaxed">
          {isProfit ? (
            <>
              ¡Excelente! Estás en <span className="font-bold text-green-600">zona de ganancias</span>. 
              Tus ventas actuales superan el punto de equilibrio en un <span className="font-bold text-blue-900">{formatSimplePercent(percentDiff)}</span>.
            </>
          ) : isBreakeven ? (
            <>
              Estás exactamente en el <span className="font-bold text-gray-700">punto de equilibrio</span>. 
              Tus ingresos cubren exactamente tus costos.
            </>
          ) : (
            <>
              Atención. Estás en <span className="font-bold text-red-600">zona de pérdidas</span>. 
              Tus ventas están por debajo del punto de equilibrio en un <span className="font-bold text-red-900">{formatSimplePercent(Math.abs(percentDiff))}</span>.
            </>
          )}
        </p>
      </div>
    );
  };

  const renderExplanation = () => {
    if (graphType === GraphType.CONTRIBUTION) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center gap-2 mb-3">
                    <Package className="h-5 w-5 text-gray-500" />
                    <h3 className="font-semibold text-gray-800">Interpretación Gráfico Triangular</h3>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                    El gráfico muestra la estructura de <strong>Costos y Margen</strong>. 
                    La recta de <strong>Margen de Contribución (MC)</strong> parte del origen y sube. 
                    La recta de <strong>Costos Fijos (CF)</strong> es horizontal. 
                    Donde MC corta a CF es el <strong>Punto de Nivelación</strong>. 
                    A la derecha de este punto, el área sobre CF representa las <strong>Ganancias (Ro)</strong>.
                </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center gap-2 mb-3">
                    <DollarSign className="h-5 w-5 text-gray-500" />
                    <h3 className="font-semibold text-gray-800">Costos Variables</h3>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  La línea descendente (hacia abajo) representa los <strong>Costos Variables Totales</strong> acumulados.
                  Esto permite visualizar cómo la estructura de costos variables crece proporcionalmente al volumen en sentido opuesto al margen.
                </p>
            </div>
        </div>
      );
    } 
    
    if (graphType === GraphType.CONVENTIONAL) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center gap-2 mb-3">
                    <BarChart2 className="h-5 w-5 text-gray-500" />
                    <h3 className="font-semibold text-gray-800">Interpretación Gráfico Convencional</h3>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                    Este gráfico compara <strong>Ingresos Totales (IT)</strong> vs <strong>Costos Totales (CT)</strong>.
                    La recta de <strong>CT</strong> inicia en los Costos Fijos y crece con los Costos Variables.
                    El punto de cruce es la <strong>Nivelación</strong>. 
                    El área donde IT {'>'} CT es ganancia (derecha) y donde CT {'>'} IT es pérdida (izquierda).
                </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center gap-2 mb-3">
                    <DollarSign className="h-5 w-5 text-gray-500" />
                    <h3 className="font-semibold text-gray-800">Estructura de Costos</h3>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                   Los <strong>Costos Totales (CT)</strong> son la suma geométrica de los <strong>Costos Fijos (CF)</strong> y los <strong>Costos Variables (CV)</strong>.
                   La línea de CV se muestra partiendo de cero para ilustrar la pendiente de los costos variables pura.
                </p>
            </div>
        </div>
      );
    }

    if (graphType === GraphType.VOLUME_RESULTS) {
       return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center gap-2 mb-3">
                    <LineChart className="h-5 w-5 text-gray-500" />
                    <h3 className="font-semibold text-gray-800">Interpretación Gráfico Volumen - Resultados</h3>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                    Este gráfico relaciona directamente el <strong>Resultado Operativo (Ro)</strong> con el volumen.
                    El eje Y representa la Ganancia o Pérdida.
                    La recta comienza en los <strong>-CF</strong> (pérdida máxima sin ventas) y asciende con una pendiente igual al <strong>mc unitario</strong>.
                </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="h-5 w-5 text-gray-500" />
                    <h3 className="font-semibold text-gray-800">Punto de Nivelación y Margen de Seguridad</h3>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                   El punto donde la recta cruza el eje X (Ro = 0) es la <strong>Nivelación (Qn)</strong>.
                   La zona <span className="text-orange-600 font-bold">naranja</span> a la izquierda es pérdida.
                   La zona <span className="text-yellow-500 font-bold">amarilla</span> a la derecha es ganancia.
                   La distancia desde Qn hasta el volumen actual es el <strong>Margen de Seguridad (Qs)</strong>.
                </p>
            </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-12">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-6 w-6 text-blue-600" />
            <div className="flex items-baseline gap-3">
              <h1 className="text-xl font-bold text-gray-900">Nivela App</h1>
              <span className="text-sm font-normal text-gray-500">Creada por: Facundo Piccolella</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setUnitType(UnitType.PHYSICAL)}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${
                  unitType === UnitType.PHYSICAL ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Unidades (Q)
              </button>
              <button
                onClick={() => setUnitType(UnitType.MONETARY)}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${
                  unitType === UnitType.MONETARY ? 'bg-white shadow text-green-600' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Monetario ($)
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Controls Sidebar */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Variables Card */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center gap-2 mb-4 text-gray-800">
                <Settings2 className="h-5 w-5" />
                <h2 className="font-semibold">Variables</h2>
              </div>

              <div className="space-y-4">
                {/* Fixed Costs */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Costos Fijos Totales (CF)</label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <span className="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <input
                      type="number"
                      value={fixedCost}
                      onChange={(e) => handleInputChange(setFixedCost, e.target.value)}
                      className="bg-white text-gray-900 focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-12 py-2 sm:text-sm border border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                {/* Price Per Unit */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Precio Unitario (p)</label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <span className="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <input
                      type="number"
                      value={pricePerUnit}
                      onChange={(e) => handleInputChange(setPricePerUnit, e.target.value)}
                      className="bg-white text-gray-900 focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-12 py-2 sm:text-sm border border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                {/* Variable Cost Per Unit */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Costo Variable Unitario (cv)</label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <span className="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <input
                      type="number"
                      value={variableCostPerUnit}
                      onChange={(e) => handleInputChange(setVariableCostPerUnit, e.target.value)}
                      className="bg-white text-gray-900 focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-12 py-2 sm:text-sm border border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                <hr className="my-4 border-gray-100" />

                {/* Current Volume Slider/Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Volumen Actual Estimado (Q)</label>
                  <div className="flex items-center justify-between mb-1">
                     <span className="text-xs text-gray-500">0</span>
                     <span className="text-blue-600 font-bold">{formatNumber(targetVolume)} u</span>
                     <span className="text-xs text-gray-500">Max</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={Math.max(metrics.breakEvenQ * 2, 2000)}
                    step="10"
                    value={targetVolume}
                    onChange={(e) => handleInputChange(setTargetVolume, e.target.value)}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                </div>
              </div>
            </div>

            {/* Marginal Analysis Card (Blue) */}
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 shadow-sm">
               <h3 className="text-blue-800 font-bold text-sm mb-3">Análisis Marginal</h3>
               <div className="space-y-2 mb-3">
                 <div className="flex justify-between items-center text-sm">
                    <span className="text-blue-700">mc unitario (p - cv):</span>
                    <span className="font-bold text-blue-900">{formatCurrency(metrics.contributionMarginUnit)}</span>
                 </div>
                 <div className="flex justify-between items-center text-sm">
                    <span className="text-blue-700">Razón Contrib. (rc):</span>
                    <span className="font-bold text-blue-900">{formatPercent(metrics.contributionMarginRatio)}</span>
                 </div>
               </div>
               <p className="text-xs text-blue-600 italic">
                 La pendiente de la función MC está determinada por el mc unitario.
               </p>
            </div>

            {/* Rapid Analysis Card (New) */}
            {renderRapidAnalysis()}

          </div>

          {/* Main Content */}
          <div className="lg:col-span-9 space-y-8">
            
             {/* Chart Type Selector Tabs */}
             <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit overflow-x-auto">
                <button
                  onClick={() => setGraphType(GraphType.CONTRIBUTION)}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all whitespace-nowrap ${
                    graphType === GraphType.CONTRIBUTION
                      ? 'bg-white shadow text-blue-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <TrendingUp className="h-4 w-4" />
                  Volumen - Costos (Triangular)
                </button>
                <button
                  onClick={() => setGraphType(GraphType.CONVENTIONAL)}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all whitespace-nowrap ${
                    graphType === GraphType.CONVENTIONAL
                      ? 'bg-white shadow text-blue-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <BarChart2 className="h-4 w-4" />
                  Convencional (IT vs CT)
                </button>
                <button
                  onClick={() => setGraphType(GraphType.VOLUME_RESULTS)}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all whitespace-nowrap ${
                    graphType === GraphType.VOLUME_RESULTS
                      ? 'bg-white shadow text-blue-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <LineChart className="h-4 w-4" />
                  Volumen - Resultados (Ro)
                </button>
            </div>

            {/* Chart */}
            <CvpChart 
              data={chartData}
              graphType={graphType}
              unitType={unitType}
              breakEvenQ={metrics.breakEvenQ}
              breakEvenV={metrics.breakEvenV}
              currentVolumeQ={targetVolume}
              currentVolumeV={targetVolume * pricePerUnit}
              currencyFormatter={formatCurrency}
            />

            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <InfoCard 
                title="Punto Nivelación (Qn)"
                value={formatNumber(metrics.breakEvenQ)}
                subValue={`Unidades a vender`}
                colorClass="text-gray-800"
                icon={
                  <div className="p-2 bg-orange-50 rounded-lg">
                    <Scale className="h-5 w-5 text-orange-500" />
                  </div>
                }
              />
               <InfoCard 
                title="Punto Nivelación (Vn)"
                value={formatCurrency(metrics.breakEvenV)}
                subValue={`Ingresos necesarios`}
                colorClass="text-gray-800"
                icon={
                  <div className="p-2 bg-orange-50 rounded-lg">
                    <Scale className="h-5 w-5 text-orange-500" />
                  </div>
                }
              />
              <InfoCard 
                title="Margen Seguridad (MS)"
                value={unitType === UnitType.PHYSICAL ? formatNumber(metrics.safetyMarginQ) : formatCurrency(metrics.safetyMarginV)}
                subValue={unitType === UnitType.PHYSICAL ? 'Unidades' : 'Monetario'}
                colorClass={metrics.safetyMarginQ >= 0 ? "text-green-600" : "text-red-600"}
                icon={
                  <div className="p-2 bg-purple-50 rounded-lg">
                    <Shield className="h-5 w-5 text-purple-500" />
                  </div>
                }
              />
              <InfoCard 
                title="Resultado Operativo (Ro)"
                value={formatCurrency((targetVolume * metrics.contributionMarginUnit) - fixedCost)}
                subValue={((targetVolume * metrics.contributionMarginUnit) - fixedCost) >= 0 ? "Ganancia" : "Pérdida"}
                colorClass={((targetVolume * metrics.contributionMarginUnit) - fixedCost) >= 0 ? "text-green-600" : "text-red-600"}
                icon={
                  <div className="p-2 bg-green-50 rounded-lg">
                    <Banknote className="h-5 w-5 text-green-500" />
                  </div>
                }
              />
            </div>

            {/* Explanations */}
            {renderExplanation()}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;