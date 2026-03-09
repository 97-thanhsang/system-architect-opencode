export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  jiraUrl: 'https://task.ascvn.com.vn',
  
  // Analyze Module Configuration
  analyze: {
    debugEnabled: true,
    debugLevel: 'verbose' as 'minimal' | 'normal' | 'verbose',
    defaultProjectPath: '',
    defaultSavePath: '',
    jiraEnabled: true,
    autoDetectWorkingDirectory: true
  }
};

// Default paths (empty = auto-detect from localStorage)
export const DEFAULT_PROJECT_PATH = '';
export const DEFAULT_SAVE_PATH = '';
