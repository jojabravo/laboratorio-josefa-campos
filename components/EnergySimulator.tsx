
import React, { useState, useEffect, useRef } from 'react';

const EnergySimulator: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [height, setHeight] = useState(350);
  const [radius, setRadius] = useState(60);
  const [frictionEnabled, setFrictionEnabled] = useState(true);
  const [status, setStatus] = useState({ text: 'LISTO PARA LANZAMIENTO', color: 'text-emerald-500' });
  
  const metricsRef = useRef({ speed: 0, ec: 0, ep: 0, eth: 0 });
  const [displayMetrics, setDisplayMetrics] = useState({ speed: 0, ec: 0, ep: 0, eth: 0 });

  const gravity = 9.8;
  const mass = 1;
  const groundY = 380;
  const startX = 80;
  const frictionCoeff = 0.07; 
  const maxEnergy = 5000; 

  const getPistaCoords = (p: number) => {
    const h = height;
    const r = radius;
    const rampEndX = 250;
    const loopA_X = 420;
    const loopCenterY = groundY - r;
    
    if (p < 0.25) {
      const t = p / 0.25;
      return { x: startX + t * (rampEndX - startX), y: (groundY - h) + t * h, seg: 'rampa' };
    } else if (p < 0.35) {
      const t = (p - 0.25) / 0.1;
      return { x: rampEndX + t * (loopA_X - rampEndX), y: groundY, seg: 'recta' };
    } else if (p < 0.75) {
      const t = (p - 0.35) / 0.4;
      const angle = Math.PI / 2 - t * Math.PI * 2;
      return { x: loopA_X + r * Math.cos(angle), y: loopCenterY + r * Math.sin(angle), seg: 'loop' };
    } else {
      const t = (p - 0.75) / 0.25;
      return { x: loopA_X + t * 400, y: groundY, seg: 'final' };
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let currentProgress = progress;
    let currentThermal = metricsRef.current.eth;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#f8fafc'; ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#cbd5e1'; ctx.fillRect(0, groundY, canvas.width, canvas.height - groundY);

      // Etiquetas de la pista
      ctx.fillStyle = "#94a3b8";
      ctx.font = "bold 10px Inter";
      ctx.fillText("RAMPA", 100, groundY + 15);
      ctx.fillText("RIZO", 400, groundY + 15);
      ctx.fillText("META", 700, groundY + 15);

      // Riel metalizado
      ctx.beginPath();
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 12;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      for (let i = 0; i <= 1; i += 0.005) {
        const pt = getPistaCoords(i);
        if (i === 0) ctx.moveTo(pt.x, pt.y); else ctx.lineTo(pt.x, pt.y);
      }
      ctx.stroke();

      if (isPlaying) {
        const step = 0.003;
        const nextP = currentProgress + step;
        if (nextP <= 1) {
          const pos = getPistaCoords(nextP);
          const h_actual = Math.max(0, groundY - pos.y);
          
          // CORRECCIÓN: Solo sumar calor si la fricción está activada
          if (frictionEnabled) {
            currentThermal += frictionCoeff * 600 * step;
          } else {
            currentThermal = 0; // Si se desactiva en medio, se resetea el calor acumulado para idealidad
          }

          const ePot = h_actual * gravity * mass;
          const eTotalIni = height * gravity * mass;
          
          // E_mec = Ec + Ep + Eth => Ec = E_total - Ep - Eth
          const eKin = Math.max(0, eTotalIni - ePot - currentThermal);
          const speed = Math.sqrt((2 * eKin) / mass);
          
          if (pos.seg === 'loop' && pos.y < (groundY - radius) && speed < Math.sqrt(gravity * radius)) {
            setIsPlaying(false); 
            setStatus({ text: 'FALLO: VELOCIDAD CRÍTICA', color: 'text-rose-600' });
          } else {
            currentProgress = nextP; 
            setProgress(nextP);
            const newMetrics = { speed, ec: eKin, ep: ePot, eth: currentThermal };
            metricsRef.current = newMetrics; 
            setDisplayMetrics(newMetrics);
            if (nextP >= 0.99) { 
              setIsPlaying(false); 
              setStatus({ text: '¡OBJETIVO CUMPLIDO!', color: 'text-emerald-600' }); 
            }
          }
        } else { setIsPlaying(false); }
      }

      const carPos = getPistaCoords(currentProgress);
      ctx.save();
      ctx.translate(carPos.x, carPos.y);
      const nextPos = getPistaCoords(currentProgress + 0.01);
      ctx.rotate(Math.atan2(nextPos.y - carPos.y, nextPos.x - carPos.x));
      
      // Carrito
      ctx.fillStyle = '#3b82f6';
      ctx.fillRect(-15, -10, 30, 8);
      ctx.strokeStyle = '#1d4ed8'; ctx.lineWidth = 2; ctx.strokeRect(-15, -10, 30, 8);
      
      // Pasajeros
      ctx.fillStyle = '#ef4444';
      ctx.beginPath(); ctx.arc(-6, -12, 3, 0, Math.PI * 2); ctx.fill(); 
      ctx.beginPath(); ctx.arc(6, -12, 3, 0, Math.PI * 2); ctx.fill(); 
      
      ctx.restore();
      animationFrameId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPlaying, height, radius, frictionEnabled]);

  const resetSim = () => {
    setIsPlaying(false); 
    setProgress(0); 
    setStatus({ text: 'LISTO PARA LANZAMIENTO', color: 'text-emerald-500' });
    const initialEp = height * gravity * mass;
    metricsRef.current = { speed: 0, ec: 0, ep: initialEp, eth: 0 };
    setDisplayMetrics({ speed: 0, ec: 0, ep: initialEp, eth: 0 });
  };

  const currentTotalEnergy = displayMetrics.ec + displayMetrics.ep + displayMetrics.eth;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-1 flex flex-col gap-3">
          <button onClick={() => setIsPlaying(!isPlaying)} className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-xl transition-all ${isPlaying ? 'bg-amber-600' : 'bg-indigo-600'}`}>{isPlaying ? '⏸' : '▶'}</button>
          <button onClick={resetSim} className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center border border-slate-200 shadow-sm">🔄</button>
          <button onClick={() => { setFrictionEnabled(!frictionEnabled); if (!frictionEnabled) resetSim(); }} className={`w-14 h-14 rounded-2xl flex items-center justify-center border text-[10px] font-black transition-all ${frictionEnabled ? 'bg-rose-100 border-rose-200 text-rose-600' : 'bg-slate-100 border-slate-200 text-slate-400'}`}>FRICC</button>
        </div>

        <div className="lg:col-span-8 bg-white rounded-[40px] shadow-xl border border-slate-200 overflow-hidden relative aspect-[16/9]">
          <canvas ref={canvasRef} width="800" height="420" className="w-full h-full"></canvas>
        </div>

        <div className="lg:col-span-3 bg-white p-6 rounded-[32px] border border-slate-200 shadow-lg space-y-6">
          <ControlSlider label="Altura Inicial" value={height} unit="m" min={150} max={360} onChange={setHeight} onFinish={resetSim} />
          <ControlSlider label="Radio Rizo" value={radius} unit="m" min={40} max={90} onChange={setRadius} onFinish={resetSim} />
          <div className="space-y-3 pt-4 border-t">
            <EnergyBar label="Cinética (Ec)" value={displayMetrics.ec} color="bg-blue-500" max={maxEnergy} />
            <EnergyBar label="Potencial (Ep)" value={displayMetrics.ep} color="bg-rose-500" max={maxEnergy} />
            <EnergyBar label="Térmica (Q)" value={displayMetrics.eth} color="bg-amber-500" max={maxEnergy} />
            
            <div className="pt-2">
              <div className="flex justify-between text-[10px] font-black text-indigo-700 uppercase mb-1">
                <span>Energía Mecánica</span>
                <span>{Math.round(currentTotalEnergy)} J</span>
              </div>
              <div className="h-4 bg-slate-100 rounded-full overflow-hidden flex border border-slate-200 shadow-inner">
                <div className="h-full bg-blue-500" style={{ width: `${(displayMetrics.ec / currentTotalEnergy) * 100}%` }}></div>
                <div className="h-full bg-rose-500" style={{ width: `${(displayMetrics.ep / currentTotalEnergy) * 100}%` }}></div>
                <div className="h-full bg-amber-500" style={{ width: `${(displayMetrics.eth / currentTotalEnergy) * 100}%` }}></div>
              </div>
              <p className="text-[8px] text-slate-400 text-center mt-1 uppercase font-bold">Consumo: Azul | Rosa | Ámbar</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 p-6 rounded-[32px] flex flex-wrap justify-around items-center gap-6 shadow-2xl border border-slate-800">
        <div className="text-center">
          <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Estatus Sistema</p>
          <p className={`${status.color} font-black text-xs uppercase tracking-widest`}>{status.text}</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Velocidad Instantánea</p>
          <p className="text-white font-mono text-xl">{displayMetrics.speed.toFixed(1)} <span className="text-[10px] text-slate-400">m/s</span></p>
        </div>
        <div className="text-center">
          <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Progreso Recorrido</p>
          <p className="text-sky-400 font-mono text-xl">{(progress*100).toFixed(0)} <span className="text-[10px] text-sky-600">%</span></p>
        </div>
      </div>
    </div>
  );
};

const EnergyBar = ({ label, value, color, max }: any) => (
  <div className="space-y-1">
    <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase"><span>{label}</span> <span>{Math.round(value)} J</span></div>
    <div className="h-2 bg-slate-100 rounded-full overflow-hidden"><div className={`h-full ${color}`} style={{ width: `${Math.min(100, (value/max)*100)}%` }}></div></div>
  </div>
);

const ControlSlider = ({ label, value, unit, min, max, onChange, onFinish }: any) => (
  <div className="space-y-2">
    <div className="flex justify-between text-[10px] font-black text-slate-600 uppercase"><span>{label}</span><span className="bg-indigo-50 text-indigo-700 px-2 rounded font-bold">{value}{unit}</span></div>
    <input type="range" min={min} max={max} value={value} onChange={(e) => { onChange(parseInt(e.target.value)); onFinish(); }} className="w-full h-1.5 accent-indigo-600 bg-slate-100 rounded-lg appearance-none" />
  </div>
);

export default EnergySimulator;
