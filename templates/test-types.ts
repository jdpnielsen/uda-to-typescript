import { BaseDocumentType, ReferencedDocument } from './base-types';

export type APage = BaseDocumentType<'aPage', {
	propValue: 'APage';
	aPage_single?: ReferencedDocument<BPage>;
	aPage_multi?: ReferencedDocument<BPage>[];
}>;

export type BPage = BaseDocumentType<'bPage', {
	propValue: 'BPage';
	bPage_single?: ReferencedDocument<CPage>;
	bPage_multi?: ReferencedDocument<CPage>[];
}>;

export type CPage = BaseDocumentType<'cPage', {
	propValue: 'CPage';
	cPage_single?: ReferencedDocument<DPage>;
	cPage_multi?: ReferencedDocument<DPage>[];
}>;

export type DPage = BaseDocumentType<'dPage', {
	propValue: 'Dpage';
	ePage_single?: ReferencedDocument<EPage>;
	ePage_multi?: ReferencedDocument<EPage>[];
}>;

export type EPage = BaseDocumentType<'ePage', {
	propValue: 'Epage';
}>;
