module.exports = {
  testURL: 'http://localhost:8000',
  moduleFileExtensions: [
    'ts', // 增加 ts、tsx，以支持单测文件中引入 typescript 模块
    'tsx',
    'js',
    'jsx',
    'json',
  ],
  setupFiles: ['<rootDir>/jestSetup.js', 'jest-canvas-mock'],
  globals: {
    'ts-jest': {
      tsConfig: './tsconfig.jest.json', // 此处指明 ts-jest 编译 typescript 时的配置文件
      diagnostics: false,
    },
  },
  testPathIgnorePatterns: ['<rootDir>/src/component/CommonIDE/test'],
  moduleNameMapper: {
    '^@/(.*)': '<rootDir>/src/$1',
    '^@@/(.*)': '<rootDir>/src/.umi/$1',
    'ahooks': '<rootDir>/node_modules/ahooks',
  },
};
