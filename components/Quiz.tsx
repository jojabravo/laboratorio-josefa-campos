
import React, { useState } from 'react';

const quizData = [
  { q: "¿Qué establece el Principio de Conservación de la Energía?", a: ["Se crea energía", "Solo se transforma", "Siempre disminuye", "Es igual al peso"], c: 1 },
  { q: "Energía debida a la altura de un cuerpo:", a: ["Cinética", "Térmica", "Potencial", "Eléctrica"], c: 2 },
  { q: "La fricción convierte la energía mecánica en:", a: ["Más velocidad", "Gravedad", "Calor (Térmica)", "Potencial"], c: 2 },
  { q: "Unidad de medida de la energía en el SI:", a: ["Newton", "Watt", "Joule", "Pascal"], c: 2 },
  { q: "En el punto más bajo de la rampa (sin fricción), la Ec es:", a: ["Cero", "Mínima", "Máxima", "Negativa"], c: 2 },
  { q: "Si duplicas la altura inicial, la energía potencial inicial:", a: ["Se mantiene", "Se duplica", "Se reduce", "Se vuelve cero"], c: 1 },
  { q: "La suma Ec + Ep se conoce como energía:", a: ["Trabajo", "Potencia", "Mecánica", "Térmica"], c: 2 },
  { q: "Para completar un loop de radio R con éxito, se requiere:", a: ["Fricción alta", "Altura suficiente", "Gravedad cero", "Poca velocidad"], c: 1 },
  { q: "Cuando el carrito se detiene por fricción, la energía total:", a: ["Desaparece", "Se transforma en calor", "Aumenta", "No cambia de forma"], c: 1 },
  { q: "Fórmula correcta de la energía cinética:", a: ["m · g · h", "m · v", "½ · m · v²", "F · d"], c: 2 }
];

const Quiz: React.FC = () => {
  const [userAnswers, setUserAnswers] = useState<(number | null)[]>(new Array(10).fill(null));
  const [score, setScore] = useState<number | null>(null);

  const handleSelect = (qIdx: number, oIdx: number) => {
    const newAnswers = [...userAnswers];
    newAnswers[qIdx] = oIdx;
    setUserAnswers(newAnswers);
  };

  const gradeQuiz = () => {
    let currentScore = 0;
    userAnswers.forEach((ans, i) => { if (ans === quizData[i].c) currentScore++; });
    setScore(currentScore);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl max-w-4xl mx-auto border border-slate-200">
      <h2 className="text-2xl font-black mb-8 text-indigo-900 flex items-center gap-3">
        <span className="bg-indigo-600 text-white w-10 h-10 rounded-lg flex items-center justify-center">?</span>
        Evaluación de Conceptos
      </h2>
      
      {score !== null && (
        <div className="mb-10 p-8 bg-indigo-600 rounded-2xl text-white text-center shadow-2xl animate-bounce">
          <p className="text-3xl font-black">Tu puntaje: {score} / 10</p>
          <p className="mt-2 font-bold">{score >= 7 ? "¡Excelente dominio del tema!" : "¡Sigue practicando en el simulador!"}</p>
          <button onClick={() => { setScore(null); setUserAnswers(new Array(10).fill(null)); }} className="mt-4 text-xs underline opacity-80">Reiniciar Test</button>
        </div>
      )}

      <div className="space-y-8">
        {quizData.map((item, i) => (
          <div key={i} className="p-6 rounded-2xl bg-slate-50 border-l-4 border-indigo-200">
            <p className="font-bold text-lg mb-4 text-slate-800">{i + 1}. {item.q}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {item.a.map((opt, idx) => (
                <button 
                  key={idx}
                  onClick={() => handleSelect(i, idx)}
                  className={`p-4 text-left font-medium rounded-xl border-2 transition-all ${
                    userAnswers[i] === idx 
                    ? 'bg-indigo-600 text-white border-indigo-600' 
                    : 'bg-white border-slate-200 hover:border-indigo-400 text-slate-600'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button 
        onClick={gradeQuiz}
        disabled={userAnswers.includes(null)}
        className="w-full mt-8 py-5 bg-green-600 text-white font-black text-xl rounded-2xl hover:bg-green-700 shadow-xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        ENVIAR RESPUESTAS
      </button>
    </div>
  );
};

export default Quiz;
