'use client';

import { useState, useEffect } from 'react';
import { Code2, AlertTriangle } from 'lucide-react';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: string;
  readOnly?: boolean;
  maxLines?: number;
}

export default function CodeEditorSimple({
  value,
  onChange,
  language = 'javascript',
  readOnly = false,
  maxLines = 500
}: CodeEditorProps) {
  const [lineCount, setLineCount] = useState(0);
  const [isOverLimit, setIsOverLimit] = useState(false);

  useEffect(() => {
    const lines = value.split('\n').length;
    setLineCount(lines);
    setIsOverLimit(lines > maxLines);
  }, [value, maxLines]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const lines = newValue.split('\n').length;
    if (lines <= maxLines) {
      onChange(newValue);
    }
  };

  const getFileExtension = (lang: string): string => {
    const extensions: { [key: string]: string } = {
      'javascript': 'js', 'typescript': 'ts', 'python': 'py', 'java': 'java',
      'cpp': 'cpp', 'c': 'c', 'go': 'go', 'rust': 'rs', 'ruby': 'rb',
      'php': 'php', 'swift': 'swift', 'kotlin': 'kt', 'csharp': 'cs',
    };
    return extensions[lang] || 'txt';
  };

  const fileName = `code_snippet.${getFileExtension(language)}`;
  const displayName = language.charAt(0).toUpperCase() + language.slice(1);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 bg-slate-900 rounded-2xl overflow-hidden shadow-lg border border-slate-700/50 flex flex-col">
        {/* Window chrome toolbar */}
        <div className="bg-slate-800 px-4 py-2.5 flex items-center gap-3 border-b border-slate-700/50 flex-shrink-0">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-amber-400/80" />
            <div className="w-3 h-3 rounded-full bg-emerald-400/80" />
          </div>
          
          <div className="flex items-center gap-2 flex-1 justify-center">
            <span className="text-slate-400 text-xs font-mono">{fileName}</span>
            {!readOnly && value.trim().length > 10 && (
              <span className="text-[10px] px-1.5 py-0.5 bg-indigo-500/20 text-indigo-300 rounded font-semibold">
                {displayName}
              </span>
            )}
          </div>
          
          <span className={`text-xs font-mono px-2 py-0.5 rounded-full ${
            isOverLimit ? 'bg-red-500/20 text-red-400' : 'bg-slate-700 text-slate-400'
          }`}>
            {lineCount} / {maxLines}
          </span>
        </div>

        {/* Textarea container */}
        <div className="flex-1 p-4 relative">
          {/* Empty state overlay - shows behind textarea */}
          {!value && !readOnly && (
            <div className="absolute inset-4 flex flex-col items-center justify-center pointer-events-none z-0">
              <div className="w-14 h-14 bg-slate-800 rounded-2xl flex items-center justify-center mb-4 border border-slate-700">
                <Code2 className="w-7 h-7 text-indigo-400" />
              </div>
              <p className="text-slate-400 font-medium text-base mb-1">Paste your code here</p>
              <p className="text-slate-500 text-sm">JavaScript, Python, or any language · 10+ lines</p>
            </div>
          )}
          
          <textarea
            value={value}
            onChange={handleChange}
            readOnly={readOnly}
            className="w-full h-full bg-transparent text-slate-100 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/50 relative z-10"
            style={{ lineHeight: '1.6', tabSize: 2, minHeight: '320px' }}
            placeholder=""
            spellCheck={false}
          />
        </div>
      </div>
      
      {isOverLimit && (
        <div className="mt-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-sm flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
          <p className="text-amber-600">
            Tip: Focus on the confusing part — 20-50 lines work best for diagnosis
          </p>
        </div>
      )}
    </div>
  );
}
