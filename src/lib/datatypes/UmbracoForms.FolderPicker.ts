import ts, { factory } from 'typescript';

import { maybeNull } from '../helpers/ast/maybe-null';
import type { HandlerConfig } from '.';

export const folderPickerHandler = {
	editorAlias: 'UmbracoForms.FolderPicker' as const,
	build: () => [],
	reference: () => maybeNull(
		factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
	),
} satisfies HandlerConfig;
