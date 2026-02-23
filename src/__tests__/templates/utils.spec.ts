import { assertType, describe, expectTypeOf, it } from 'vitest';

import type { BaseBlockListType, BaseBlockType, BaseDocumentType, BaseElementType, EmptyObjectType } from '../../../templates/base-types';
import type { ExpandParam, ExpandResult, ExpandableElementKeys, OmitFields, UnexpandBlockList, UnexpandDocumentExpandables, UnexpandPropertyExpandables } from '../../../templates/utils';

type NestedChildPage = BaseDocumentType<'nestedChildPage', {
	headline: string;
}>;

type ChildPage = BaseDocumentType<'childPage', {
	headline: string;
	child: NestedChildPage;
}>;

type HeadlineElement = BaseElementType<'headline', { title: string }>;
type RichTextElement = BaseElementType<'richtext', { body: string }>;
type ChildElement = BaseElementType<'child', {
	child: ChildPage[];
}>;

type HeadlineBlock = BaseBlockType<HeadlineElement, null>;
type RichTextBlock = BaseBlockType<RichTextElement, null>;
type ChildBlock = BaseBlockType<ChildElement, null>;

type ContentBlockList = BaseBlockListType<HeadlineBlock | RichTextBlock | ChildBlock>;

// The content page document type.
type ContentPage = BaseDocumentType<'contentPage', {
	headline: string;
	blocks: ContentBlockList;
}>;

describe('type ExpandableElementKeys', () => {
	it('should get expandable keys from document type', () => {
		expectTypeOf<ExpandableElementKeys<ContentPage>>().toExtend<'blocks'>();
		expectTypeOf<ExpandableElementKeys<ContentPage>>().not.toExtend<'headline'>();
	});

	it('should get expandable keys from element type', () => {
		expectTypeOf<ExpandableElementKeys<ChildElement>>().toExtend<'child'>();
		expectTypeOf<ExpandableElementKeys<ContentPage>>().not.toExtend<'randomValue'>();
	});
});

describe('type ExpandParam', () => {
	it('should get expandable keys from document type', () => {
		expectTypeOf<ExpandParam<ContentPage>>().toExtend<('blocks')[] | '$all' | undefined | []>();
		expectTypeOf<ExpandParam<ContentPage>>().not.toExtend<('headline')[] | '$all' | undefined | []>();
	});

	it('should get expandable keys from element type', () => {
		// @ts-expect-error ChildElement is not a Document
		assertType<ExpandParam<ChildElement>>();
	});
});

describe('type UnexpandPropertyExpandables', () => {
	it('should expand properties by keys', () => {
		interface Actual {
			headline: string;
			blocks: ContentBlockList;
		}

		expectTypeOf<Actual>().toEqualTypeOf<UnexpandPropertyExpandables<ContentPage['properties'], 'blocks'>>();
	});

	it('should unexpand properties not provided', () => {
		interface Actual {
			headline: string;
			blocks: UnexpandBlockList<ContentBlockList, undefined>;
		}

		expectTypeOf<Actual>().toEqualTypeOf<UnexpandPropertyExpandables<ContentPage['properties'], undefined>>();
	});
});

describe('type UnexpandDocumentExpandables', () => {
	it('should expand properties by keys', () => {
		expectTypeOf<ChildPage>().branded.toEqualTypeOf<UnexpandDocumentExpandables<ChildPage, undefined>>();
	});

	it('should unexpand properties not provided', () => {
		interface Actual {
			headline: string;
			blocks: UnexpandBlockList<ContentBlockList, undefined>;
		}

		expectTypeOf<Actual>().toEqualTypeOf<UnexpandPropertyExpandables<ContentPage['properties'], undefined>>();
	});
});

describe('type ExpandResult', () => {
	it('should not unexpand when expand is $all', () => {
		type Actual = BaseDocumentType<'contentPage', {
			headline: string;
			blocks: UnexpandBlockList<ContentBlockList, 'child'>;
		}>;

		expectTypeOf<ContentPage>().toEqualTypeOf<ExpandResult<ContentPage, '$all'>>();
		expectTypeOf<Actual>().toEqualTypeOf<ExpandResult<ContentPage, '$all'>>();
	});

	it('should unexpand all when expand is undefined', () => {
		type Actual = BaseDocumentType<'contentPage', {
			headline: string;
			blocks: UnexpandBlockList<ContentBlockList, undefined>;
		}>;

		expectTypeOf<Actual>().toEqualTypeOf<ExpandResult<ContentPage, undefined>>();

		// @ts-expect-error ContentPage is unexpanded
		expectTypeOf<ContentPage>().toEqualTypeOf<ExpandResult<ContentPage, undefined>>();
	});

	it('should not be affected by OmitFields', () => {
		expectTypeOf<ContentPage>().toEqualTypeOf<OmitFields<ContentPage, ['$all']>>();
		expectTypeOf<ContentPage>().toEqualTypeOf<ExpandResult<OmitFields<ContentPage, ['$all']>, '$all'>>();
		expectTypeOf<ContentPage>().toEqualTypeOf<ExpandResult<OmitFields<ContentPage, ['$all']>, ['blocks']>>();
		expectTypeOf<ContentPage>().toEqualTypeOf<ExpandResult<OmitFields<ContentPage, ['headline' | 'blocks']>, ['blocks']>>();
	});
});

describe('type UnexpandBlockList', () => {
	it('should not unexpand when expandable properties are passed', () => {
		type Actual = ContentBlockList;
		expectTypeOf<Actual>().toEqualTypeOf<UnexpandBlockList<ContentBlockList, ExpandableElementKeys<ContentBlockList['items'][number]['content']>>>();
		expectTypeOf<Actual>().toEqualTypeOf<UnexpandBlockList<ContentBlockList, 'child'>>();
	});

	it('should unexpand when expand is undefined', () => {
		type Actual = BaseBlockListType<HeadlineBlock | RichTextBlock | BaseBlockType<BaseElementType<'child', {
			child: BaseDocumentType<'childPage', EmptyObjectType>[];
		}>, null>>;

		expectTypeOf<Actual>().toEqualTypeOf<UnexpandBlockList<ContentBlockList, undefined>>();
	});

	it('should unexpand all when expand is undefined', () => {
		type Actual = BaseDocumentType<'contentPage', {
			headline: string;
			blocks: UnexpandBlockList<ContentBlockList, undefined>;
		}>;

		expectTypeOf<Actual>().toEqualTypeOf<ExpandResult<ContentPage, undefined>>();
	});
});
