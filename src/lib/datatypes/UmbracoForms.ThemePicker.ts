import ts, { factory } from 'typescript';

import type { HandlerConfig } from '.';
import { maybeNull } from '../helpers/ast/maybe-null';

export const themePickerHandler = {
	editorAlias: 'UmbracoForms.ThemePicker' as const,
	build: () => [],
	reference: () => maybeNull(
		factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
	),
} satisfies HandlerConfig;
