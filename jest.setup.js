// Jest setup file for polyfills and global test configuration

// Polyfill for TextEncoder/TextDecoder (needed for JSDOM)
const { TextEncoder, TextDecoder } = require('util');

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
