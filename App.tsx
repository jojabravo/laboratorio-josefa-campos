
import React, { useState, useMemo } from 'react';
import VectorSimulator from './components/VectorSimulator';
import NewtonSimulator from './components/NewtonSimulator';
import HookeSimulator from './components/HookeSimulator';
import EnergySimulator from './components/EnergySimulator';
import PulleySimulator from './components/PulleySimulator';
import PendulumSimulator from './components/PendulumSimulator';
import Quiz from './components/Quiz';
import AITutor from './components/AITutor';

type TabType = 'vectores' | 'cinematica' | 'plano' | 'tension' | 'hooke' | 'pendulo' | 'energia' | 'fluidos' | 'quiz_final';

interface TabInfo {
  id: TabType;
  label: string;
  icon: string;
  category: string;
  theory: {
    title: string;
    content: string;
    definitions: { term: string; desc: string }[];
    formulas: string[];
  };
}

const TABS: TabInfo[] = [
  { 
    id: 'vectores', label: 'Vectores', icon: '↗️', category: 'Conceptos Básicos',
    theory: { 
      title: 'Análisis Vectorial', 
      content: 'Un vector es una herramienta matemática para representar magnitudes con dirección y sentido.',
      definitions: [
        { term: 'Módulo', desc: 'Es la longitud del vector, representa el valor numérico de la magnitud.' },
        { term: 'Dirección', desc: 'Orientación del vector respecto a un eje de referencia (ángulo θ).' },
        { term: 'Componentes', desc: 'Proyecciones del vector sobre los ejes cartesianos (Ax y Ay).' }
      ],
      formulas: ['Ax = A·cos(θ)', 'Ay = A·sen(θ)', 'R = √(Rx² + Ry²)'] 
    }
  },
  { id: 'cinematica', label: 'Cinemática', icon: '🏃', category: 'Cinemática', theory: { title: 'Cinemática', content: 'Estudio del movimiento sin considerar las fuerzas que lo producen.', definitions: [{term: 'Velocidad', desc: 'Relación entre el desplazamiento y el tiempo.'}], formulas: ['v = Δx/Δt'] } },
  { 
    id: 'plano', label: 'Plano Inclinado', icon: '📐', category: 'Dinámica',
    theory: { 
      title: 'Dinámica en Plano Inclinado', 
      content: 'Análisis de fuerzas cuando un cuerpo se encuentra sobre una superficie con pendiente.',
      definitions: [
        { term: 'Fuerza Normal (N)', desc: 'Fuerza perpendicular a la superficie de apoyo.' },
        { term: 'Fuerza de Rozamiento (Fr)', desc: 'Fuerza opuesta al movimiento, proporcional a la Normal.' },
        { term: 'Peso (W)', desc: 'Fuerza gravitatoria que siempre apunta verticalmente hacia abajo.' }
      ],
      formulas: ['Px = m·g·sen(θ)', 'Py = m·g·cos(θ)', 'Fr = μ·N'] 
    }
  },
  { 
    id: 'tension', label: 'Tensión', icon: '🔗', category: 'Dinámica',
    theory: { 
      title: 'Tensión y Sistemas Acoplados', 
      content: 'La tensión es la fuerza transmitida a través de una cuerda o cable inextensible.',
      definitions: [
        { term: 'Cuerda Inextensible', desc: 'Cuerda que no cambia su longitud, transmitiendo la aceleración íntegramente.' },
        { term: 'Sistema de Masas', desc: 'Conjunto de cuerpos unidos que se mueven con la misma aceleración.' }
      ],
      formulas: ['T = m₂·(g - a) (Para masa colgante)', 'T = m₁·a + m₁·g·sen(θ) + Fr (Para masa en rampa)'] 
    }
  },
  { id: 'hooke', label: 'Hooke', icon: '🌀', category: 'Dinámica', theory: { title: 'Ley de Hooke', content: 'Fuerza elástica en resortes y materiales deformables.', definitions: [{term: 'Constante k', desc: 'Medida de la rigidez del material.'}], formulas: ['F = -k·x'] } },
  { id: 'pendulo', label: 'Péndulo', icon: '⏱️', category: 'Dinámica', theory: { title: 'Péndulo Simple', content: 'Movimiento armónico de una masa suspendida.', definitions: [{term: 'Periodo (T)', desc: 'Tiempo de una oscilación completa.'}], formulas: ['T = 2π√(L/g)'] } },
  { id: 'energia', label: 'Energía', icon: '🎢', category: 'Trabajo y Energía', theory: { title: 'Energía Mecánica', content: 'Capacidad de realizar trabajo. Se conserva en sistemas sin fricción.', definitions: [{term: 'Energía Cinética (Ec)', desc: 'Energía debida al movimiento.'}, {term: 'Energía Potencial (Ep)', desc: 'Energía debida a la altura.'}], formulas: ['Em = Ec + Ep'] } },
  { id: 'quiz_final', label: 'Test de Energía', icon: '📝', category: 'Trabajo y Energía', theory: { title: 'Evaluación', content: 'Cuestionario de 10 preguntas.', definitions: [], formulas: ['W = F·d'] } },
  { id: 'fluidos', label: 'Fluidos', icon: '💧', category: 'Fluidos', theory: { title: 'Fluidos', content: 'Próximamente.', definitions: [], formulas: ['P = F/A'] } },
];

