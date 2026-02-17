
import React, { useState, useEffect, useRef } from 'react';
import { QuizModule } from './VectorSimulator';

type Mode = 'simple' | 'coupled';

const NewtonSimulator: React.FC = () => {
  const [mode, setMode] = useState<Mode>('simple');
  const [mass1, setMass1] = useState<number>(20);
  const [mass2, setMass2] = useState<number>(10);
  const [frictionCoeff, setFrictionCoeff] = useState<number>(0.15);
  const [appliedForce, setAppliedForce] = useState<number>(0);
  const [angle, setAngle] = useState<number>(30);
  const [showFBD, setShowFBD] = useState(true);
  const [showCartesian, setShowCartesian] = useState(false);
  
  // position representa el desplazamiento acumulado de m1 en la rampa.
  const [position, setPosition] = useState(0); 
  const [velocity, setVelocity] = useState(0);
  const [isSimulating, setIsSimulating] = useState(false);
  
  const [quizAnswers, setQuizAnswers] = useState<(number | null)[]>(new Array(4).fill(null));
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  const requestRef = useRef<number | undefined>(undefined);
  const lastTimeRef = useRef<number | undefined>(undefined);

  const g = 9.81;
  const rad = (angle * Math.PI) / 180;
  
  // LÓGICA FÍSICA CALCULADA EN RENDER (PARA VISUALIZACIÓN DE VECTORES)
  const px1 = mass1 * g * Math.sin(rad); 
  const py1 = mass1 * g * Math.cos(rad); 
  const frictionMax = frictionCoeff * py1;
  const netDriveForce = mode === 'simple' ? (appliedForce - px1) : (mass2 * g - px1);
  
  // Aceleración actual para los monitores
  let currentAcceleration = 0;
  if (isSimulating) {
    const totalM = mode === 'coupled' ? (mass1 + mass2) : mass1;
    if (Math.abs(velocity) > 0.01) {
      const fDir = velocity > 0 ? 1 : -1;
      currentAcceleration = (netDriveForce - (fDir * frictionMax)) / totalM;
    } else if (Math.abs(netDriveForce) > frictionMax) {
      currentAcceleration = (netDriveForce - Math.sign(netDriveForce) * frictionMax) / totalM;
    }
  }

  const tension = mode === 'coupled' ? mass2 * (g - currentAcceleration) : 0;

  const animate = (time: number) => {
    if (lastTimeRef.current !== undefined) {
      const dt = (time - lastTimeRef.current) / 1000;
      
      // Cálculo dinámico dentro del loop para evitar re-renders infinitos
      setVelocity(v => {
        let accel = 0;
        const totalM = mode === 'coupled' ? (mass1 + mass2) : mass1;

        if (Math.abs(v) > 0.01) {
          const fDir = v > 0 ? 1 : -1;
          accel = (netDriveForce - (fDir * frictionMax)) / totalM;
        } else if (Math.abs(netDriveForce) > frictionMax) {
          accel = (netDriveForce - Math.sign(netDriveForce) * frictionMax) / totalM;
        }

        let newV = v + accel * dt;
        
        // Bloqueo por rozamiento estático (stiction)
        if (Math.sign(v) !== Math.sign(newV) && v !== 0) {
           if (Math.abs(netDriveForce) <= frictionMax) newV = 0;
        }

        setPosition(p => {
          const nextP = p + newV * dt * 0.2;
          // Límites visuales (evita que se junten en la polea o se salgan)
          if (nextP > 1.2 || nextP < -0.8) { 
            setIsSimulating(false); 
            return p; 
          }
          return nextP;
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
  }, [isSimulating, angle, mass1, mass2, frictionCoeff, appliedForce]);

  const reset = () => { setIsSimulating(false); setPosition(0); setVelocity(0); };

  const quizData = [
    { q: "¿Qué fuerza es perpendicular a la superficie en un plano inclinado?", a: ["Peso", "Normal", "Rozamiento", "Tensión"], c: 1 },
    { q: "Si la fricción es nula, un bloque en un plano de 30° acelera hacia abajo a:", a: ["g", "g sen(30°)", "g cos(30°)", "Cero"], c: 1 },
    { q: "En el sistema acoplado, si m2·g > m1·g·sen(θ) + fricción, el sistema:", a: ["Baja m1 (sube m2)", "Sube m1 (baja m2)", "Se queda quieto", "Explota"], c: 1 },
    { q: "Si la velocidad es hacia arriba del plano, ¿hacia dónde apunta la fricción?", a: ["Hacia arriba", "Hacia abajo", "Hacia la normal", "No hay fricción"], c: 1 }
  ];

  const rampBaseX = 50;
  const rampBaseY = 350;
  const rampWidth = 300;
  const apexX = rampBaseX + rampWidth;
  const apexY = rampBaseY - rampWidth * Math.tan(rad);
  const pulleyRadius = 12;

  // Coordenadas visuales precisas para cuerda paralela y longitud constante
  const baseDist1 = 150; 
  const currentDist1 = baseDist1 - position * 100; // m1 se acerca a polea si position aumenta
  const m1X = apexX - currentDist1 * Math.cos(rad);
  const m1Y = apexY + currentDist1 * Math.sin(rad);

  // m2 vertical: si position aumenta (m1 sube), m2 baja
  const m2Y = apexY + 120 + (position * 100);

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-[32px] shadow-xl border border-slate-100 flex flex-col gap-6">
        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
          <div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tighter">Dinámica en Plano</h2>
            <p className="text-slate-500 text-[10px] uppercase tracking-[0.3em] font-black italic">Leyes de Newton e Interacción</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => setShowCartesian(!showCartesian)} 
              className={`px-4 py-2 text-[10px] font-black rounded-xl transition-all border ${showCartesian ? 'bg-indigo-600 text-white border-indigo-700 shadow-md' : 'bg-slate-100 text-slate-500 border-slate-200'}`}
            >
              DIAGRAMA CUERPO LIBRE {showCartesian ? 'ON' : 'OFF'}
            </button>
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-inner">
              <button onClick={() => { setMode('simple'); reset(); }} className={`px-4 py-2 text-[10px] font-black rounded-lg transition-all ${mode === 'simple' ? 'bg-white shadow text-indigo-600' : 'text-slate-400'}`}>MASA ÚNICA</button>
              <button onClick={() => { setMode('coupled'); reset(); }} className={`px-4 py-2 text-[10px] font-black rounded-lg transition-all ${mode === 'coupled' ? 'bg-white shadow text-indigo-600' : 'text-slate-400'}`}>MASAS ACOPLADAS</button>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-slate-50 p-6 rounded-[24px] border border-slate-200 space-y-5 shadow-inner">
              <ControlSlider label="Inclinación θ" value={angle} unit="°" min={5} max={60} onChange={setAngle} color="blue" />
              <ControlSlider label="Masa m1" value={mass1} unit=" kg" min={1} max={50} onChange={setMass1} color="blue" />
              {mode === 'coupled' ? (
                  <ControlSlider label="Masa m2" value={mass2} unit=" kg" min={0} max={50} onChange={setMass2} color="amber" />
              ) : (
                  <ControlSlider label="Fuerza Aplicada" value={appliedForce} unit=" N" min={0} max={500} onChange={setAppliedForce} color="amber" />
              )}
              <ControlSlider label="Rozamiento μ" value={frictionCoeff} unit="" min={0} max={1} step={0.01} onChange={setFrictionCoeff} color="red" />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setIsSimulating(!isSimulating)} className={`py-4 rounded-2xl font-black text-xs transition-all shadow-xl ${isSimulating ? 'bg-amber-500 text-white' : 'bg-indigo-600 text-white'}`}>{isSimulating ? 'PAUSAR' : 'SIMULAR'}</button>
              <button onClick={reset} className="py-4 bg-white text-slate-600 rounded-2xl font-black text-xs border border-slate-200">REINICIAR</button>
            </div>

            <div className="p-5 bg-slate-900 rounded-[24px] grid grid-cols-2 gap-4">
                <div className="text-center">
                   <span className="block text-[8px] text-slate-500 uppercase font-black mb-1">Aceleración</span>
                   <b className="text-sky-400 text-xl font-mono">{currentAcceleration.toFixed(2)}</b>
                   <span className="block text-[8px] text-slate-600 font-black">m/s²</span>
                </div>
                <div className="text-center border-l border-white/5">
                   <span className="block text-[8px] text-slate-500 uppercase font-black mb-1">Tensión</span>
                   <b className="text-amber-400 text-xl font-mono">{tension.toFixed(1)}</b>
                   <span className="block text-[8px] text-slate-600 font-black">N</span>
                </div>
            </div>
          </div>

          <div className="lg:col-span-8 bg-slate-100 rounded-[32px] p-6 flex items-center justify-center min-h-[500px] border border-slate-200 relative overflow-hidden shadow-inner">
            <svg width="100%" height="450" viewBox="0 0 500 450" className="overflow-visible">
              <defs>
                <marker id="arr-red-n" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="#ef4444" /></marker>
                <marker id="arr-grn-n" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="#10b981" /></marker>
                <marker id="arr-yel-n" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="#eab308" /></marker>
                <marker id="arr-pur-n" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="#a855f7" /></marker>
                <marker id="arr-org-n" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="#f59e0b" /></marker>
              </defs>
              
              <path d={`M ${rampBaseX} ${rampBaseY} L ${apexX} ${rampBaseY} L ${apexX} ${apexY} Z`} fill="#cbd5e1" stroke="#475569" strokeWidth="2" />
              {mode === 'coupled' && <circle cx={apexX} cy={apexY - pulleyRadius} r={pulleyRadius} fill="#334155" />}
              
              <g transform={`translate(${m1X}, ${m1Y}) rotate(${-angle})`}>
                <rect x="-30" y="-60" width="60" height="60" rx="8" fill="#3b82f6" stroke="#1e40af" strokeWidth="3" />
                <text x="0" y="-30" textAnchor="middle" fill="white" fontSize="12" fontWeight="black">M1</text>
                
                {showCartesian && (
                  <g>
                    {/* Ejes Cartesianos Rotados */}
                    <line x1="-100" y1="-30" x2="100" y2="-30" stroke="#94a3b8" strokeWidth="1" strokeDasharray="4" />
                    <line x1="0" y1="-100" x2="0" y2="100" stroke="#94a3b8" strokeWidth="1" strokeDasharray="4" />
                    <text x="90" y="-35" fill="#64748b" fontSize="8" fontWeight="black">X</text>
                    <text x="5" y="-90" fill="#64748b" fontSize="8" fontWeight="black">Y</text>

                    {/* Componentes del Peso */}
                    {/* Py (perpendicular) */}
                    <line x1="0" y1="-30" x2="0" y2={-30 + (py1 * 0.4)} stroke="#f59e0b" strokeWidth="2.5" markerEnd="url(#arr-org-n)" strokeDasharray="3,2" />
                    <text x="5" y={-30 + (py1 * 0.4)} fill="#b45309" fontSize="9" fontWeight="bold">Py</text>
                    
                    {/* Px (paralelo) */}
                    <line x1="0" y1="-30" x2={-(px1 * 0.4)} y2="-30" stroke="#f59e0b" strokeWidth="2.5" markerEnd="url(#arr-org-n)" strokeDasharray="3,2" />
                    <text x={-(px1 * 0.4) - 15} y="-15" fill="#b45309" fontSize="9" fontWeight="bold">Px</text>
                  </g>
                )}

                {showFBD && (
                  <g>
                    {/* Fuerza Normal */}
                    <line x1="0" y1="-30" x2="0" y2={-30 - (py1 * 0.4)} stroke="#eab308" strokeWidth="3" markerEnd="url(#arr-yel-n)" />
                    {frictionCoeff > 0 && (
                      <line 
                        x1={velocity >= 0 ? 30 : -30} y1="-30" 
                        x2={velocity >= 0 ? -30 - frictionMax*0.4 : 30 + frictionMax*0.4} y2="-30" 
                        stroke="#a855f7" strokeWidth="3" markerEnd="url(#arr-pur-n)" 
                      />
                    )}
                    {(mode === 'coupled' || appliedForce > 0) && (
                      <line x1="30" y1="-30" x2={30 + (mode === 'coupled' ? tension : appliedForce) * 0.4} y2="-30" stroke="#ef4444" strokeWidth="3" markerEnd="url(#arr-red-n)" />
                    )}
                    <g transform={`rotate(${angle}, 0, -30)`}>
                        {/* Peso Real (Vertical) */}
                        <line x1="0" y1="-30" x2="0" y2={-30 + (mass1 * g) * 0.4} stroke="#10b981" strokeWidth="3" markerEnd="url(#arr-grn-n)" />
                    </g>
                  </g>
                )}
              </g>

              {mode === 'coupled' && (
                <>
                  <line 
                    x1={m1X + 30 * Math.cos(rad) - 30 * Math.sin(rad)} 
                    y1={m1Y - 30 * Math.sin(rad) - 30 * Math.cos(rad)}
                    x2={apexX - pulleyRadius * Math.sin(rad)} 
                    y2={apexY - pulleyRadius * Math.cos(rad)} 
                    stroke="#334155" strokeWidth="2.5" 
                  />
                  <line x1={apexX + pulleyRadius} y1={apexY - pulleyRadius} x2={apexX + pulleyRadius} y2={m2Y} stroke="#334155" strokeWidth="2.5" />
                  <g transform={`translate(${apexX + pulleyRadius}, ${m2Y})`}>
                    <rect x="-20" y="0" width="40" height="40" rx="6" fill="#f59e0b" stroke="#b45309" strokeWidth="3" />
                    <text x="0" y="25" textAnchor="middle" fill="white" fontSize="10" fontWeight="black">M2</text>
                    {showFBD && (
                      <g>
                        <line x1="0" y1="0" x2="0" y2="-40" stroke="#ef4444" strokeWidth="3" markerEnd="url(#arr-red-n)" />
                        <line x1="0" y1="40" x2="0" y2={40 + (mass2 * g) * 0.4} stroke="#10b981" strokeWidth="3" markerEnd="url(#arr-grn-n)" />
                      </g>
                    )}
                  </g>
                </>
              )}
            </svg>
            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-4 py-2 rounded-xl border border-slate-200 text-[9px] font-black uppercase tracking-widest text-slate-500 shadow-sm flex flex-col gap-1 z-20">
               <div className="flex items-center gap-2 font-mono text-indigo-600">T: {tension.toFixed(1)} N</div>
               <div className="flex items-center gap-2"><span className="w-2 h-2 bg-emerald-500 rounded-full"></span> Peso (W)</div>
               <div className="flex items-center gap-2"><span className="w-2 h-2 bg-rose-500 rounded-full"></span> Tensión/Fuerza</div>
               <div className="flex items-center gap-2"><span className="w-2 h-2 bg-amber-500 rounded-full"></span> Componentes Peso</div>
            </div>
          </div>
        </div>
      </div>
      <QuizModule quizData={quizData} userAnswers={quizAnswers} setUserAnswers={setQuizAnswers} submitted={quizSubmitted} setSubmitted={setQuizSubmitted} title="Evaluación Formativa: Dinámica en Plano" />
    </div>
  );
};

const ControlSlider = ({ label, value, unit, min, max, step = 1, onChange, color }: any) => {
  const colors: any = { blue: 'accent-indigo-600', amber: 'accent-amber-600', red: 'accent-rose-600' };
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase tracking-tighter">
        <span>{label}</span><span className="text-slate-900 bg-white px-2 rounded border border-slate-200">{value}{unit}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className={`w-full h-1.5 rounded-lg appearance-none cursor-pointer ${colors[color]} bg-slate-200`} />
    </div>
  );
};

export default NewtonSimulator;
