import { BaseDocumentType, ReferencedExpandable, MediaPickerItem, BaseMediaType } from './base-types';

export type APage = BaseDocumentType<'aPage', {
	propValue: 'APage';
	aPage_single?: ReferencedExpandable<BPage>;
	images?: ReferencedExpandable<MediaPickerItem<BaseMediaType<'image', { credits: string }>>>[];
	singleImages: ReferencedExpandable<MediaPickerItem<BaseMediaType<'image', { credits: string }>>>;
	aPage_multi?: ReferencedExpandable<BPage>[];
}>;

export type BPage = BaseDocumentType<'bPage', {
	propValue: 'BPage';
	bPage_single?: ReferencedExpandable<CPage>;
	bPage_multi?: ReferencedExpandable<CPage>[];
}>;

export type CPage = BaseDocumentType<'cPage', {
	propValue: 'CPage';
	cPage_single?: ReferencedExpandable<DPage>;
	cPage_multi?: ReferencedExpandable<DPage>[];
}>;

export type DPage = BaseDocumentType<'dPage', {
	propValue: 'Dpage';
	ePage_single?: ReferencedExpandable<EPage>;
	ePage_multi?: ReferencedExpandable<EPage>[];
}>;

export type EPage = BaseDocumentType<'ePage', {
	propValue: 'Epage';
}>;
