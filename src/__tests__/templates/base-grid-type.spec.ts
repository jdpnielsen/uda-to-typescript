import { assertType, describe, it } from 'vitest';

import type { BaseBlockGridType, BaseElementType, BaseGridBlockAreaType, BaseGridBlockType } from '../../../templates/base-types';

type HeadlineElement = BaseElementType<'headline', { title: string }>;
type RichTextElement = BaseElementType<'richtext', { body: string }>;

type HeadlineGridBlock = BaseGridBlockType<HeadlineElement, null>;
type RichTextGridBlock = BaseGridBlockType<RichTextElement, null>;

type LeftArea = BaseGridBlockAreaType<'left', HeadlineGridBlock | RichTextGridBlock>;

type TwoColumnElement = BaseElementType<'twoColumnLayout', Record<string, never>>;
type TwoColumnBlock = BaseGridBlockType<TwoColumnElement, null, LeftArea[]>;

type TestGrid = BaseBlockGridType<TwoColumnBlock>;

describe('type BaseBlockGridType', () => {
	it('should accept grid blocks with BaseElementType content', () => {
		assertType<LeftArea>({
			alias: 'left',
			rowSpan: 1,
			columnSpan: 6,
			items: [] as (HeadlineGridBlock | RichTextGridBlock)[],
		});
	});

	it('should compose into a full block grid type without type errors', () => {
		const area: LeftArea = {
			alias: 'left',
			rowSpan: 1,
			columnSpan: 6,
			items: [],
		};

		const block: TwoColumnBlock = {
			content: { id: '1', contentType: 'twoColumnLayout', properties: {} },
			settings: null,
			rowSpan: 1,
			columnSpan: 12,
			areaGridColumns: 12,
			areas: [area],
		};

		assertType<TestGrid>({
			gridColumns: 12,
			items: [block],
		});
	});
});
