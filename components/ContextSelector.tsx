'use client';

import { Brain, Bug, Zap, Check, Info } from 'lucide-react';

export type ContextType = 'understanding' | 'debugging' | 'optimization';

interface ContextOption {
  value: ContextType;
  label: string;
  labelHi: string;
  description: string;
  descriptionHi: string;
  icon: React.ComponentType<{ className?: string }>;
  color: 'indigo' | 'red' | 'amber';
}

const contexts: ContextOption[] = [
  {
    value: 'understanding',
    label: 'Understanding Logic',
    labelHi: 'Logic समझना',
    description: 'Learn how the code works step by step',
    descriptionHi: 'Code कैसे काम करता है समझें',
    icon: Brain,
    color: 'indigo',
  },
  {
    value: 'debugging',
    label: 'Debugging Issue',
    labelHi: 'Bug ठीक करना',
    description: 'Find and fix problems in the code',
    descriptionHi: 'Problems ढूंढें और ठीक करें',
    icon: Bug,
    color: 'red',
  },
  {
    value: 'optimization',
    label: 'Optimizing Performance',
    labelHi: 'Performance बढ़ाना',
    description: 'Improve code efficiency and speed',
    descriptionHi: 'Code की efficiency बढ़ाएं',
    icon: Zap,
    color: 'amber',
  }
];

const colorMap = {
  indigo: {
    border: 'border-indigo-500',
    bg: 'bg-indigo-50',
    ring: 'ring-indigo-500/20',
    iconBg: 'bg-indigo-100',
    iconText: 'text-indigo-600',
    iconBgHover: 'group-hover:bg-indigo-50',
    iconTextHover: 'group-hover:text-indigo-500',
    checkBg: 'bg-indigo-500',
  },
  red: {
    border: 'border-red-500',
    bg: 'bg-red-50',
    ring: 'ring-red-500/20',
    iconBg: 'bg-red-100',
    iconText: 'text-red-600',
    iconBgHover: 'group-hover:bg-red-50',
    iconTextHover: 'group-hover:text-red-500',
    checkBg: 'bg-red-500',
  },
  amber: {
    border: 'border-amber-500',
    bg: 'bg-amber-50',
    ring: 'ring-amber-500/20',
    iconBg: 'bg-amber-100',
    iconText: 'text-amber-600',
    iconBgHover: 'group-hover:bg-amber-50',
    iconTextHover: 'group-hover:text-amber-500',
    checkBg: 'bg-amber-500',
  },
};

interface ContextSelectorProps {
  value: ContextType | null;
  onChange: (context: ContextType) => void;
  language?: 'en' | 'hi';
}

export default function ContextSelector({
  value,
  onChange,
  language = 'en'
}: ContextSelectorProps) {
  const isHindi = language === 'hi';

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-slate-700">
        {isHindi ? 'अपना goal चुनें:' : 'Choose your goal:'}
        <span className="text-red-500 ml-1">*</span>
      </label>
      
      <div className="space-y-2">
        {contexts.map((context) => {
          const colors = colorMap[context.color];
          const Icon = context.icon;
          const isSelected = value === context.value;
          
          return (
            <button
              key={context.value}
              type="button"
              onClick={() => onChange(context.value)}
              className={`
                w-full text-left p-4 rounded-xl border-2 transition-all duration-200 group
                ${isSelected
                  ? `${colors.border} ${colors.bg} ring-2 ${colors.ring} scale-[1.02]`
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                }
              `}
            >
              <div className="flex items-center gap-4">
                {/* Icon container */}
                <div className={`
                  w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors
                  ${isSelected
                    ? `${colors.iconBg} ${colors.iconText}`
                    : `bg-slate-100 text-slate-400 ${colors.iconBgHover} ${colors.iconTextHover}`
                  }
                `}>
                  <Icon className="w-5 h-5" />
                </div>
                
                {/* Text */}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-slate-900 text-[15px]">
                    {isHindi ? context.labelHi : context.label}
                  </div>
                  <div className="text-sm text-slate-500 mt-0.5">
                    {isHindi ? context.descriptionHi : context.description}
                  </div>
                </div>
                
                {/* Checkmark */}
                {isSelected && (
                  <div className={`w-6 h-6 rounded-full ${colors.checkBg} flex items-center justify-center`}>
                    <Check className="w-3.5 h-3.5 text-white" />
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
      
      <p className="text-xs text-slate-400 mt-4 flex items-center gap-1.5">
        <Info className="w-3.5 h-3.5" />
        {isHindi 
          ? 'यह हमें सही questions पूछने में मदद करता है'
          : 'This helps us ask the right diagnostic questions'
        }
      </p>
    </div>
  );
}
