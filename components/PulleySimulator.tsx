
import React, { useState, useEffect, useRef } from 'react';
import { QuizModule } from './VectorSimulator';

type SubModule = 'atwood' | 'inclined' | 'tension_horiz';

const PulleySimulator: React.FC = () => {
  const [activeSub, setActiveSub] = useState<SubModule>('tension_horiz');
  const [m1, setM1] = useState<number>(25);
  const [m2, setM2] = useState<number>(15);
  const [friction, setFriction] = useState<number>(0.15);
  const [appliedForce, setAppliedForce] = useState<number>(150);

  const [xPos, setXPos] = useState<number>(0);
  const [velocity, setVelocity] = useState<number>(0);
  const [isSimulating, setIsSimulating] = useState(false);
  
  const [quizAnswers, setQuizAnswers] = useState<(number | null)[]>(new Array(4).fill(null));
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  const requestRef = useRef<number | undefined>(undefined);
  const lastTimeRef = useRef<number | undefined>(undefined);

  const g = 9.81;
  let acceleration = 0;
  let tension = 0;

  if (activeSub === 'tension_horiz') {
    const totalMass = m1 + m2;
    const frictionMax = friction * totalMass * g;
    if (appliedForce > frictionMax) {
      acceleration = (appliedForce - frictionMax) / totalMass;
    } else {
      acceleration = 0;
    }
    tension = m1 * acceleration + (friction * m1 * g);
  }

  const animate = (time: number) => {
    if (lastTimeRef.current !== undefined) {
      const dt = (time - lastTimeRef.current) / 1000;
      setVelocity(v => {
        const newV = v + acceleration * dt;
        setXPos(x => {
          const nextX = x + newV * 40 * dt;
          if (nextX > 250) { setIsSimulating(false); return x; }
          return nextX;
        });
        return newV;
      });
    }
    lastTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    if (isSimulating) requestRef.current = requestAnimationFrame(animate);
    else { if (requestRef.current) cancelAnimationFrame(requestRef.current); lastTimeRef.current = undefined; }
    return () => { if (requestRef.current) cancelAnimationFrame(requestRef.current); };
  }, [isSimulating, acceleration]);

  const reset = () => { setXPos(0); setVelocity(0); setIsSimulating(false); };

  const quizData = [
    { q: "¿Qué fuerza une a las dos cajas en el sistema horizontal?", a: ["Peso", "Normal", "Tensión", "Gravedad"], c: 2 },
    { q: "Si duplicamos la fuerza aplicada, ¿qué pasa con la aceleración?", a: ["Se duplica siempre", "Depende de la fricción neta", "No cambia", "Disminuye"], c: 1 },
    { q: "La fuerza de rozamiento total es:", a: ["μ·m1·g", "μ·m2·g", "μ·(m1+m2)·g", "Fuerza Aplicada"], c: 2 },
    { q: "Si la aceleración es cero, la fuerza aplicada es:", a: ["Mayor que la fricción", "Menor o igual a la fricción", "Infinita", "Cero"], c: 1 }
  ];

  return (
    <div className="space-y-8">
      <div className="bg-white p-8 rounded-[40px] shadow-xl border border-slate-200">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-1 flex flex-col gap-3">
            <button onClick={() => setIsSimulating(!isSimulating)} className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-xl ${isSimulating ? 'bg-amber-600' : 'bg-indigo-600'}`}>{isSimulating ? '⏸' : '▶'}</button>
            <button onClick={reset} className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center border border-slate-200">🔄</button>
          </div>

          <div className="lg:col-span-8 bg-slate-50 rounded-[32px] min-h-[400px] border border-slate-200 relative overflow-hidden shadow-inner flex items-center justify-center">
            <svg width="100%" height="300" viewBox="0 0 500 300" className="overflow-visible">
              <defs><marker id="arr-red" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="#ef4444" /></marker></defs>
              <line x1="0" y1="200" x2="500" y2="200" stroke="#94a3b8" strokeWidth="4" />
              
              {/* Caja 1 (Seguidora) */}
              <g transform={`translate(${50 + xPos}, 150)`}>
                <rect width="50" height="50" fill="#f59e0b" rx="4" stroke="#b45309" strokeWidth="2" />
                <text x="25" y="30" textAnchor="middle" fill="white" fontSize="10" fontWeight="black">M1</text>
                {/* Rozamiento */}
                <line x1="0" y1="50" x2="-20" y2="50" stroke="#ef4444" strokeWidth="2" markerEnd="url(#arr-red)" />
                {/* Tensión */}
                <line x1="50" y1="25" x2="80" y2="25" stroke="#10b981" strokeWidth="2" />
              </g>

              {/* Cuerda conectora */}
              <line x1={100 + xPos} y1="175" x2={150 + xPos} y2="175" stroke="#475569" strokeWidth="2" strokeDasharray="4" />

              {/* Caja 2 (Tirada) */}
              <g transform={`translate(${150 + xPos}, 150)`}>
                <rect width="50" height="50" fill="#3b82f6" rx="4" stroke="#1e40af" strokeWidth="2" />
                <text x="25" y="30" textAnchor="middle" fill="white" fontSize="10" fontWeight="black">M2</text>
                {/* Fuerza Aplicada */}
                <line x1="50" y1="25" x2="100" y2="25" stroke="#3b82f6" strokeWidth="3" markerEnd="url(#arr-red)" />
                {/* Tensión (hacia atrás) */}
                <line x1="0" y1="25" x2="-30" y2="25" stroke="#10b981" strokeWidth="2" />
                {/* Rozamiento */}
                <line x1="0" y1="50" x2="-20" y2="50" stroke="#ef4444" strokeWidth="2" markerEnd="url(#arr-red)" />
              </g>
            </svg>
            <div className="absolute bottom-6 bg-slate-900 text-white px-6 py-2 rounded-full text-[10px] font-black font-mono shadow-2xl flex gap-8">
               <div>ACCEL: {acceleration.toFixed(2)} m/s²</div>
               <div>TENSION: {tension.toFixed(1)} N</div>
            </div>
          </div>

          <div className="lg:col-span-3 space-y-6 bg-white p-6 rounded-3xl border border-slate-200">
            <ControlSlider label="Masa M1" value={m1} unit="kg" min={1} max={50} onChange={setM1} />
            <ControlSlider label="Masa M2" value={m2} unit="kg" min={1} max={50} onChange={setM2} />
            <ControlSlider label="Fricción μ" value={friction} unit="" min={0} max={0.8} step={0.01} onChange={setFriction} />
            <ControlSlider label="Fuerza F" value={appliedForce} unit="N" min={0} max={300} onChange={setAppliedForce} />
          </div>
        </div>
      </div>
      <QuizModule quizData={quizData} userAnswers={quizAnswers} setUserAnswers={setQuizAnswers} submitted={quizSubmitted} setSubmitted={setQuizSubmitted} title="Evaluación: Tensión Horizontal" />
    </div>
  );
};

const ControlSlider = ({ label, value, unit, min, max, step = 1, onChange }: any) => (
  <div className="space-y-1">
    <div className="flex justify-between text-[10px] font-black text-slate-500"><span>{label}</span><span>{value}{unit}</span></div>
    <input type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(Number(e.target.value))} className="w-full h-1 accent-indigo-600 bg-slate-100 rounded-lg appearance-none" />
  </div>
);

export default PulleySimulator;
