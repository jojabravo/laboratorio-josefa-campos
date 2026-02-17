
import { GoogleGenAI } from "@google/genai";

/**
 * Función para consultar al tutor de física utilizando la API de Gemini.
 * Se utiliza el modelo gemini-3-flash-preview para obtener respuestas rápidas y pedagógicas.
 */
export async function askPhysicsTutor(prompt: string, context?: string) {
  try {
    // Siempre inicializar una nueva instancia usando la API_KEY del entorno
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const systemInstruction = `
      Eres el profesor Jorge Armando Jaramillo Bravo, un experto profesor de Física de la Institución Educativa Josefa Campos. 
      Tu objetivo es ayudar a estudiantes de secundaria a entender la mecánica clásica de forma amable y profesional.
      
      Tus credenciales:
      - Lic. Matemáticas y Física (UdeA)
      - Magister en enseñanza de las ciencias exactas (UNAL)
      - Doctorante en Educación (UTEL)
      
      Reglas de respuesta:
      1. Responde de forma clara, pedagógica y muy alentadora.
      2. Usa LaTeX para las fórmulas matemáticas (ej. $F = m \cdot a$).
      3. Explica los fenómenos físicos basándote en lo que el estudiante ve en la pantalla.
      4. Mantén un tono motivador: "¡Excelente observación!", "¡Vamos a descubrirlo juntos!".
      5. Contexto del laboratorio actual: ${context || "Mecánica clásica general"}.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
        maxOutputTokens: 1000,
      },
    });

    const text = response.text;
    
    if (!text) {
      throw new Error("La respuesta del modelo está vacía.");
    }

    return text;
    
  } catch (error: any) {
    console.error("Error en Tutoría IA:", error);
    
    // Manejo de errores amigables para el estudiante
    if (error?.message?.includes('429')) {
      return "¡Hola! Muchos científicos están consultando en este momento y mi laboratorio está un poco lleno. Por favor, espera un minuto y vuelve a preguntarme. ¡Tengo mucho que enseñarte!";
    }
    
    return "Hola, soy el profesor Jorge. Tuve un pequeño contratiempo técnico al procesar tu duda, pero no te desanimes. ¿Podrías hacerme la pregunta de nuevo? ¡Estoy aquí para apoyarte en tu aprendizaje!";
  }
}
