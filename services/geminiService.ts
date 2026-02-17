
import { GoogleGenAI } from "@google/genai";

export async function askPhysicsTutor(prompt: string, context?: string) {
  // Always use a new GoogleGenAI instance with process.env.API_KEY directly to ensure the latest key is used.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const systemInstruction = `
    Eres un experto profesor de Física de la Institución Educativa Josefa Campos. 
    Tu objetivo es ayudar a estudiantes de secundaria a entender la mecánica clásica.
    
    Reglas de respuesta:
    1. Responde de forma clara, pedagógica y alentadora.
    2. Usa LaTeX para las fórmulas matemáticas (ej. $F = m \cdot a$).
    3. Si el estudiante pregunta sobre descomposición de vectores, explica el uso de sen(θ) y cos(θ).
    4. Mantén un tono motivador: "¡Excelente pregunta!", "¡Vamos a resolverlo juntos!".
    
    Contexto actual de la simulación: ${context || "Mecánica clásica general"}.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        systemInstruction: { parts: [{ text: systemInstruction }] },
        temperature: 0.7,
        maxOutputTokens: 800,
      },
    });

    return response.text || "Lo siento, no pude generar una respuesta. Intenta reformular tu pregunta.";
  } catch (error) {
    console.error("Error en el Tutor IA:", error);
    return "Tuve un pequeño problema técnico. ¿Podrías intentar preguntarme de nuevo? Estoy aquí para ayudarte.";
  }
}
