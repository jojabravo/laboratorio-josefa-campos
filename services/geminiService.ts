
import { GoogleGenAI } from "@google/genai";

export async function askPhysicsTutor(prompt: string, context?: string) {
  try {
    // Verificamos de forma segura la existencia de la API_KEY antes de inicializar
    const apiKey = process.env.API_KEY;
    
    if (!apiKey) {
      console.warn("API_KEY no detectada. Verifique la configuración del entorno.");
      return "Hola. Parece que mi conexión con el laboratorio no está activa (falta la configuración del API). Por favor, avísale al profesor Jorge Armando.";
    }

    const ai = new GoogleGenAI({ apiKey });
    
    const systemText = `
      Eres un experto profesor de Física de la Institución Educativa Josefa Campos. 
      Tu objetivo es ayudar a estudiantes de secundaria a entender la mecánica clásica.
      
      Reglas de respuesta:
      1. Responde de forma clara, pedagógica y alentadora.
      2. Usa LaTeX para las fórmulas matemáticas (ej. $F = m \cdot a$).
      3. Si el estudiante pregunta sobre descomposición de vectores, explica el uso de sen(θ) y cos(θ).
      4. Mantén un tono motivador: "¡Excelente pregunta!", "¡Vamos a resolverlo juntos!".
      
      Contexto actual de la simulación: ${context || "Mecánica clásica general"}.
    `;

    // Realizamos la petición usando el modelo flash que es más rápido y estable para chats
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        systemInstruction: systemText,
        temperature: 0.7,
        maxOutputTokens: 1000,
      },
    });

    const resultText = response.text;
    
    if (!resultText) {
      throw new Error("Respuesta vacía del servidor.");
    }

    return resultText;
    
  } catch (error: any) {
    console.error("Error en Tutoría IA:", error);
    
    // Manejo de errores específicos (ej. límites de cuota)
    if (error?.message?.includes('429') || error?.message?.includes('quota')) {
      return "¡Wow! Muchos científicos están preguntando a la vez. Espera un momento y vuelve a intentarlo.";
    }
    
    // Mensaje de error controlado para que la interfaz no se bloquee
    return "Tuve un pequeño problema al procesar tu duda. ¿Podrías intentar preguntarme de nuevo? ¡Estoy aquí para ayudarte!";
  }
}