const App: React.FC = () => {
  const [hasStarted, setHasStarted] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('vectores');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const activeTabInfo = useMemo(() => TABS.find(t => t.id === activeTab) || TABS[0], [activeTab]);

  if (!hasStarted) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 overflow-hidden">
        <div className="max-w-4xl w-full bg-white rounded-[40px] shadow-2xl overflow-hidden flex flex-col md:flex-row border-4 border-indigo-500/30">
          <div className="md:w-1/2 bg-indigo-50 p-10 flex flex-col items-center justify-center text-center space-y-6">
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Escudo_de_la_Instituci%C3%B3n_Educativa_Josefa_Campos.png/300px-Escudo_de_la_Instituci%C3%B3n_Educativa_Josefa_Campos.png" 
              alt="Escudo Josefa Campos" className="w-32 drop-shadow-lg"
              onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/200?text=Josefa+Campos'; }}
            />
            <div className="space-y-2">
              <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter uppercase">Laboratorio de Física <span className="text-indigo-600 block">I.E Josefa Campos</span></h1>
              <p className="text-slate-500 font-black uppercase tracking-[0.2em] text-[10px] italic">"Lo que se vive, se enseña"</p>
            </div>
            <div className="bg-white/80 p-6 rounded-3xl border border-indigo-100 shadow-sm italic text-indigo-900 font-medium">
              "El éxito es la suma de pequeños esfuerzos repetidos día tras día. ¡Prepárate para descubrir el mundo a través de la física!"
            </div>
            <button 
              onClick={() => setHasStarted(true)} 
              className="w-full py-5 bg-indigo-600 text-white font-black rounded-3xl shadow-xl hover:bg-indigo-700 transition-all text-lg uppercase tracking-widest active:scale-95"
            >
              ¡ENTRAR AL LABORATORIO! 🚀
            </button>
          </div>
          <div className="md:w-1/2 bg-indigo-600 p-8 flex items-center justify-center relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
             <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
             <div className="text-white text-center space-y-4 relative z-10">
                <div className="text-7xl drop-shadow-2xl">⚛️</div>
                <h2 className="text-2xl font-black uppercase tracking-widest">CIENCIA INTERACTIVA</h2>
                <p className="text-sm opacity-80 font-medium px-4">Herramienta pedagógica diseñada para facilitar el aprendizaje de la mecánica clásica.</p>
             </div>
          </div>
        </div>
      </div>
    );
  }

  const categories = Array.from(new Set(TABS.map(t => t.category)));

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="bg-white border-b border-slate-200 py-4 px-6 sticky top-0 z-[100] shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)} 
            className="p-3 bg-slate-100 rounded-xl hover:bg-indigo-100 transition-colors shadow-sm"
          >
            <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               {isMenuOpen ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"/> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 6h16M4 12h16M4 18h16"/>}
            </svg>
          </button>
          <div className="hidden sm:block">
            <h1 className="text-xl font-black text-slate-900 leading-none">Josefa Campos: Física Interactiva</h1>
            <p className="text-[10px] text-indigo-500 font-bold uppercase tracking-widest leading-none mt-1">"¡Lo que se vive, se enseña!"</p>
          </div>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-black text-xs hover:bg-indigo-700 transition-all shadow-md">
          📖 TEORÍA
        </button>
      </header>

      <div className="flex flex-1 relative">
        <aside className={`fixed inset-y-0 left-0 transform ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out z-[90] w-72 bg-white border-r border-slate-200 shadow-2xl pt-24 overflow-y-auto no-scrollbar`}>
          <div className="p-6 space-y-8">
            {categories.map(cat => (
              <div key={cat} className="space-y-3">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">{cat}</span>
                <div className="space-y-1">
                  {TABS.filter(t => t.category === cat).map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => { setActiveTab(tab.id); setIsMenuOpen(false); }}
                      className={`w-full text-left px-4 py-3 rounded-xl text-xs font-black uppercase flex items-center gap-3 transition-all ${
                        activeTab === tab.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-lg">{tab.icon}</span> {tab.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </aside>

        <main className="flex-1 w-full p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 transition-all">
          <div className="lg:col-span-8 space-y-12">
            {activeTab === 'vectores' && <VectorSimulator />}
            {activeTab === 'plano' && <NewtonSimulator />}
            {activeTab === 'tension' && <PulleySimulator />}
            {activeTab === 'hooke' && <HookeSimulator />}
            {activeTab === 'energia' && <EnergySimulator />}
            {activeTab === 'pendulo' && <PendulumSimulator />}
            {activeTab === 'quiz_final' && <Quiz />}
            {['cinematica', 'fluidos'].includes(activeTab) && (
              <div className="bg-white p-16 rounded-[40px] text-center border-2 border-dashed border-slate-200">
                <p className="text-6xl mb-6">⚙️</p>
                <h2 className="text-2xl font-black">Módulo en Desarrollo</h2>
              </div>
            )}
          </div>
          
          <div className="lg:col-span-4 h-[600px] lg:h-auto">
            <div className="sticky top-24 h-full max-h-[700px]">
              <AITutor activeTab={activeTabInfo.label} />
            </div>
          </div>
        </main>
      </div>

      <footer className="bg-white border-t border-slate-200 py-10 px-6 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <h4 className="text-slate-900 font-black text-lg">Jorge Armando Jaramillo Bravo</h4>
            <p className="text-indigo-600 font-bold text-xs uppercase tracking-widest mt-1">Director del Laboratorio</p>
          </div>
          <div className="flex flex-wrap justify-center gap-2 max-w-lg">
            <span className="bg-slate-100 px-3 py-1 rounded-full text-[10px] font-bold text-slate-500 border border-slate-200">Lic. Matemáticas y Física (UdeA)</span>
            <span className="bg-slate-100 px-3 py-1 rounded-full text-[10px] font-bold text-slate-500 border border-slate-200">Mag. Enseñanza de las Ciencias (UNAL)</span>
            <span className="bg-slate-100 px-3 py-1 rounded-full text-[10px] font-bold text-slate-500 border border-slate-200">Doctorante en Educación (UTEL)</span>
          </div>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">© 2026 I.E. Josefa Campos</p>
        </div>
      </footer>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[200] flex items-center justify-center p-4" onClick={() => setIsModalOpen(false)}>
          <div className="bg-white rounded-[32px] max-w-2xl w-full p-8 md:p-12 shadow-2xl relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 p-2 bg-slate-100 rounded-full hover:bg-slate-200">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
            <h2 className="text-3xl font-black text-slate-900 mb-6">{activeTabInfo.theory.title}</h2>
            <p className="text-slate-600 mb-6 leading-relaxed font-medium">{activeTabInfo.theory.content}</p>
            
            <div className="mb-8 space-y-4">
              <h4 className="text-xs font-black uppercase text-indigo-600 tracking-widest">Conceptos Clave</h4>
              <div className="grid gap-3">
                {activeTabInfo.theory.definitions.map((d, i) => (
                  <div key={i} className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span className="font-black text-slate-900 text-[11px] block">{d.term}</span>
                    <span className="text-slate-500 text-[11px] leading-tight">{d.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {activeTabInfo.theory.formulas.map((f, i) => (
                <div key={i} className="bg-slate-50 p-4 rounded-2xl border-2 border-indigo-100 text-center font-mono font-bold text-indigo-700">{f}</div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
