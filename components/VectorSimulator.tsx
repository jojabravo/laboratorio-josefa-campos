
import React, { useState } from 'react';

// Define and export QuizModule so it can be shared by other simulators (Newton, Hooke, Pulley)
export const QuizModule = ({ quizData, userAnswers, setUserAnswers, submitted, setSubmitted, title }: any) => {
  return (
    <div className="bg-white p-6 md:p-8 rounded-3xl shadow-xl border border-slate-200 mt-8">
      <h3 className="text-xl font-black text-indigo-900 mb-6 flex items-center gap-3">
        <span className="bg-indigo-600 text-white w-8 h-8 rounded-lg flex items-center justify-center text-sm">?</span>
        {title}
      </h3>

      <div className="space-y-6">
        {quizData.map((item: any, i: number) => (
          <div key={i} className="p-5 rounded-2xl bg-slate-50 border border-slate-100 shadow-sm">
            <p className="font-bold text-slate-800 mb-4 text-sm md:text-base">{i + 1}. {item.q}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {item.a.map((opt: string, idx: number) => (
                <button 
                  key={idx}
                  onClick={() => {
                    if (submitted) return;
                    const newAns = [...userAnswers];
                    newAns[i] = idx;
                    setUserAnswers(newAns);
                  }}
                  className={`p-3 text-left text-xs font-bold rounded-xl border transition-all ${
                    userAnswers[i] === idx 
                      ? (submitted ? (idx === item.c ? 'bg-emerald-500 text-white border-emerald-600' : 'bg-rose-500 text-white border-rose-600') : 'bg-indigo-600 text-white border-indigo-700')
                      : (submitted && idx === item.c ? 'bg-emerald-100 border-emerald-500 text-emerald-700' : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-200')
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {!submitted ? (
        <button 
          onClick={() => setSubmitted(true)}
          disabled={userAnswers.includes(null)}
          className="w-full mt-8 py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-lg disabled:opacity-50 transition-all hover:bg-indigo-700 active:scale-[0.98]"
        >
          VALIDAR CONOCIMIENTOS
        </button>
      ) : (
        <div className="mt-8 text-center p-6 bg-indigo-50 rounded-2xl border border-indigo-100 animate-in fade-in zoom-in duration-300">
          <p className="font-black text-indigo-900 text-lg mb-2">
            Puntaje: {userAnswers.filter((a: any, i: number) => a === quizData[i].c).length} / {quizData.length}
          </p>
          <button onClick={() => { setSubmitted(false); setUserAnswers(new Array(quizData.length).fill(null)); }} className="text-xs font-black text-indigo-700 uppercase tracking-widest bg-white px-4 py-2 rounded-lg border border-indigo-200 shadow-sm hover:bg-indigo-50">Intentar de nuevo</button>
        </div>
      )}
    </div>
  );
};

const VectorSimulator: React.FC = () => {
  const [mode, setMode] = useState<'individual' | 'suma'>('individual');
  const [zoom, setZoom] = useState<number>(1.5);
  const [magA, setMagA] = useState<number>(100);
  const [angA, setAngA] = useState<number>(45);
  const [magB, setMagB] = useState<number>(80);
  const [angB, setAngB] = useState<number>(120);
  const [showComponents, setShowComponents] = useState(true);

  const [quizAnswers, setQuizAnswers] = useState<(number | null)[]>(new Array(4).fill(null));
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  const radA = (angA * Math.PI) / 180;
  const ax = magA * Math.cos(radA);
  const ay = magA * Math.sin(radA);
  
  const radB = (angB * Math.PI) / 180;
  const bx = magB * Math.cos(radB);
  const by = magB * Math.sin(radB);
  
  const rx = mode === 'individual' ? ax : ax + bx;
  const ry = mode === 'individual' ? ay : ay + by;
  const magR = Math.sqrt(rx * rx + ry * ry);
  const angR = (Math.atan2(ry, rx) * 180) / Math.PI;

  const centerX = 200;
  const centerY = 200;

  const quizData = [
    { q: "¿Cuál es la componente horizontal (x) de un vector de 100N con ángulo 0°?", a: ["0 N", "100 N", "50 N", "100 sen(0) N"], c: 1 },
    { q: "Si un vector tiene componentes (+, -), ¿en qué cuadrante se encuentra?", a: ["I", "II", "III", "IV"], c: 3 },
    { q: "Para calcular la magnitud de la resultante (R), ¿qué teorema aplicamos?", a: ["Tales", "Pitágoras", "Euclides", "Bernoulli"], c: 1 },
    { q: "Si sumamos dos vectores perpendiculares de 3N y 4N, ¿cuánto mide la resultante?", a: ["7 N", "1 N", "5 N", "12 N"], c: 2 }
  ];

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-[32px] shadow-xl border border-slate-200">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Controles Izquierda */}
          <div className="lg:col-span-5 space-y-6 flex flex-col">
            <div className="bg-[#0f172a] p-6 rounded-3xl border border-slate-700 space-y-6">
              <div className="flex bg-slate-800 p-1 rounded-xl">
                <button onClick={() => setMode('individual')} className={`flex-1 py-2 text-[10px] font-black rounded-lg transition-all ${mode === 'individual' ? 'bg-slate-700 shadow-md text-white' : 'text-slate-400'}`}>INDIVIDUAL</button>
                <button onClick={() => setMode('suma')} className={`flex-1 py-2 text-[10px] font-black rounded-lg transition-all ${mode === 'suma' ? 'bg-slate-700 shadow-md text-white' : 'text-slate-400'}`}>SUMA</button>
              </div>

              <div>
                <h4 className="text-white text-[10px] font-black uppercase tracking-widest mb-4">Componentes Rectangulares</h4>
                <div className="bg-[#1e293b] rounded-2xl overflow-hidden border border-slate-700">
                  <table className="w-full text-[10px] text-slate-300">
                    <thead>
                      <tr className="bg-slate-800/50 text-slate-400 border-b border-slate-700">
                        <th className="px-4 py-3 text-left font-black">Vector</th>
                        <th className="px-4 py-3 text-right font-black">X (cosθ)</th>
                        <th className="px-4 py-3 text-right font-black">Y (senθ)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/50">
                      <tr>
                        <td className="px-4 py-3 font-black text-blue-400">A</td>
                        <td className="px-4 py-3 text-right font-mono font-bold text-white">{ax.toFixed(1)}</td>
                        <td className="px-4 py-3 text-right font-mono font-bold text-white">{ay.toFixed(1)}</td>
                      </tr>
                      {mode === 'suma' && (
                        <tr>
                          <td className="px-4 py-3 font-black text-purple-400">B</td>
                          <td className="px-4 py-3 text-right font-mono font-bold text-white">{bx.toFixed(1)}</td>
                          <td className="px-4 py-3 text-right font-mono font-bold text-white">{by.toFixed(1)}</td>
                        </tr>
                      )}
                      <tr className="bg-emerald-500/10">
                        <td className="px-4 py-3 font-black text-emerald-400">R</td>
                        <td className="px-4 py-3 text-right font-mono font-bold text-white">{rx.toFixed(1)}</td>
                        <td className="px-4 py-3 text-right font-mono font-bold text-white">{ry.toFixed(1)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#1e293b] p-3 rounded-2xl border border-slate-700 text-center">
                  <span className="block text-[8px] text-slate-500 uppercase font-black">Magnitud |R|</span>
                  <b className="text-emerald-400 font-mono text-lg">{magR.toFixed(1)} N</b>
                </div>
                <div className="bg-[#1e293b] p-3 rounded-2xl border border-slate-700 text-center">
                  <span className="block text-[8px] text-slate-500 uppercase font-black">Ángulo θ</span>
                  <b className="text-sky-400 font-mono text-lg">{angR.toFixed(1)}°</b>
                </div>
              </div>

              <div className="pt-2 space-y-4">
                <ControlSlider label="Escala Zoom" value={zoom} unit="x" min={0.5} max={2.5} step={0.1} onChange={setZoom} />
                <ControlSlider label="Longitud A" value={magA} unit="N" min={0} max={180} onChange={setMagA} />
                <ControlSlider label="Dirección A" value={angA} unit="°" min={0} max={360} onChange={setAngA} />
                {mode === 'suma' && (
                  <>
                    <div className="h-px bg-slate-700 my-2"></div>
                    <ControlSlider label="Longitud B" value={magB} unit="N" min={0} max={180} onChange={setMagB} />
                    <ControlSlider label="Dirección B" value={angB} unit="°" min={0} max={360} onChange={setAngB} />
                  </>
                )}
              </div>
            </div>
            
            <button onClick={() => setShowComponents(!showComponents)} className={`w-full py-4 rounded-2xl text-[10px] font-black border transition-all ${showComponents ? 'bg-amber-600 text-white border-amber-700 shadow-lg' : 'bg-slate-100 text-slate-400'}`}>
              {showComponents ? 'OCULTAR PROYECCIONES' : 'MOSTRAR PROYECCIONES'}
            </button>
          </div>

          {/* Canvas Derecha */}
          <div className="lg:col-span-7 bg-slate-100 rounded-[32px] border border-slate-200 flex items-center justify-center min-h-[500px] relative shadow-inner overflow-hidden">
            <svg width="100%" height="450" viewBox="0 0 400 400" className="overflow-visible z-10">
              <defs>
                <marker id="arrowA" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#3b82f6" />
                </marker>
                <marker id="arrowB" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#a855f7" />
                </marker>
                <marker id="arrowR" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#10b981" />
                </marker>
              </defs>
              
              {/* Ejes con flechas */}
              <line x1="10" y1={centerY} x2="390" y2={centerY} stroke="#94a3b8" strokeWidth="1" />
              <line x1={centerX} y1="10" x2={centerX} y2="390" stroke="#94a3b8" strokeWidth="1" />
              
              {/* Graduaciones y etiquetas de escala numérica */}
              {[-150, -100, -50, 50, 100, 150].map(v => (
                <React.Fragment key={v}>
                  {/* Marcas Eje X */}
                  <line x1={centerX + v*zoom} y1={centerY-5} x2={centerX + v*zoom} y2={centerY+5} stroke="#64748b" strokeWidth="2" />
                  <text x={centerX + v*zoom} y={centerY + 20} textAnchor="middle" className="fill-slate-500 text-[10px] font-black">{Math.abs(v)}</text>
                  
                  {/* Marcas Eje Y */}
                  <line x1={centerX-5} y1={centerY-v*zoom} x2={centerX+5} y2={centerY-v*zoom} stroke="#64748b" strokeWidth="2" />
                  <text x={centerX - 25} y={centerY - v*zoom + 4} textAnchor="end" className="fill-slate-500 text-[10px] font-black">{Math.abs(v)}</text>
                </React.Fragment>
              ))}

              {/* Rectángulos de proyección (Componentes paralelas) */}
              {showComponents && (
                <g opacity="0.6">
                  {/* Proyección de A - Rectángulo paralelo a ejes */}
                  <line x1={centerX + ax*zoom} y1={centerY} x2={centerX + ax*zoom} y2={centerY - ay*zoom} stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="4" />
                  <line x1={centerX} y1={centerY - ay*zoom} x2={centerX + ax*zoom} y2={centerY - ay*zoom} stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="4" />
                  
                  {/* Proyección de Suma (solo si modo suma) */}
                  {mode === 'suma' && (
                    <g opacity="0.4">
                       <line x1={centerX + rx*zoom} y1={centerY} x2={centerX + rx*zoom} y2={centerY - ry*zoom} stroke="#10b981" strokeWidth="1.5" strokeDasharray="4" />
                       <line x1={centerX} y1={centerY - ry*zoom} x2={centerX + rx*zoom} y2={centerY - ry*zoom} stroke="#10b981" strokeWidth="1.5" strokeDasharray="4" />
                    </g>
                  )}
                </g>
              )}
              
              <line x1={centerX} y1={centerY} x2={centerX + ax*zoom} y2={centerY - ay*zoom} stroke="#3b82f6" strokeWidth="4" marker-end="url(#arrowA)" />
              {mode === 'suma' && (
                <line x1={centerX} y1={centerY} x2={centerX + bx*zoom} y2={centerY - by*zoom} stroke="#a855f7" strokeWidth="4" marker-end="url(#arrowB)" />
              )}
              <line x1={centerX} y1={centerY} x2={centerX + rx*zoom} y2={centerY - ry*zoom} stroke="#10b981" strokeWidth="5" marker-end="url(#arrowR)" />
            </svg>
            <div className="absolute top-4 left-4 text-[9px] font-black uppercase text-slate-400 bg-white/50 px-3 py-1 rounded-full border border-slate-200">Escala 1:{zoom.toFixed(1)} | Unidad: Newton (N)</div>
          </div>
        </div>
      </div>
      <QuizModule quizData={quizData} userAnswers={quizAnswers} setUserAnswers={setQuizAnswers} submitted={quizSubmitted} setSubmitted={setQuizSubmitted} title="Evaluación de Vectores" />
    </div>
  );
};

const ControlSlider = ({ label, value, unit, min, max, step = 1, onChange }: any) => (
  <div className="space-y-1">
    <div className="flex justify-between text-[9px] font-black text-slate-500 uppercase"><span>{label}</span><span className="text-white font-mono">{value}{unit}</span></div>
    <input type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(Number(e.target.value))} className="w-full h-1 bg-slate-700 accent-indigo-500 rounded-lg appearance-none" />
  </div>
);

export default VectorSimulator;
