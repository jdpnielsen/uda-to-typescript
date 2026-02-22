import ts, { factory } from 'typescript';

import { maybeNull } from '../helpers/ast/maybe-null';
import type { HandlerConfig } from '.';

export const memberPickerHandler = {
	editorAlias: 'Umbraco.MemberPicker' as const,
	build: () => [],
	reference: () => maybeNull(
		factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
	),
} satisfies HandlerConfig;
