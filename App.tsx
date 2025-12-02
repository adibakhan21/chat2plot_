import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Upload, MessageSquare, BarChart2, Table, Send, Cpu, FileText, Loader2, AlertCircle } from 'lucide-react';
import { DataRow, Message, AnalysisResponse } from './types';
import { analyzeData } from './services/geminiService';
import ChartRenderer from './components/ChartRenderer';

// Simple CSV Parser (to avoid external heavyweight dependencies for this demo)
const parseCSV = (text: string): { data: DataRow[], columns: string[] } => {
  const lines = text.trim().split('\n');
  if (lines.length === 0) return { data: [], columns: [] };

  const headers = lines[0].split(',').map(h => h.trim());
  const data: DataRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',');
    if (values.length === headers.length) {
      const row: DataRow = {};
      headers.forEach((header, index) => {
        const val = values[index].trim();
        // Try to parse number
        const numVal = Number(val);
        row[header] = isNaN(numVal) ? val : numVal;
      });
      data.push(row);
    }
  }
  return { data, columns: headers };
};

const App: React.FC = () => {
  const [data, setData] = useState<DataRow[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'data'>('chat');
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, activeTab]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      try {
        const { data: parsedData, columns: parsedColumns } = parseCSV(text);
        setData(parsedData);
        setColumns(parsedColumns);
        setMessages([
          {
            id: 'init',
            role: 'assistant',
            content: `I've loaded **${file.name}** successfully! \n\nIt has ${parsedData.length} rows and columns: ${parsedColumns.join(', ')}. \n\nAsk me anything about this data!`,
            timestamp: Date.now()
          }
        ]);
        setActiveTab('data'); // Switch to data view briefly to show upload worked
        setTimeout(() => setActiveTab('chat'), 1500); // Then back to chat
      } catch (err) {
        console.error(err);
        alert("Error parsing CSV. Please ensure it is a standard CSV format.");
      }
    };
    reader.readAsText(file);
  };

  const handleSendMessage = useCallback(async () => {
    if (!inputValue.trim() || !data.length) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsAnalyzing(true);

    try {
      // Analyze data with Gemini
      const response: AnalysisResponse = await analyzeData(userMsg.content, columns, data.slice(0, 10));

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.answer,
        chartConfig: response.visualization,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Sorry, I had trouble processing that request with Gemini.",
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsAnalyzing(false);
    }
  }, [inputValue, data, columns]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#0f172a] text-slate-100 overflow-hidden">
      
      {/* Sidebar / Configuration Panel */}
      <aside className="w-80 border-r border-slate-800 bg-[#1e293b] flex flex-col shadow-2xl z-10 hidden md:flex">
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center gap-2 mb-1">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-lg">
              <BarChart2 className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
              DataAgent
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-2">Powered by Gemini 2.5 Flash</p>
        </div>

        <div className="p-6 flex-1 overflow-y-auto">
          <div className="mb-8">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Data Source</h2>
            
            <input 
              type="file" 
              accept=".csv" 
              ref={fileInputRef}
              className="hidden" 
              onChange={handleFileUpload} 
            />

            {!fileName ? (
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-slate-600 hover:border-indigo-500 hover:bg-slate-800/50 rounded-xl p-8 flex flex-col items-center justify-center transition-all group"
              >
                <Upload className="w-8 h-8 text-slate-500 group-hover:text-indigo-400 mb-2 transition-colors" />
                <span className="text-sm text-slate-400 group-hover:text-indigo-300 font-medium">Upload CSV</span>
                <span className="text-xs text-slate-600 mt-1">Drag & drop or click</span>
              </button>
            ) : (
              <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-emerald-500/20 p-2 rounded-md">
                    <FileText className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-sm font-medium text-slate-200 truncate">{fileName}</p>
                    <p className="text-xs text-slate-500">{data.length} rows analyzed</p>
                  </div>
                </div>
                <button 
                  onClick={() => { setFileName(null); setData([]); setMessages([]); }}
                  className="text-xs text-red-400 hover:text-red-300 w-full text-right mt-2"
                >
                  Remove File
                </button>
              </div>
            )}
          </div>

          {data.length > 0 && (
            <div>
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Columns</h2>
              <div className="flex flex-wrap gap-2">
                {columns.map(col => (
                  <span key={col} className="px-2 py-1 bg-slate-800 border border-slate-700 rounded text-xs text-slate-300 font-mono">
                    {col}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-800 text-center">
            <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
                <Cpu className="w-3 h-3" />
                <span>Running purely in browser</span>
            </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full relative">
        
        {/* Mobile Header */}
        <div className="md:hidden h-14 border-b border-slate-800 flex items-center px-4 bg-[#1e293b]">
           <span className="font-bold text-indigo-400">DataAgent</span>
        </div>

        {/* Tab Switcher (Visible when data exists) */}
        {data.length > 0 && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-[#1e293b] p-1 rounded-full border border-slate-700 shadow-lg z-20 flex gap-1">
            <button 
              onClick={() => setActiveTab('chat')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'chat' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
            >
              <MessageSquare className="w-3 h-3" /> Chat
            </button>
            <button 
              onClick={() => setActiveTab('data')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'data' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
            >
              <Table className="w-3 h-3" /> Data Preview
            </button>
          </div>
        )}

        {/* View: Chat */}
        <div className={`flex-1 flex flex-col h-full transition-opacity duration-300 ${activeTab === 'chat' ? 'opacity-100 z-10' : 'opacity-0 hidden'}`}>
            
            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6" ref={scrollRef}>
              
              {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-40 select-none">
                   <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center mb-6">
                      <BarChart2 className="w-10 h-10 text-slate-400" />
                   </div>
                   <h2 className="text-2xl font-bold text-slate-300 mb-2">Ready to Analyze</h2>
                   <p className="max-w-md text-slate-400">Upload a CSV file to the sidebar to get started. You can ask for trends, summaries, or specific visualizations.</p>
                </div>
              )}

              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
                  <div className={`max-w-[85%] md:max-w-2xl rounded-2xl p-5 shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-indigo-600 text-white rounded-br-none' 
                      : 'bg-[#1e293b] text-slate-200 border border-slate-700 rounded-bl-none'
                  }`}>
                    {/* Text Content */}
                    <div className="prose prose-invert prose-sm max-w-none whitespace-pre-wrap">
                      {msg.content}
                    </div>

                    {/* Chart Visualization */}
                    {msg.chartConfig && (
                       <div className="mt-4 pt-4 border-t border-slate-700/50">
                          <ChartRenderer config={msg.chartConfig} data={data} />
                       </div>
                    )}
                  </div>
                </div>
              ))}

              {isAnalyzing && (
                <div className="flex justify-start">
                  <div className="bg-[#1e293b] border border-slate-700 rounded-2xl rounded-bl-none p-4 flex items-center gap-3">
                    <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
                    <span className="text-sm text-slate-400">Analyzing data...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-4 md:p-6 bg-[#0f172a] border-t border-slate-800">
               <div className="max-w-4xl mx-auto relative">
                 <input 
                    type="text" 
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={data.length === 0 || isAnalyzing}
                    placeholder={data.length === 0 ? "Upload a CSV file first..." : "Ask a question about your data (e.g., 'Plot sales over time')"}
                    className="w-full bg-[#1e293b] text-slate-200 border border-slate-700 rounded-xl pl-5 pr-14 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all shadow-lg placeholder:text-slate-500 disabled:opacity-50 disabled:cursor-not-allowed"
                 />
                 <button 
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || data.length === 0 || isAnalyzing}
                    className="absolute right-2 top-2 p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors disabled:opacity-0 disabled:pointer-events-none"
                 >
                    <Send className="w-5 h-5" />
                 </button>
               </div>
               <div className="text-center mt-2">
                 <p className="text-[10px] text-slate-600">AI can make mistakes. Please double-check important info.</p>
               </div>
            </div>
        </div>

        {/* View: Data Preview (Simple Table) */}
        <div className={`flex-1 overflow-auto bg-[#0f172a] p-8 transition-opacity duration-300 ${activeTab === 'data' ? 'opacity-100 z-10' : 'opacity-0 hidden'}`}>
           <div className="max-w-6xl mx-auto">
              <h2 className="text-2xl font-bold text-slate-200 mb-6 flex items-center gap-3">
                 <Table className="w-6 h-6 text-indigo-400" /> 
                 Data Preview 
                 <span className="text-sm font-normal text-slate-500 ml-2">(First 100 rows)</span>
              </h2>
              
              <div className="overflow-x-auto rounded-lg border border-slate-700 shadow-xl">
                 <table className="w-full text-left text-sm text-slate-400">
                    <thead className="bg-[#1e293b] text-xs uppercase text-slate-300 font-semibold">
                       <tr>
                         {columns.map((col, idx) => (
                           <th key={idx} className="px-6 py-4 whitespace-nowrap">{col}</th>
                         ))}
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 bg-slate-900/50">
                       {data.slice(0, 100).map((row, rIdx) => (
                          <tr key={rIdx} className="hover:bg-slate-800/50 transition-colors">
                             {columns.map((col, cIdx) => (
                                <td key={`${rIdx}-${cIdx}`} className="px-6 py-4 whitespace-nowrap">
                                  {row[col]?.toString()}
                                </td>
                             ))}
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </div>
        </div>

      </main>
    </div>
  );
};

export default App;
