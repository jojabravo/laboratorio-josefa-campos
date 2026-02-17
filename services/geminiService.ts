
import { GoogleGenAI } from "@google/genai";

export async function askPhysicsTutor(prompt: string, context?: string) {
  try {
    // Inicialización dentro del try para capturar cualquier error de entorno
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

    // Usamos el formato de strings simples para contents y systemInstruction según la documentación
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
        maxOutputTokens: 800,
      },
    });

    const text = response.text;
    return text || "Lo siento, no pude generar una respuesta en este momento. ¿Podrías intentar reformular tu duda?";
    
  } catch (error) {
    console.error("Error crítico en el Tutor IA:", error);
    // Devolvemos un string en lugar de lanzar el error para que el componente no colapse
    return "Hola. Parece que tengo dificultades para conectarme con mis libros de física en este momento. ¿Podrías intentar preguntarme de nuevo en unos segundos? ¡Estoy aquí para ayudarte!";
  }
}
