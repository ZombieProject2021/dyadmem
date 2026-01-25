// Check if running in test build mode
const IS_TEST_BUILD = typeof process !== 'undefined' && process.env?.E2E_TEST_BUILD === "true";

export { IS_TEST_BUILD };
