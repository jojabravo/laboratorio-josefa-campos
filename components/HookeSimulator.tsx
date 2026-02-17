
import React, { useState, useEffect, useRef } from 'react';
import { QuizModule } from './VectorSimulator';

const MATERIAL_PRESETS = [
  { name: 'Plástico', k: 150, color: '#10b981', label: 'Suave' },
  { name: 'Acero', k: 400, color: '#3b82f6', label: 'Medio' },
  { name: 'Industrial', k: 850, color: '#f43f5e', label: 'Rígido' },
];

const HookeSimulator: React.FC = () => {
  const [k, setK] = useState<number>(400);
  const [mass, setMass] = useState<number>(0); 
  const [isOscillating, setIsOscillating] = useState(false);
  const [time, setTime] = useState(0);
  
  const [quizAnswers, setQuizAnswers] = useState<(number | null)[]>(new Array(4).fill(null));
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  const requestRef = useRef<number | undefined>(undefined);
  const lastTimeRef = useRef<number | undefined>(undefined);

  const g = 9.81;
  const weight = mass * g;
  const x = mass > 0 ? weight / k : 0; 

  const animate = (t: number) => {
    if (lastTimeRef.current !== undefined) {
      const dt = (t - lastTimeRef.current) / 1000;
      setTime(prev => prev + dt);
    }
    lastTimeRef.current = t;
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    if (isOscillating && mass > 0) requestRef.current = requestAnimationFrame(animate);
    else { if (requestRef.current) cancelAnimationFrame(requestRef.current); lastTimeRef.current = undefined; }
    return () => { if (requestRef.current) cancelAnimationFrame(requestRef.current); };
  }, [isOscillating, mass]);

  const visualScale = 250; // 1m = 250px
  const equilibriumY = x * visualScale;
  const currentVisualX = isOscillating ? equilibriumY + (0.05 * visualScale) * Math.sin(Math.sqrt(k / (mass || 1)) * time) : equilibriumY;

  const springTopY = 30;
  const naturalLength = 120;
  const rulerZeroY = springTopY + naturalLength; 

  const reset = () => { setIsOscillating(false); setTime(0); };

  const quizData = [
    { q: "¿Qué sucede con la elongación (x) si cambiamos a un material 'Industrial' manteniendo la misma masa?", a: ["Aumenta", "Disminuye", "Se mantiene igual", "Se duplica"], c: 1 },
    { q: "En el estado natural del resorte (m = 0), ¿cuál es el valor de la fuerza elástica?", a: ["m·g", "k·x", "Cero (0 N)", "Infinito"], c: 2 },
    { q: "La pendiente de la gráfica Fuerza vs Elongación es:", a: ["La masa", "La constante k", "La gravedad", "La energía"], c: 1 },
    { q: "Si la constante elástica es 400 N/m y colgamos 4 kg (aprox 40 N), ¿cuánto se estira?", a: ["10 cm", "40 cm", "100 cm", "5 cm"], c: 0 }
  ];

  const totalCurrentLength = naturalLength + currentVisualX;
  const springSegments = 12;

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-[32px] shadow-xl border border-slate-100">
        <div className="flex flex-col md:flex-row justify-between items-start mb-6 gap-4">
          <div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tighter">Ley de Hooke</h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Constante Elástica y Deformación</p>
          </div>
          <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shadow-inner">
            {MATERIAL_PRESETS.map(preset => (
              <button key={preset.name} onClick={() => { setK(preset.k); reset(); }} className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${k === preset.k ? 'bg-white text-indigo-600 shadow-sm border border-slate-200' : 'text-slate-400'}`}>
                {preset.name.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-slate-900 rounded-[24px] p-6 border border-slate-800 h-48 shadow-2xl relative overflow-hidden">
               <span className="absolute top-3 left-4 text-[8px] font-black text-slate-600 uppercase tracking-widest z-10">Monitor de Fuerza F = k·x</span>
               <svg width="100%" height="100%" viewBox="0 0 200 120" className="overflow-visible">
                 <line x1="20" y1="100" x2="180" y2="100" stroke="#334155" strokeWidth="1" />
                 <line x1="20" y1="10" x2="20" y2="100" stroke="#334155" strokeWidth="1" />
                 <line x1="20" y1="100" x2="170" y2={100 - (k/1000) * 80} stroke={MATERIAL_PRESETS.find(p => p.k === k)?.color} strokeWidth="2.5" />
                 <circle cx={20 + (x * 120)} cy={100 - (weight/100) * 80} r="4" fill="white" className="shadow-lg" />
               </svg>
            </div>

            <div className="bg-slate-50 p-6 rounded-[24px] space-y-6 border border-slate-200">
               <ControlSlider label="Masa colgada" value={mass} unit=" kg" min={0} max={10} step={0.5} onChange={(v: number) => { setMass(v); reset(); }} color="indigo" />
               <ControlSlider label="Constante k" value={k} unit=" N/m" min={50} max={1000} step={10} onChange={(v: number) => setK(v)} color="indigo" />
               <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => setIsOscillating(!isOscillating)} disabled={mass === 0} className={`py-4 rounded-xl font-black text-xs shadow-lg transition-all ${isOscillating ? 'bg-rose-500 text-white' : 'bg-indigo-600 text-white'}`}>PERTURBAR</button>
                  <button onClick={() => { setMass(0); reset(); }} className="py-4 bg-white border border-slate-200 text-slate-600 rounded-xl font-black text-xs hover:bg-slate-50">SIN MASA</button>
               </div>
            </div>

            <div className="bg-indigo-950 p-6 rounded-[24px] grid grid-cols-2 gap-4 border border-indigo-900 shadow-xl">
               <div className="text-center border-r border-indigo-900/50">
                  <span className="block text-[8px] text-indigo-400 font-black uppercase mb-1">Fuerza Restauradora</span>
                  <b className="text-white text-xl font-mono">{weight.toFixed(1)} N</b>
               </div>
               <div className="text-center">
                  <span className="block text-[8px] text-indigo-400 font-black uppercase mb-1">Elongación (x)</span>
                  <b className="text-sky-400 text-xl font-mono">{(x * 100).toFixed(1)} cm</b>
               </div>
            </div>
          </div>

          <div className="lg:col-span-7 bg-slate-50 rounded-[32px] flex items-start justify-center p-10 border border-slate-200 shadow-inner min-h-[550px] relative overflow-hidden">
            <div className="absolute left-10 w-16 border-l-4 border-slate-300 z-10" style={{ top: `${rulerZeroY + 40}px`, height: '350px' }}>
               {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90].map(cm => (
                 <div key={cm} className="relative h-[25px]">
                    <div className={`absolute left-0 h-[2px] bg-slate-300 ${cm % 10 === 0 ? 'w-6' : 'w-3'}`}></div>
                    {cm % 10 === 0 && <span className="text-[10px] font-black text-slate-400 absolute left-8 -top-[7px]">{cm} cm</span>}
                 </div>
               ))}
               <div className="absolute -top-8 -left-2 text-[9px] font-black text-indigo-600 uppercase tracking-widest bg-white border border-indigo-100 px-3 py-1 rounded-full shadow-sm">Escala (cm)</div>
            </div>

            <svg width="250" height="500" viewBox="0 0 200 450" className="overflow-visible ml-16">
              <rect x="0" y="0" width="200" height="20" fill="#1e293b" rx="4" />
              <path 
                d={`M 100 20 L 100 40 ${Array.from({length: springSegments}).map((_, i) => {
                  const segH = (totalCurrentLength - 40) / springSegments;
                  const y = 40 + (i + 0.5) * segH;
                  const nextY = 40 + (i + 1) * segH;
                  const side = i % 2 === 0 ? 130 : 70;
                  return `L ${side} ${y} L 100 ${nextY}`;
                }).join(' ')}`}
                fill="none" stroke="#64748b" strokeWidth="4" strokeLinejoin="round"
              />
              <g transform={`translate(100, ${20 + totalCurrentLength})`}>
                {mass > 0 ? (
                  <>
                    <rect x={-25 - mass} y="0" width={50 + mass*2} height={40 + mass*2} rx="8" fill="#4f46e5" stroke="#312e81" strokeWidth="3" className="shadow-lg" />
                    <text x="0" y={(40 + mass*2)/2 + 5} textAnchor="middle" fill="white" fontSize="12" fontWeight="black">{mass} kg</text>
                  </>
                ) : (
                  <circle cx="0" cy="5" r="6" fill="none" stroke="#64748b" strokeWidth="3" />
                )}
              </g>
              <line x1="-120" y1={rulerZeroY} x2="120" y2={rulerZeroY} stroke="#3b82f6" strokeWidth="2" strokeDasharray="6,4" opacity="0.4" />
            </svg>
          </div>
        </div>
      </div>
      <QuizModule quizData={quizData} userAnswers={quizAnswers} setUserAnswers={setQuizAnswers} submitted={quizSubmitted} setSubmitted={setQuizSubmitted} title="Evaluación: Ley de Hooke" />
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
  <div className="space-y-1.5">
    <div className="flex justify-between text-[11px] font-black text-slate-500 uppercase tracking-tighter">
      <span>{label}</span><span className="text-indigo-600 font-mono bg-white px-2 rounded border border-slate-200">{value}{unit}</span>
    </div>
    <input 
      type="range" 
      min={min} 
      max={max} 
      step={step} 
      value={value} 
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(Number(e.target.value))} 
      className={`w-full h-1.5 rounded-lg appearance-none cursor-pointer bg-slate-200 accent-indigo-600`} 
    />
  </div>
);

export default HookeSimulator;
