import { assertType, describe, it } from 'vitest';

import type { BaseBlockGridType, BaseDocumentType, BaseElementType, BaseGridBlockAreaType, BaseGridBlockType } from '../../../templates/base-types';

// Concrete element types that mirror what the generator produces for block grid content.
// These are BaseElementType (not BaseDocumentType) because block content is always element-level.
type HeadlineElement = BaseElementType<'headline', { title: string }>;
type RichTextElement = BaseElementType<'richtext', { body: string }>;

// A grid block using element-type content and no settings.
type HeadlineBlock = BaseGridBlockType<HeadlineElement, null>;
type RichTextBlock = BaseGridBlockType<RichTextElement, null>;

// An area containing element-type blocks — this is the line that would fail to compile
// if BaseGridBlockAreaType incorrectly constrains Block to BaseDocumentType.
type LeftArea = BaseGridBlockAreaType<'left', HeadlineBlock | RichTextBlock>;

// A layout block whose areas contain the element-type blocks above.
type TwoColumnElement = BaseElementType<'twoColumnLayout', Record<string, never>>;
type TwoColumnBlock = BaseGridBlockType<TwoColumnElement, null, LeftArea[]>;

// The full grid type.
type TestGrid = BaseBlockGridType<TwoColumnBlock>;

describe('baseGridBlockAreaType constraint', () => {
	it('should accept grid blocks with BaseElementType content', () => {
		// The Block parameter of BaseGridBlockAreaType must accept blocks whose
		// content is BaseElementType. Before the fix, this would produce TS2344
		// because the constraint required BaseDocumentType.
		assertType<LeftArea>({
			alias: 'left',
			rowSpan: 1,
			columnSpan: 6,
			items: [] as (HeadlineBlock | RichTextBlock)[],
		});
	});

	it('should compose into a full block grid type without type errors', () => {
		// Ensure the complete grid hierarchy (grid → block → area → block) compiles
		// when all content types are element types. This mirrors the typical output
		// of the code generator for block grid configurations.
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

	it('should not accept BaseDocumentType where only BaseElementType is expected', () => {
		// BaseDocumentType extends BaseElementType with extra fields (name, createDate, etc.).
		// Grid block content types are elements, not documents. Verify that the constraint
		// on BaseGridBlockType's Content parameter does not require BaseDocumentType.
		type DocElement = BaseDocumentType<'doc', { title: string }>;
		type DocBlock = BaseGridBlockType<DocElement, null>;

		// BaseDocumentType satisfies BaseElementType, so a document-type block can still
		// be used in an area — this direction should compile fine.
		assertType<BaseGridBlockAreaType<'test', DocBlock>>({
			alias: 'test',
			rowSpan: 1,
			columnSpan: 6,
			items: [],
		});

		// But an area accepting element-type blocks should NOT accept being narrowed
		// to only document-type blocks, since element types lack the document fields.
		assertType<LeftArea>({
			alias: 'left',
			rowSpan: 1,
			columnSpan: 6,
			// @ts-expect-error DocBlock content is BaseDocumentType which is narrower than HeadlineBlock | RichTextBlock
			items: [] as DocBlock[],
		});
	});
});
