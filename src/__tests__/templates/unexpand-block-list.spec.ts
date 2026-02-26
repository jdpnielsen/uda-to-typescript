import { describe, expectTypeOf, it } from 'vitest';

import type { BaseBlockListType, BaseBlockType, BaseDocumentType, BaseElementType, EmptyObjectType } from '../../../templates/base-types';
import type { ExpandableElementKeys, UnexpandBlock, UnexpandBlockList } from '../../../templates/utils';

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

	it('should handle blocks with blockSettings', () => {
		type BlockSettingsElement = BaseElementType<'blockSettings', { anchor?: string }>;
		type HeadlineBlockWithSettings = BaseBlockType<HeadlineElement, BlockSettingsElement>;

		type ContentBlockListWithSettings = BaseBlockListType<HeadlineBlockWithSettings | RichTextBlock | ChildBlock>;

		type Actual = BaseBlockListType<UnexpandBlock<HeadlineBlockWithSettings, ExpandableElementKeys<HeadlineBlockWithSettings['content']>> | RichTextBlock | ChildBlock>;

		expectTypeOf<Actual>().toEqualTypeOf<UnexpandBlockList<ContentBlockListWithSettings, 'child'>>();
		expectTypeOf<UnexpandBlockList<ContentBlockListWithSettings, 'child'>>().toEqualTypeOf<UnexpandBlockList<ContentBlockListWithSettings, 'child'>>();
	});
});
