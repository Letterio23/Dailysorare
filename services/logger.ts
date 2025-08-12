import { LogEntry } from '../types';

type LogListener = (entry: LogEntry) => void;

class Logger {
  private listeners: LogListener[] = [];
  private history: LogEntry[] = [];

  subscribe(listener: LogListener): () => void {
    this.listeners.push(listener);
    // Fornisce immediatamente la cronologia al nuovo sottoscrittore
    this.history.forEach(entry => listener(entry));
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  log(message: string, data?: any) {
    this._addEntry({ level: 'info', message, data, timestamp: new Date() });
  }

  error(message: string, data?: any) {
    this._addEntry({ level: 'error', message, data, timestamp: new Date() });
  }

  warn(message: string, data?: any) {
    this._addEntry({ level: 'warn', message, data, timestamp: new Date() });
  }

  private _addEntry(entry: LogEntry) {
    this.history.push(entry);
    this.listeners.forEach(l => l(entry));
  }
}

export const logger = new Logger();