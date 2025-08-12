import React, { useState, useEffect, useRef } from 'react';
import { logger } from '../services/logger';
import { LogEntry } from '../types';
import CloseIcon from './icons/CloseIcon';
import ChevronDownIcon from './icons/ChevronDownIcon';

interface LogPanelProps {
    isVisible: boolean;
    onClose: () => void;
}

const LogRow: React.FC<{ entry: LogEntry }> = ({ entry }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const hasData = entry.data && Object.keys(entry.data).length > 0;

    const levelColors = {
        info: 'text-blue-600',
        warn: 'text-yellow-600',
        error: 'text-red-600',
    };

    return (
        <div className={`border-b border-light-border py-2 px-4 text-sm font-mono ${entry.level === 'error' ? 'bg-red-100/50' : ''}`}>
            <div className="flex items-start" onClick={() => hasData && setIsExpanded(!isExpanded)} style={{ cursor: hasData ? 'pointer' : 'default' }}>
                <span className="w-20 text-light-text-secondary">{entry.timestamp.toLocaleTimeString()}</span>
                <span className={`w-20 font-bold ${levelColors[entry.level]}`}>{`[${entry.level.toUpperCase()}]`}</span>
                <span className="flex-1 text-light-text-primary">{entry.message}</span>
                {hasData && <ChevronDownIcon className={`w-4 h-4 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />}
            </div>
            {hasData && isExpanded && (
                <div className="mt-2 p-2 bg-gray-100 rounded-md">
                    <pre className="text-xs text-gray-700 whitespace-pre-wrap break-all">
                        {JSON.stringify(entry.data, null, 2)}
                    </pre>
                </div>
            )}
        </div>
    );
};


const LogPanel: React.FC<LogPanelProps> = ({ isVisible, onClose }) => {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const panelBodyRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const unsubscribe = logger.subscribe((newLog) => {
            setLogs(prev => [...prev, newLog]);
        });
        return unsubscribe;
    }, []);

    useEffect(() => {
        if (panelBodyRef.current) {
            panelBodyRef.current.scrollTop = panelBodyRef.current.scrollHeight;
        }
    }, [logs]);

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 h-1/2 bg-light-surface/90 backdrop-blur-sm shadow-2xl z-50 flex flex-col border-t-2 border-sorare-blue">
            <header className="flex justify-between items-center p-2 bg-light-surface border-b border-light-border">
                <h2 className="font-bold text-lg text-light-text-primary">Debug Log</h2>
                <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200">
                    <CloseIcon className="w-6 h-6 text-light-text-secondary" />
                </button>
            </header>
            <div ref={panelBodyRef} className="flex-1 overflow-y-auto">
                {logs.map((log, index) => (
                    <LogRow key={index} entry={log} />
                ))}
            </div>
        </div>
    );
};

export default LogPanel;