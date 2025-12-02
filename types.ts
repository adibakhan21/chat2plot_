export interface DataRow {
  [key: string]: string | number | boolean | null;
}

export interface ChartConfig {
  type: 'bar' | 'line' | 'area' | 'scatter' | 'pie';
  xAxisKey: string;
  series: Array<{
    dataKey: string;
    name?: string;
    color?: string;
  }>;
  title?: string;
  description?: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string; // The text content
  chartConfig?: ChartConfig; // Optional chart configuration
  timestamp: number;
}

export interface AnalysisResponse {
  answer: string;
  visualization?: ChartConfig;
}
