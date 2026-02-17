
import { GoogleGenAI } from "@google/genai";

export async function askPhysicsTutor(prompt: string, context?: string) {
  // Always use a new GoogleGenAI instance with process.env.API_KEY directly to ensure the latest key is used.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const systemInstruction = `
    Eres un experto profesor de Física especializado en mecánica clásica. 
    Tu objetivo es ayudar a estudiantes a entender conceptos como:
    - Descomposición de vectores (uso de seno y coseno).
    - Leyes de Newton (F = ma).
    - Tensiones en cuerdas y poleas.
    - Ley de Hooke (F = kx).
    - Planos inclinados.
    
    Responde de forma clara, pedagógica y alentadora. Usa LaTeX para las fórmulas si es necesario.
    Si el estudiante te da valores específicos, ayúdale a resolver el problema paso a paso.
    Contexto actual de la simulación: ${context || "Información general de física"}.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    // The GenerateContentResponse features a .text property to access the extracted string output.
    return response.text || "Lo siento, no pude procesar tu duda en este momento.";
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return "Ocurrió un error al conectar con el tutor de IA.";
  }
}
