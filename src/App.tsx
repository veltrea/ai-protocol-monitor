import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Trash2, Pause, Play, Download, Search, ChevronDown, ChevronRight } from 'lucide-react';

interface ProtocolLogEntry {
    timestamp: number;
    direction: 'request' | 'response' | 'tool' | 'raw';
    content: string;
    metadata?: any;
    requestId?: string;
}

const App = () => {
    const [logs, setLogs] = useState<ProtocolLogEntry[]>([]);
    const [isPaused, setIsPaused] = useState(false);
    const [autoScroll, setAutoScroll] = useState(true);
    const [filter, setFilter] = useState('');
    const [expandedMetadata, setExpandedMetadata] = useState<Set<number>>(new Set());
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const socket = new WebSocket('ws://localhost:5175');

        socket.onopen = () => {
            console.log('Connected to Log Server');
        };

        socket.onmessage = (event) => {
            try {
                const entry = JSON.parse(event.data);
                if (entry) {
                    setLogs(prev => {
                        // Handle streaming: If same requestId and direction is response/tool, append or merge
                        if (entry.requestId) {
                            const lastIndex = [...prev].reverse().findIndex(l => l.requestId === entry.requestId && l.direction === entry.direction);
                            if (lastIndex !== -1) {
                                const index = prev.length - 1 - lastIndex;
                                // If it's a response and looks like a stream (short content), append
                                if (entry.direction === 'response' && entry.content.length < 500) {
                                    const newLogs = [...prev];
                                    newLogs[index] = { ...newLogs[index], content: newLogs[index].content + entry.content, timestamp: entry.timestamp };
                                    return newLogs;
                                }
                            }
                        }

                        const newLogs = [...prev, entry];
                        return newLogs.slice(-1000); // Keep last 1000
                    });
                }
            } catch (e) {
                console.error('Failed to parse log entry:', e);
            }
        };

        socket.onerror = (error) => {
            console.error('WebSocket Error:', error);
        };

        return () => socket.close();
    }, []);

    useEffect(() => {
        if (autoScroll && scrollRef.current && !isPaused) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [logs, autoScroll, isPaused]);

    const toggleMetadata = (index: number) => {
        const newSet = new Set(expandedMetadata);
        if (newSet.has(index)) newSet.delete(index);
        else newSet.add(index);
        setExpandedMetadata(newSet);
    };

    const filteredLogs = logs.filter(log =>
        log.content.toLowerCase().includes(filter.toLowerCase()) ||
        log.direction.toLowerCase().includes(filter.toLowerCase())
    );

    const clearLogs = () => {
        setLogs([]);
        setExpandedMetadata(new Set());
    };

    const exportLogs = () => {
        const data = JSON.stringify(logs, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ai-protocol-viewer-${new Date().toISOString()}.json`;
        a.click();
    };

    return (
        <div className="flex flex-col h-screen w-screen bg-[#1e1e1e] text-[#d4d4d4] font-mono selection:bg-[#264f78]">
            {/* Header */}
            <header className="flex items-center justify-between px-4 py-2 bg-[#252526] border-b border-[#333] select-none">
                <div className="flex items-center gap-2">
                    <Terminal size={16} className="text-teal-400" />
                    <h1 className="text-sm font-bold tracking-tight">AI Protocol Viewer</h1>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-900/30 text-blue-300 border border-blue-800/50">MIT</span>
                    <span className={`w-2 h-2 rounded-full ${isPaused ? 'bg-yellow-500' : 'bg-green-500'} animate-pulse`}></span>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Filter logs..."
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="bg-[#1e1e1e] border border-[#333] rounded px-8 py-1 text-xs focus:border-teal-500 focus:outline-none w-48 transition-all"
                        />
                    </div>

                    <div className="flex items-center gap-1 bg-[#1e1e1e] rounded p-1">
                        <button
                            onClick={() => setIsPaused(!isPaused)}
                            className={`p-1.5 rounded hover:bg-[#333] transition-colors ${isPaused ? 'text-yellow-500' : 'text-gray-400'}`}
                            title={isPaused ? "Resume" : "Pause"}
                        >
                            {isPaused ? <Play size={14} /> : <Pause size={14} />}
                        </button>
                        <button
                            onClick={clearLogs}
                            className="p-1.5 rounded hover:bg-[#333] text-gray-400 hover:text-red-400 transition-colors"
                            title="Clear Logs"
                        >
                            <Trash2 size={14} />
                        </button>
                        <button
                            onClick={exportLogs}
                            className="p-1.5 rounded hover:bg-[#333] text-gray-400 hover:text-teal-400 transition-colors"
                            title="Export as JSON"
                        >
                            <Download size={14} />
                        </button>
                    </div>
                </div>
            </header>

            {/* Log View */}
            <main
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-[#333] scrollbar-track-transparent"
            >
                {filteredLogs.map((log, i) => (
                    <div key={i} className="group flex gap-4 animate-in fade-in duration-300">
                        <div className={`w-1 shrink-0 rounded-full ${getDirectionColor(log.direction)} opacity-50`}></div>
                        <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between opacity-40 text-[10px] select-none">
                                <div className="flex items-center gap-2">
                                    <span>[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                                    <span className="uppercase font-bold">{log.direction}</span>
                                    {log.requestId && <span>ID: {log.requestId}</span>}
                                </div>
                                {log.metadata && (
                                    <button
                                        onClick={() => toggleMetadata(i)}
                                        className="flex items-center gap-1 hover:text-teal-400 transition-colors"
                                    >
                                        {expandedMetadata.has(i) ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
                                        Metadata
                                    </button>
                                )}
                            </div>
                            <pre className="whitespace-pre-wrap break-all text-[12px] leading-relaxed bg-[#1a1a1a] p-2 rounded border border-transparent group-hover:border-[#333] transition-all">
                                {log.content}
                            </pre>
                            {expandedMetadata.has(i) && log.metadata && (
                                <div className="mt-2 p-2 bg-[#0d0d0d] rounded border border-[#333] text-[10px] animate-in slide-in-from-top-1 duration-200">
                                    <pre className="text-blue-300 overflow-x-auto">
                                        {JSON.stringify(log.metadata, null, 2)}
                                    </pre>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                {filteredLogs.length === 0 && logs.length > 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-gray-600 italic">
                        <Search size={48} className="mb-4 opacity-10" />
                        <p>No matching logs found</p>
                    </div>
                )}
                {logs.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-gray-600 italic">
                        <Terminal size={48} className="mb-4 opacity-10" />
                        <p>Waiting for incoming logs on ws://localhost:5175 ...</p>
                    </div>
                )}
            </main>

            {/* Footer / Status Bar */}
            <footer className="px-4 py-1 bg-[#007acc] text-white text-[10px] flex justify-between select-none">
                <div className="flex gap-4">
                    <span>{filteredLogs.length} entries</span>
                    <span>MIT Licensed</span>
                </div>
                <div className="flex gap-4">
                    <label className="flex items-center gap-1 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={autoScroll}
                            onChange={(e) => setAutoScroll(e.target.checked)}
                            className="w-3 h-3"
                        />
                        Auto-scroll
                    </label>
                    <span className="opacity-80">Zero-Touch Interception Active</span>
                </div>
            </footer>
        </div>
    );
};

const getDirectionColor = (direction: string) => {
    switch (direction) {
        case 'request': return 'bg-teal-400';
        case 'response': return 'bg-orange-400';
        case 'tool': return 'bg-blue-400';
        case 'raw': return 'bg-gray-400';
        default: return 'bg-gray-400';
    }
};

export default App;
