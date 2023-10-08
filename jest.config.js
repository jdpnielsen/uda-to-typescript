/** @type {import('jest').Config} */
module.exports = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	testMatch: ['**/*.spec.ts'],
	collectCoverageFrom: [
		'<rootDir>/src/**/*.ts',
		'!<rootDir>/src/**/*.spec.ts',
		'!<rootDir>/src/__tests__/**/*.ts',
		'!<rootDir>/src/types/**/*.ts',
		'!<rootDir>/src/cli.ts',
	],
	collectCoverage: true,
	transform: {
		'^.+\\.ts$': ['ts-jest', {
			babel: true,
			tsconfig: 'tsconfig.test.json',
		}]
	},
};
