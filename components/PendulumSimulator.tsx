
import React, { useState, useEffect, useRef } from 'react';

const PLANETS = [
  { name: 'Tierra', g: 9.81, color: 'bg-blue-500' },
  { name: 'Luna', g: 1.62, color: 'bg-slate-400' },
  { name: 'Marte', g: 3.71, color: 'bg-orange-500' },
  { name: 'Júpiter', g: 24.79, color: 'bg-amber-700' },
];

const PendulumSimulator: React.FC = () => {
  const [mass, setMass] = useState(2); // kg
  const [length, setLength] = useState(1.5); // m
  const [initialAngle, setInitialAngle] = useState(30); // grados
  const [currentPlanet, setCurrentPlanet] = useState(PLANETS[0]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [showVectors, setShowVectors] = useState(true);
  
  // Quiz states
  const [quizAnswers, setQuizAnswers] = useState<(number | null)[]>(new Array(5).fill(null));
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  const requestRef = useRef<number | undefined>(undefined);
  const lastTimeRef = useRef<number | undefined>(undefined);

  // Física del péndulo
  const g = currentPlanet.g;
  const omega = Math.sqrt(g / length);
  const period = 2 * Math.PI * Math.sqrt(length / g);
  const frequency = 1 / period;

  // Ángulo en tiempo real (aproximación para ángulos pequeños/medios)
  const angleRad = (initialAngle * Math.PI / 180) * Math.cos(omega * currentTime);
  const currentAngleDeg = angleRad * 180 / Math.PI;

  // Fuerzas en el punto actual
  const weight = mass * g;
  const wx = weight * Math.sin(angleRad); // Fuerza restauradora
  const wy = weight * Math.cos(angleRad); // Componente radial
  // Tensión (Simplificada para nivel escolar: centrípeta + radial)
  const tension = wy + (mass * Math.pow(omega * (initialAngle * Math.PI / 180), 2) * length);

  const animate = (time: number) => {
    if (lastTimeRef.current !== undefined) {
      const dt = (time - lastTimeRef.current) / 1000;
      setCurrentTime(prev => prev + dt);
    }
    lastTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    if (isSimulating) {
      requestRef.current = requestAnimationFrame(animate);
    } else {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      lastTimeRef.current = undefined;
    }
    return () => { if (requestRef.current) cancelAnimationFrame(requestRef.current); };
  }, [isSimulating]);

  const reset = () => {
    setIsSimulating(false);
    setCurrentTime(0);
  };

  const pendulumX = 175 + Math.sin(angleRad) * (length * 80);
  const pendulumY = 50 + Math.cos(angleRad) * (length * 80);

  // Quiz Data - Corregido rigor científico (Cuerpo Celeste en lugar de Planeta)
  const miniQuiz = [
    { q: "¿Cómo afecta la masa al período del péndulo?", a: ["Lo aumenta", "Lo disminuye", "No le afecta", "Lo duplica"], c: 2 },
    { q: "Si la longitud de la cuerda aumenta, el período:", a: ["Aumenta", "Disminuye", "Sigue igual", "Se vuelve cero"], c: 0 },
    { q: "¿En cuál de estos cuerpos celestes el péndulo oscilará más lento (mayor período)?", a: ["Júpiter", "Tierra", "Luna", "Marte"], c: 2 },
    { q: "La fuerza que hace que el péndulo regrese al centro es:", a: ["La Tensión", "La componente Px del peso", "La masa", "La inercia"], c: 1 },
    { q: "En el punto más bajo (equilibrio), la tensión es:", a: ["Mínima", "Máxima", "Cero", "Igual al peso únicamente"], c: 1 }
  ];

  return (
    <div className="flex flex-col gap-8 pb-12">
      <div className="bg-white p-6 rounded-3xl shadow-xl border border-slate-100">
        <div className="flex flex-col md:flex-row justify-between items-start mb-6 gap-4">
          <div>
            <h2 className="text-2xl font-black text-slate-800">Movimiento Pendular</h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dinámica y Oscilaciones</p>
          </div>
          <button 
            onClick={() => setShowVectors(!showVectors)}
            className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${showVectors ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-500 border border-slate-200'}`}
          >
            MOSTRAR VECTORES {showVectors ? 'ON' : 'OFF'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Controles */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-slate-50 p-5 rounded-2xl space-y-5 border border-slate-100 shadow-inner">
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest text-center">Entorno de Gravedad</p>
              <div className="grid grid-cols-2 gap-2">
                {PLANETS.map(p => (
                  <button 
                    key={p.name}
                    onClick={() => { setCurrentPlanet(p); reset(); }}
                    className={`px-3 py-2 rounded-xl text-[9px] font-black uppercase transition-all border ${currentPlanet.name === p.name ? 'bg-indigo-600 text-white border-indigo-700 shadow-sm' : 'bg-white text-slate-400 border-slate-200 hover:border-indigo-300'}`}
                  >
                    {p.name}
                  </button>
                ))}
              </div>

              <ControlSlider label="Longitud (L)" value={length} unit=" m" min={0.5} max={2.5} step={0.1} onChange={(v: number) => { setLength(v); reset(); }} color="indigo" />
              <ControlSlider label="Masa (m)" value={mass} unit=" kg" min={0.5} max={10} step={0.5} onChange={(v: number) => { setMass(v); reset(); }} color="indigo" />
              <ControlSlider label="Ángulo Inicial" value={initialAngle} unit="°" min={5} max={60} step={1} onChange={(v: number) => { setInitialAngle(v); reset(); }} color="indigo" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => setIsSimulating(!isSimulating)}
                className={`py-4 rounded-2xl font-black text-xs transition-all shadow-lg ${isSimulating ? 'bg-rose-500 text-white' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}
              >
                {isSimulating ? 'PAUSAR' : 'INICIAR SIMULACIÓN'}
              </button>
              <button onClick={reset} className="py-4 bg-white text-slate-600 rounded-2xl font-black text-xs border border-slate-200 shadow-sm hover:bg-slate-50 transition-colors">RESETEAR</button>
            </div>

            <div className="p-4 bg-slate-900 rounded-2xl grid grid-cols-2 gap-4 border border-slate-800 font-mono text-white text-center shadow-lg">
               <div className="border-r border-slate-700">
                 <span className="text-[9px] block text-slate-500 uppercase font-black mb-1">Período (T)</span>
                 <b className="text-sky-400 text-lg">{period.toFixed(2)}s</b>
               </div>
               <div>
                 <span className="text-[9px] block text-slate-500 uppercase font-black mb-1">Frecuencia (f)</span>
                 <b className="text-emerald-400 text-lg">{frequency.toFixed(2)} Hz</b>
               </div>
            </div>
          </div>

          {/* Visualizador */}
          <div className="lg:col-span-8 bg-slate-50 rounded-3xl p-4 flex flex-col items-center justify-center border border-slate-200 shadow-inner relative min-h-[450px]">
             {/* Monitor de datos - Incluido el valor del PESO */}
             <div className="absolute top-4 right-4 bg-white/90 backdrop-blur p-4 rounded-2xl border border-slate-200 space-y-2 text-[10px] font-mono shadow-md z-10 w-40">
                <div className="flex justify-between gap-4 border-b border-slate-100 pb-1"><span>Gravedad:</span> <b>{g.toFixed(2)}</b></div>
                <div className="flex justify-between gap-4"><span>Ángulo:</span> <b>{currentAngleDeg.toFixed(1)}°</b></div>
                <div className="flex justify-between gap-4"><span>Peso (W):</span> <b className="text-emerald-600">{weight.toFixed(1)} N</b></div>
                <div className="flex justify-between gap-4"><span>Tensión:</span> <b className="text-rose-600">{tension.toFixed(1)} N</b></div>
             </div>

             <svg width="100%" height="400" viewBox="0 0 350 400" className="overflow-visible">
                <defs>
                  <marker id="arr-red" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="#ef4444" /></marker>
                  <marker id="arr-grn" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="#10b981" /></marker>
                  <marker id="arr-org" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="#f97316" /></marker>
                </defs>

                {/* Soporte */}
                <rect x="145" y="0" width="60" height="8" fill="#475569" rx="2" />
                <circle cx="175" cy="50" r="4" fill="#1e293b" />
                
                {/* Arco de referencia */}
                <path d={`M 175 50 m 0 100 a 100 100 0 0 1 50 -20`} fill="none" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4" />

                {/* Cuerda */}
                <line x1="175" y1="50" x2={pendulumX} y2={pendulumY} stroke="#94a3b8" strokeWidth="2" />

                {/* Masa */}
                <circle cx={pendulumX} cy={pendulumY} r={12 + mass} fill="#3b82f6" stroke="#1e40af" strokeWidth="3" className="shadow-sm" />

                {/* Vectores */}
                {showVectors && (
                  <g transform={`translate(${pendulumX}, ${pendulumY})`}>
                    {/* Peso (Green) */}
                    <line x1="0" y1="0" x2="0" y2={weight * 2} stroke="#10b981" strokeWidth="3" markerEnd="url(#arr-grn)" />
                    <text x="5" y={weight * 2 + 10} fill="#065f46" fontSize="10" fontWeight="bold">W</text>

                    {/* Tensión (Red) */}
                    <line x1="0" y1="0" x2={-Math.sin(angleRad) * tension * 1.5} y2={-Math.cos(angleRad) * tension * 1.5} stroke="#ef4444" strokeWidth="3" markerEnd="url(#arr-red)" />
                    <text x={-Math.sin(angleRad) * tension * 1.5 - 15} y={-Math.cos(angleRad) * tension * 1.5} fill="#9f1239" fontSize="10" fontWeight="bold">T</text>

                    {/* Descomposición Peso */}
                    <g transform={`rotate(${currentAngleDeg})`}>
                       {/* Wy */}
                       <line x1="0" y1="0" x2="0" y2={wy * 2} stroke="#f97316" strokeWidth="1.5" strokeDasharray="3" markerEnd="url(#arr-org)" />
                       <text x="5" y={wy * 2} fill="#9a3412" fontSize="9">Py</text>
                       {/* Wx */}
                       <line x1="0" y1="0" x2={-wx * 2} y2="0" stroke="#f97316" strokeWidth="1.5" strokeDasharray="3" markerEnd="url(#arr-org)" />
                       <text x={-wx * 2 - 15} y="15" fill="#9a3412" fontSize="9">Px</text>
                    </g>
                  </g>
                )}
             </svg>
             
             <div className="mt-4 flex flex-wrap justify-center gap-3 text-[9px] font-black uppercase tracking-tighter text-slate-400 bg-white px-4 py-2 rounded-full border border-slate-100 shadow-sm">
               <div className="flex items-center gap-1"><span className="w-2 h-2 bg-emerald-500 rounded-full"></span> Peso</div>
               <div className="flex items-center gap-1"><span className="w-2 h-2 bg-rose-500 rounded-full"></span> Tensión</div>
               <div className="flex items-center gap-1"><span className="w-2 h-2 bg-orange-500 rounded-full"></span> Componentes</div>
             </div>
          </div>
        </div>
      </div>

      {/* Mini-Quiz Integrado */}
      <div className="bg-white p-6 md:p-8 rounded-3xl shadow-xl border border-slate-200">
        <h3 className="text-xl font-black text-indigo-900 mb-6 flex items-center gap-3">
          <span className="bg-indigo-600 text-white w-8 h-8 rounded-lg flex items-center justify-center text-sm">?</span>
          Evaluación Formativa: El Péndulo Simple
        </h3>

        <div className="space-y-6">
          {miniQuiz.map((item, i) => (
            <div key={i} className="p-5 rounded-2xl bg-slate-50 border border-slate-100 shadow-sm">
              <p className="font-bold text-slate-800 mb-4 text-sm md:text-base">{i + 1}. {item.q}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {item.a.map((opt, idx) => (
                  <button 
                    key={idx}
                    onClick={() => {
                      if (quizSubmitted) return;
                      const newAns = [...quizAnswers];
                      newAns[i] = idx;
                      setQuizAnswers(newAns);
                    }}
                    className={`p-3 text-left text-xs font-bold rounded-xl border transition-all ${
                      quizAnswers[i] === idx 
                        ? (quizSubmitted ? (idx === item.c ? 'bg-emerald-500 text-white border-emerald-600' : 'bg-rose-500 text-white border-rose-600') : 'bg-indigo-600 text-white border-indigo-700')
                        : (quizSubmitted && idx === item.c ? 'bg-emerald-100 border-emerald-500 text-emerald-700' : 'bg-white text-slate-500 border-slate-200 hover:border-indigo-200')
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {!quizSubmitted ? (
          <button 
            onClick={() => setQuizSubmitted(true)}
            disabled={quizAnswers.includes(null)}
            className="w-full mt-8 py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-lg disabled:opacity-50 transition-all hover:bg-indigo-700 active:scale-[0.98]"
          >
            VALIDAR CONOCIMIENTOS
          </button>
        ) : (
          <div className="mt-8 text-center p-6 bg-indigo-50 rounded-2xl border border-indigo-100 animate-in fade-in zoom-in duration-300">
            <p className="font-black text-indigo-900 text-lg mb-2">
              Puntaje: {quizAnswers.filter((a, i) => a === miniQuiz[i].c).length} / 5
            </p>
            <p className="text-sm text-indigo-600 mb-4 font-bold">
              {quizAnswers.filter((a, i) => a === miniQuiz[i].c).length === 5 ? "¡Excelente! Has dominado el péndulo." : "Sigue practicando para mejorar tu puntaje."}
            </p>
            <button onClick={() => { setQuizSubmitted(false); setQuizAnswers(new Array(5).fill(null)); }} className="text-xs font-black text-indigo-700 uppercase tracking-widest bg-white px-4 py-2 rounded-lg border border-indigo-200 shadow-sm hover:bg-indigo-50">Intentar de nuevo</button>
          </div>
        )}
      </div>
    </div>
  );
};

interface ControlSliderProps {
  label: string;
  value: number;
  unit: string;
  min: number;
  max: number;
  step?: number;
  onChange: (val: number) => void;
  color: string;
}

const ControlSlider: React.FC<ControlSliderProps> = ({ label, value, unit, min, max, step, onChange, color }) => (
  <div className="space-y-1">
    <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase tracking-tight">
      <span>{label}</span><span className="text-slate-900 bg-white px-2 rounded border border-slate-200 font-mono">{value}{unit}</span>
    </div>
    <input 
      type="range" min={min} max={max} step={step} value={value} 
      onChange={(e) => onChange(Number(e.target.value))} 
      className={`w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-indigo-600 bg-slate-200`} 
    />
  </div>
);

export default PendulumSimulator;
