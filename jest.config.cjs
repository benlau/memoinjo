/*
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

module.exports = {
    preset: "ts-jest",
    testEnvironment: "jsdom",
    moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
    transform: {
        "^.+\\.tsx?$": "ts-jest",
        "^.+\\.jsx?$": "babel-jest",
    },
    testMatch: ["**/tests/**/*.(test|spec).(ts|tsx|js)"],
    testPathIgnorePatterns: ["/node_modules/", "/bower_components/"],
    setupFiles: ["<rootDir>/tests/setupTests.js"],
};
