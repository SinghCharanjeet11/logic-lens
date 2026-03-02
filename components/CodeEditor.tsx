'use client';

import { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { Code2, AlertTriangle } from 'lucide-react';
import { getLanguageDisplayName } from '@/lib/languageDetector';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: string;
  readOnly?: boolean;
  maxLines?: number;
}

export default function CodeEditor({
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

  const handleEditorChange = (newValue: string | undefined) => {
    if (newValue !== undefined) {
      const lines = newValue.split('\n').length;
      if (lines <= maxLines) {
        onChange(newValue);
      }
    }
  };

  // Get file extension based on language
  const getFileExtension = (lang: string): string => {
    const extensions: { [key: string]: string } = {
      'javascript': 'js',
      'typescript': 'ts',
      'python': 'py',
      'java': 'java',
      'cpp': 'cpp',
      'c': 'c',
      'go': 'go',
      'rust': 'rs',
      'ruby': 'rb',
      'php': 'php',
      'swift': 'swift',
      'kotlin': 'kt',
      'csharp': 'cs',
      'sql': 'sql',
      'html': 'html',
      'css': 'css',
      'json': 'json',
      'yaml': 'yaml',
    };
    return extensions[lang] || 'txt';
  };

  const fileName = `code_snippet.${getFileExtension(language)}`;
  const displayName = getLanguageDisplayName(language);

  return (
    <div className="flex flex-col h-full">
      {/* Dark editor container with macOS-style toolbar */}
      <div className="flex-1 bg-slate-900 rounded-2xl overflow-hidden shadow-lg border border-slate-700/50 relative">
        {/* Window chrome toolbar */}
        <div className="bg-slate-800 px-4 py-2.5 flex items-center gap-3 border-b border-slate-700/50">
          {/* Traffic light dots */}
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/80 hover:bg-red-500 transition-colors" />
            <div className="w-3 h-3 rounded-full bg-amber-400/80 hover:bg-amber-400 transition-colors" />
            <div className="w-3 h-3 rounded-full bg-emerald-400/80 hover:bg-emerald-400 transition-colors" />
          </div>
          
          {/* Filename with language badge */}
          <div className="flex items-center gap-2 flex-1 justify-center">
            <span className="text-slate-400 text-xs font-mono">
              {fileName}
            </span>
            {!readOnly && value.trim().length > 10 && (
              <span className="text-[10px] px-1.5 py-0.5 bg-indigo-500/20 text-indigo-300 rounded font-semibold">
                {displayName}
              </span>
            )}
          </div>
          
          {/* Line count badge */}
          <span className={`text-xs font-mono px-2 py-0.5 rounded-full ${
            isOverLimit 
              ? 'bg-red-500/20 text-red-400' 
              : 'bg-slate-700 text-slate-400'
          }`}>
            {lineCount} / {maxLines}
          </span>
        </div>

        {/* Empty state overlay */}
        {!value && !readOnly && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none" style={{ top: '48px' }}>
            <div className="w-14 h-14 bg-slate-800 rounded-2xl flex items-center justify-center mb-4 border border-slate-700">
              <Code2 className="w-7 h-7 text-indigo-400" />
            </div>
            <p className="text-slate-400 font-medium text-base mb-1">Paste your code here</p>
            <p className="text-slate-500 text-sm">JavaScript, Python, or any language · 10+ lines</p>
          </div>
        )}
        
        {/* Monaco Editor */}
        <div className="h-full">
          <Editor
            height="100%"
            language={language}
            value={value}
            onChange={handleEditorChange}
            theme="vs-dark"
            options={{
              readOnly,
              minimap: { enabled: false },
              fontSize: 13,
              lineNumbers: 'on',
              scrollBeyondLastLine: false,
              wordWrap: 'on',
              automaticLayout: true,
              tabSize: 2,
              insertSpaces: true,
              formatOnPaste: true,
              formatOnType: true,
              cursorBlinking: 'smooth',
              cursorSmoothCaretAnimation: 'on',
              padding: { top: 16, bottom: 16 },
              renderLineHighlight: 'line',
              lineDecorationsWidth: 10,
              folding: true,
              glyphMargin: false,
            }}
          />
        </div>
      </div>
      
      {/* Over-limit warning */}
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
