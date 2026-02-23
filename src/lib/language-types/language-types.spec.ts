import { describe, expect, it } from 'vitest';
import type { ArtifactContainer } from '../helpers/collect-artifacts';
import { printType } from '../helpers/test';
import type { Language } from '../types/language';
import { languageHandler } from './index';

describe('languageHandler', async () => {
	it('should handle a single language configuration', () => {
		const artifacts = {
			language: new Map<string, Language>([
				['en-US', {
					Name: 'English (United States)',
					Alias: 'en-US',
					IsoCode: 'en-US',
					IsDefault: true,
					Udi: 'umb://language/en-US',
					Dependencies: [],
					__type: 'Umbraco.Deploy.Infrastructure,Umbraco.Deploy.Infrastructure.Artifacts.LanguageArtifact',
					__version: '17.0.1',
				}],
			] as const),
		} as ArtifactContainer;

		const output = languageHandler.build({ artifacts });

		const value = printType(output);

		expect(value).toMatchInlineSnapshot(`
			"export const Language = {
			    EnglishUnitedStates: "en-US"
			} as const;
			export type Language = (typeof Language)[keyof typeof Language];
			export type Cultures = {
			    ["en-US"]?: ContentRoute;
			};
			"
		`);
	});

	it('should handle a multi language configuration', () => {
		const artifacts = {
			language: new Map<string, Language>([
				['en-US', {
					Name: 'English (United States)',
					Alias: 'en-US',
					IsoCode: 'en-US',
					IsDefault: true,
					Udi: 'umb://language/en-US',
					Dependencies: [],
					__type: 'Umbraco.Deploy.Infrastructure,Umbraco.Deploy.Infrastructure.Artifacts.LanguageArtifact',
					__version: '17.0.1',
				}],
				['da-DK', {
					Name: 'Danish (Denmark)',
					Alias: 'da-DK',
					IsoCode: 'da-DK',
					IsDefault: false,
					Udi: 'umb://language/da-DK',
					Dependencies: [],
					__type: 'Umbraco.Deploy.Infrastructure,Umbraco.Deploy.Infrastructure.Artifacts.LanguageArtifact',
					__version: '17.0.1',
				}],
			] as const),
		} as ArtifactContainer;

		const output = languageHandler.build({ artifacts });

		const value = printType(output);

		expect(value).toMatchInlineSnapshot(`
			"export const Language = {
			    EnglishUnitedStates: "en-US",
			    DanishDenmark: "da-DK"
			} as const;
			export type Language = (typeof Language)[keyof typeof Language];
			export type Cultures = {
			    ["en-US"]?: ContentRoute;
			    ["da-DK"]?: ContentRoute;
			};
			"
		`);
	});

	it('should handle a mandatory language', () => {
		const artifacts = {
			language: new Map<string, Language>([
				['en-US', {
					Name: 'English (United States)',
					Alias: 'en-US',
					IsoCode: 'en-US',
					IsDefault: true,
					Udi: 'umb://language/en-US',
					Dependencies: [],
					__type: 'Umbraco.Deploy.Infrastructure,Umbraco.Deploy.Infrastructure.Artifacts.LanguageArtifact',
					__version: '17.0.1',
				}],
				['da-DK', {
					Name: 'Danish (Denmark)',
					Alias: 'da-DK',
					IsoCode: 'da-DK',
					IsDefault: false,
					IsMandatory: true,
					Udi: 'umb://language/da-DK',
					Dependencies: [],
					__type: 'Umbraco.Deploy.Infrastructure,Umbraco.Deploy.Infrastructure.Artifacts.LanguageArtifact',
					__version: '17.0.1',
				}],
			] as const),
		} as ArtifactContainer;

		const output = languageHandler.build({ artifacts });

		const value = printType(output);

		expect(value).toMatchInlineSnapshot(`
			"export const Language = {
			    EnglishUnitedStates: "en-US",
			    DanishDenmark: "da-DK"
			} as const;
			export type Language = (typeof Language)[keyof typeof Language];
			export type Cultures = {
			    ["en-US"]?: ContentRoute;
			    ["da-DK"]: ContentRoute;
			};
			"
		`);
	});

	it('should no languages', () => {
		const artifacts = {
			language: new Map<string, Language>(),
		} as ArtifactContainer;

		const output = languageHandler.build({ artifacts });

		const value = printType(output);

		expect(value).toMatchInlineSnapshot(`
			"export const Language = {} as const;
			export type Language = (typeof Language)[keyof typeof Language];
			export type Cultures = {
			    [culture: string]: ContentRoute;
			};
			"
		`);
	});
});
