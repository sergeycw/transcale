// Jest setup file for DOM testing

// Mock chrome extension APIs if needed
(globalThis as any).chrome = {
  storage: {
    local: {
      get: jest.fn(),
      set: jest.fn(),
    },
  },
};