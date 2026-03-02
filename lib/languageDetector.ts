// Language detection utility for code snippets

export interface LanguageDetectionResult {
  language: string;
  confidence: number;
  fileExtension: string;
}

interface LanguagePattern {
  language: string;
  fileExtension: string;
  patterns: RegExp[];
  keywords: string[];
  weights: {
    pattern: number;
    keyword: number;
  };
}

const languagePatterns: LanguagePattern[] = [
  {
    language: 'python',
    fileExtension: 'py',
    patterns: [
      /^import\s+\w+/m,
      /^from\s+\w+\s+import/m,
      /def\s+\w+\s*\(/,
      /if\s+__name__\s*==\s*['"]__main__['"]/,
      /print\s*\(/,
      /class\s+\w+.*:/,
      /elif\s+/,
      /@\w+/m, // decorators
    ],
    keywords: ['def', 'import', 'from', 'class', 'if', 'elif', 'else', 'for', 'while', 'try', 'except', 'finally', 'with', 'as', 'lambda', 'yield', 'return', 'pass', 'break', 'continue'],
    weights: { pattern: 3, keyword: 1 }
  },
  {
    language: 'javascript',
    fileExtension: 'js',
    patterns: [
      /function\s+\w+\s*\(/,
      /const\s+\w+\s*=/,
      /let\s+\w+\s*=/,
      /var\s+\w+\s*=/,
      /=>\s*{?/,
      /console\.(log|error|warn)/,
      /require\s*\(/,
      /module\.exports/,
      /export\s+(default|const|function|class)/,
    ],
    keywords: ['function', 'const', 'let', 'var', 'return', 'if', 'else', 'for', 'while', 'switch', 'case', 'break', 'continue', 'try', 'catch', 'finally', 'async', 'await', 'class', 'extends', 'import', 'export'],
    weights: { pattern: 3, keyword: 1 }
  },
  {
    language: 'typescript',
    fileExtension: 'ts',
    patterns: [
      /:\s*(string|number|boolean|any|void|never|unknown)\b/,
      /interface\s+\w+/,
      /type\s+\w+\s*=/,
      /<\w+>/,
      /as\s+\w+/,
      /enum\s+\w+/,
      /implements\s+\w+/,
    ],
    keywords: ['interface', 'type', 'enum', 'namespace', 'declare', 'abstract', 'implements', 'readonly', 'private', 'public', 'protected'],
    weights: { pattern: 4, keyword: 2 }
  },
  {
    language: 'java',
    fileExtension: 'java',
    patterns: [
      /public\s+class\s+\w+/,
      /private\s+(static\s+)?(final\s+)?\w+\s+\w+/,
      /public\s+(static\s+)?(void|int|String|boolean)\s+\w+\s*\(/,
      /System\.out\.print/,
      /import\s+java\./,
      /@Override/,
      /new\s+\w+\s*\(/,
    ],
    keywords: ['public', 'private', 'protected', 'class', 'interface', 'extends', 'implements', 'static', 'final', 'void', 'int', 'String', 'boolean', 'double', 'float', 'long', 'char', 'byte', 'short'],
    weights: { pattern: 3, keyword: 1 }
  },
  {
    language: 'cpp',
    fileExtension: 'cpp',
    patterns: [
      /#include\s*[<"]/,
      /std::/,
      /cout\s*<</,
      /cin\s*>>/,
      /int\s+main\s*\(/,
      /namespace\s+\w+/,
      /template\s*</,
      /class\s+\w+\s*{/,
    ],
    keywords: ['include', 'namespace', 'using', 'template', 'class', 'struct', 'public', 'private', 'protected', 'virtual', 'override', 'const', 'static', 'void', 'int', 'double', 'float', 'char', 'bool'],
    weights: { pattern: 3, keyword: 1 }
  },
  {
    language: 'c',
    fileExtension: 'c',
    patterns: [
      /#include\s*[<"]/,
      /int\s+main\s*\(/,
      /printf\s*\(/,
      /scanf\s*\(/,
      /malloc\s*\(/,
      /free\s*\(/,
      /struct\s+\w+/,
    ],
    keywords: ['include', 'define', 'typedef', 'struct', 'union', 'enum', 'void', 'int', 'char', 'float', 'double', 'long', 'short', 'unsigned', 'signed', 'const', 'static', 'extern'],
    weights: { pattern: 3, keyword: 1 }
  },
  {
    language: 'go',
    fileExtension: 'go',
    patterns: [
      /package\s+\w+/,
      /func\s+\w+\s*\(/,
      /import\s+\(/,
      /fmt\.Print/,
      /:=/,
      /go\s+\w+\(/,
      /defer\s+/,
      /chan\s+/,
    ],
    keywords: ['package', 'import', 'func', 'var', 'const', 'type', 'struct', 'interface', 'map', 'chan', 'go', 'defer', 'select', 'range', 'return', 'break', 'continue', 'fallthrough'],
    weights: { pattern: 3, keyword: 1 }
  },
  {
    language: 'rust',
    fileExtension: 'rs',
    patterns: [
      /fn\s+\w+\s*\(/,
      /let\s+mut\s+/,
      /impl\s+\w+/,
      /use\s+\w+::/,
      /println!\s*\(/,
      /match\s+\w+\s*{/,
      /::\w+/,
    ],
    keywords: ['fn', 'let', 'mut', 'const', 'static', 'struct', 'enum', 'impl', 'trait', 'use', 'mod', 'pub', 'match', 'if', 'else', 'loop', 'while', 'for', 'return', 'break', 'continue'],
    weights: { pattern: 3, keyword: 1 }
  },
  {
    language: 'ruby',
    fileExtension: 'rb',
    patterns: [
      /def\s+\w+/,
      /end\b/,
      /puts\s+/,
      /class\s+\w+/,
      /module\s+\w+/,
      /require\s+['"][\w\/]+['"]/,
      /@\w+/,
      /do\s*\|/,
    ],
    keywords: ['def', 'end', 'class', 'module', 'if', 'elsif', 'else', 'unless', 'case', 'when', 'while', 'until', 'for', 'do', 'begin', 'rescue', 'ensure', 'return', 'yield', 'require', 'include'],
    weights: { pattern: 3, keyword: 1 }
  },
  {
    language: 'php',
    fileExtension: 'php',
    patterns: [
      /<\?php/,
      /\$\w+\s*=/,
      /function\s+\w+\s*\(/,
      /echo\s+/,
      /class\s+\w+/,
      /namespace\s+\w+/,
      /use\s+\w+\\/,
      /->/,
    ],
    keywords: ['function', 'class', 'interface', 'trait', 'namespace', 'use', 'public', 'private', 'protected', 'static', 'final', 'abstract', 'extends', 'implements', 'return', 'echo', 'print', 'if', 'else', 'elseif', 'foreach', 'while', 'for'],
    weights: { pattern: 3, keyword: 1 }
  },
  {
    language: 'swift',
    fileExtension: 'swift',
    patterns: [
      /func\s+\w+\s*\(/,
      /var\s+\w+:\s*\w+/,
      /let\s+\w+:\s*\w+/,
      /import\s+\w+/,
      /class\s+\w+/,
      /struct\s+\w+/,
      /protocol\s+\w+/,
      /extension\s+\w+/,
    ],
    keywords: ['func', 'var', 'let', 'class', 'struct', 'enum', 'protocol', 'extension', 'import', 'if', 'else', 'guard', 'switch', 'case', 'for', 'while', 'return', 'break', 'continue', 'defer'],
    weights: { pattern: 3, keyword: 1 }
  },
  {
    language: 'kotlin',
    fileExtension: 'kt',
    patterns: [
      /fun\s+\w+\s*\(/,
      /val\s+\w+/,
      /var\s+\w+/,
      /class\s+\w+/,
      /object\s+\w+/,
      /companion\s+object/,
      /data\s+class/,
      /when\s*\(/,
    ],
    keywords: ['fun', 'val', 'var', 'class', 'object', 'interface', 'data', 'sealed', 'open', 'abstract', 'companion', 'when', 'if', 'else', 'for', 'while', 'return', 'break', 'continue'],
    weights: { pattern: 3, keyword: 1 }
  },
  {
    language: 'csharp',
    fileExtension: 'cs',
    patterns: [
      /using\s+System/,
      /namespace\s+\w+/,
      /public\s+class\s+\w+/,
      /private\s+\w+\s+\w+/,
      /Console\.Write/,
      /async\s+Task/,
      /\[.*\]/m, // attributes
    ],
    keywords: ['using', 'namespace', 'class', 'interface', 'struct', 'enum', 'public', 'private', 'protected', 'internal', 'static', 'readonly', 'const', 'void', 'int', 'string', 'bool', 'double', 'float', 'async', 'await'],
    weights: { pattern: 3, keyword: 1 }
  },
  {
    language: 'sql',
    fileExtension: 'sql',
    patterns: [
      /SELECT\s+.*\s+FROM/i,
      /INSERT\s+INTO/i,
      /UPDATE\s+\w+\s+SET/i,
      /DELETE\s+FROM/i,
      /CREATE\s+TABLE/i,
      /ALTER\s+TABLE/i,
      /DROP\s+TABLE/i,
      /JOIN\s+\w+\s+ON/i,
    ],
    keywords: ['SELECT', 'FROM', 'WHERE', 'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'ALTER', 'DROP', 'TABLE', 'INDEX', 'VIEW', 'JOIN', 'LEFT', 'RIGHT', 'INNER', 'OUTER', 'ON', 'GROUP', 'ORDER', 'BY', 'HAVING', 'LIMIT'],
    weights: { pattern: 4, keyword: 2 }
  },
  {
    language: 'html',
    fileExtension: 'html',
    patterns: [
      /<html/i,
      /<head>/i,
      /<body>/i,
      /<div/i,
      /<span/i,
      /<p>/i,
      /<a\s+href/i,
      /<!DOCTYPE/i,
    ],
    keywords: ['html', 'head', 'body', 'div', 'span', 'p', 'a', 'img', 'ul', 'ol', 'li', 'table', 'tr', 'td', 'form', 'input', 'button'],
    weights: { pattern: 4, keyword: 1 }
  },
  {
    language: 'css',
    fileExtension: 'css',
    patterns: [
      /\.\w+\s*{/,
      /#\w+\s*{/,
      /\w+\s*:\s*[^;]+;/,
      /@media/,
      /@import/,
      /:\s*rgba?\(/,
      /:\s*#[0-9a-fA-F]{3,6}/,
    ],
    keywords: ['color', 'background', 'border', 'margin', 'padding', 'width', 'height', 'display', 'position', 'font', 'text', 'flex', 'grid'],
    weights: { pattern: 3, keyword: 1 }
  },
  {
    language: 'json',
    fileExtension: 'json',
    patterns: [
      /^\s*{/,
      /^\s*\[/,
      /"\w+"\s*:/,
      /:\s*"[^"]*"/,
      /:\s*\d+/,
      /:\s*(true|false|null)/,
    ],
    keywords: [],
    weights: { pattern: 2, keyword: 0 }
  },
  {
    language: 'yaml',
    fileExtension: 'yaml',
    patterns: [
      /^\w+:/m,
      /^\s+-\s+\w+/m,
      /:\s*$/m,
      /---/,
      /\.\.\./,
    ],
    keywords: [],
    weights: { pattern: 2, keyword: 0 }
  },
];

export function detectLanguage(code: string): LanguageDetectionResult {
  if (!code || code.trim().length === 0) {
    return {
      language: 'javascript',
      confidence: 0,
      fileExtension: 'js'
    };
  }

  const scores: { [key: string]: { score: number; fileExtension: string } } = {};

  // Initialize scores
  languagePatterns.forEach(lang => {
    scores[lang.language] = { score: 0, fileExtension: lang.fileExtension };
  });

  // Score based on patterns
  languagePatterns.forEach(lang => {
    lang.patterns.forEach(pattern => {
      if (pattern.test(code)) {
        scores[lang.language].score += lang.weights.pattern;
      }
    });

    // Score based on keywords
    const codeWords = code.toLowerCase().split(/\W+/);
    lang.keywords.forEach(keyword => {
      if (codeWords.includes(keyword.toLowerCase())) {
        scores[lang.language].score += lang.weights.keyword;
      }
    });
  });

  // Find the language with the highest score
  let maxScore = 0;
  let detectedLanguage = 'javascript';
  let fileExtension = 'js';

  Object.entries(scores).forEach(([lang, data]) => {
    if (data.score > maxScore) {
      maxScore = data.score;
      detectedLanguage = lang;
      fileExtension = data.fileExtension;
    }
  });

  // Calculate confidence (0-100)
  const totalPossibleScore = languagePatterns.reduce((sum, lang) => {
    return sum + (lang.patterns.length * lang.weights.pattern) + (lang.keywords.length * lang.weights.keyword);
  }, 0);
  
  const confidence = Math.min(100, Math.round((maxScore / Math.max(totalPossibleScore * 0.1, 1)) * 100));

  return {
    language: detectedLanguage,
    confidence,
    fileExtension
  };
}

export function getLanguageDisplayName(language: string): string {
  const displayNames: { [key: string]: string } = {
    'javascript': 'JavaScript',
    'typescript': 'TypeScript',
    'python': 'Python',
    'java': 'Java',
    'cpp': 'C++',
    'c': 'C',
    'go': 'Go',
    'rust': 'Rust',
    'ruby': 'Ruby',
    'php': 'PHP',
    'swift': 'Swift',
    'kotlin': 'Kotlin',
    'csharp': 'C#',
    'sql': 'SQL',
    'html': 'HTML',
    'css': 'CSS',
    'json': 'JSON',
    'yaml': 'YAML',
  };

  return displayNames[language] || language.charAt(0).toUpperCase() + language.slice(1);
}
