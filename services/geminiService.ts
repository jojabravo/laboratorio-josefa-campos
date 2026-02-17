import { GoogleGenerativeAI } from "@google/genai";

// 1. Ponemos tu clave directamente aquí para que funcione de una vez
const API_KEY = "AIzaSyBPPBYGpUrAGRaKpPdFChCq48xyO53v198";
const genAI = new GoogleGenerativeAI(API_KEY);

export async function askPhysicsTutor(prompt: string, context?: string) {
  try {
    // 2. Configuramos el modelo (usando gemini-1.5-flash que es el más estable)
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: `
        Eres un experto profesor de Física de la Institución Educativa Josefa Campos. 
        Tu objetivo es ayudar a estudiantes de secundaria a entender la mecánica clásica.
        
        Reglas de respuesta:
        1. Responde de forma clara, pedagógica y alentadora.
        2. Usa LaTeX para las fórmulas matemáticas (ej. $F = m \\cdot a$).
        3. Si el estudiante pregunta sobre descomposición de vectores, explica el uso de sen(θ) y cos(θ).
        4. Mantén un tono motivador: "¡Excelente pregunta!", "¡Vamos a resolverlo juntos!".
        
        Contexto actual de la simulación: ${context || "Mecánica clásica general"}.
      `,
    });

    // 3. Realizamos la petición
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const resultText = response.text();
    
    if (!resultText) {
      throw new Error("Respuesta vacía del servidor.");
    }

    return resultText;
    
  } catch (error: any) {
    console.error("Error en Tutoría IA:", error);
    
    if (error?.message?.includes('429') || error?.message?.includes('quota')) {
      return "¡Wow! Muchos científicos están preguntando a la vez. Espera un momento y vuelve a intentarlo.";
    }
    
    return "Tuve un pequeño problema al procesar tu duda. ¿Podrías intentar preguntarme de nuevo? ¡Estoy aquí para ayudarte!";
  }
}
