import { GoogleGenAI, Type } from "@google/genai";
import { DataRow, AnalysisResponse } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// We use a lighter model for quick data analysis interactions
const MODEL_NAME = "gemini-2.5-flash";

export const analyzeData = async (
  query: string,
  columns: string[],
  sampleData: DataRow[]
): Promise<AnalysisResponse> => {
  
  const prompt = `
    You are an expert data analyst and visualization assistant.
    
    Current Dataset Context:
    - Columns: ${columns.join(", ")}
    - Sample Data (first 5 rows): ${JSON.stringify(sampleData)}
    
    User Query: "${query}"
    
    Goal: Answer the user's question. If the question implies visualizing data (e.g., "plot", "graph", "show me", "trend"), provide a configuration for a chart. If it's a textual question, just provide the answer.

    Return a JSON object with the following schema:
    {
      "answer": "A friendly text response summarizing the data or answering the question.",
      "visualization": {
         "type": "bar" | "line" | "area" | "scatter" | "pie",
         "xAxisKey": "The key from the data to use for the X axis (must exist in columns)",
         "series": [
            { "dataKey": "The key for the Y axis value", "name": "Human readable name", "color": "#hexcode" }
         ],
         "title": "Chart title"
      }
    }
    
    Rules for Visualization:
    - Only return "visualization" if relevant. Set it to null otherwise.
    - Choose vibrant, professional colors (e.g., #8884d8, #82ca9d, #ffc658, #ff7300).
    - Ensure 'xAxisKey' and 'dataKey' strictly match the provided column names.
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            answer: { type: Type.STRING },
            visualization: {
              type: Type.OBJECT,
              properties: {
                type: { type: Type.STRING, enum: ["bar", "line", "area", "scatter", "pie"] },
                xAxisKey: { type: Type.STRING },
                series: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      dataKey: { type: Type.STRING },
                      name: { type: Type.STRING },
                      color: { type: Type.STRING },
                    },
                  },
                },
                title: { type: Type.STRING },
              },
            },
          },
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");

    return JSON.parse(text) as AnalysisResponse;

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return {
      answer: "I encountered an error analyzing the data. Please ensure your API key is valid and the data is clean.",
    };
  }
};
