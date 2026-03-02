'use client';

import { useState, useRef, useEffect } from 'react';

interface VoiceInputProps {
    onTranscript: (text: string) => void;
    language?: 'en' | 'hi';
    disabled?: boolean;
}

export default function VoiceInput({ onTranscript, language = 'en', disabled = false }: VoiceInputProps) {
    const [isListening, setIsListening] = useState(false);
    const [isSupported, setIsSupported] = useState(false);
    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        // Check browser support
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognition) {
            setIsSupported(true);
            const recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = language === 'hi' ? 'hi-IN' : 'en-US';

            recognition.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript;
                onTranscript(transcript);
                setIsListening(false);
            };

            recognition.onerror = () => {
                setIsListening(false);
            };

            recognition.onend = () => {
                setIsListening(false);
            };

            recognitionRef.current = recognition;
        }
    }, [language, onTranscript]);

    const toggleListening = () => {
        if (!recognitionRef.current) return;

        if (isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
        } else {
            // Update language before starting
            recognitionRef.current.lang = language === 'hi' ? 'hi-IN' : 'en-US';
            recognitionRef.current.start();
            setIsListening(true);
        }
    };

    if (!isSupported) return null;

    return (
        <button
            onClick={toggleListening}
            disabled={disabled}
            title={
                isListening
                    ? (language === 'hi' ? 'सुनना बंद करें' : 'Stop listening')
                    : (language === 'hi' ? 'बोलकर जवाब दें' : 'Speak your answer')
            }
            className={`
        relative p-2.5 rounded-xl transition-all duration-300 group
        ${isListening
                    ? 'bg-red-500 text-white shadow-lg shadow-red-500/30 scale-110'
                    : 'bg-slate-100 text-slate-500 hover:bg-indigo-100 hover:text-indigo-600 border border-slate-200'
                }
        ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
      `}
        >
            {/* Pulsing ring when listening */}
            {isListening && (
                <>
                    <span className="absolute inset-0 rounded-xl animate-ping bg-red-400 opacity-30" />
                    <span className="absolute -inset-1 rounded-xl animate-pulse bg-red-400 opacity-20" />
                </>
            )}

            {/* Microphone icon */}
            <svg
                className={`w-5 h-5 relative z-10 ${isListening ? 'animate-pulse' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                {isListening ? (
                    // Stop icon (square)
                    <rect x="6" y="6" width="12" height="12" rx="2" strokeWidth={2} fill="currentColor" />
                ) : (
                    // Microphone icon
                    <>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4M12 15a3 3 0 003-3V5a3 3 0 00-6 0v7a3 3 0 003 3z"
                        />
                    </>
                )}
            </svg>

            {/* Tooltip */}
            {!isListening && !disabled && (
                <span className="absolute -top-9 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-800 text-white text-[10px] rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    {language === 'hi' ? '🎤 बोलकर जवाब दें' : '🎤 Speak your answer'}
                </span>
            )}

            {/* Listening label */}
            {isListening && (
                <span className="absolute -top-9 left-1/2 -translate-x-1/2 px-2.5 py-1 bg-red-600 text-white text-[10px] rounded-md whitespace-nowrap font-semibold animate-pulse">
                    {language === 'hi' ? '🎤 सुन रहा है...' : '🎤 Listening...'}
                </span>
            )}
        </button>
    );
}
