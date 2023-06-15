import { BaseDocumentType } from './base-types';
import { ExpandParam, ExpandResult } from './utils';

function getDocumentFetcher<Doc extends BaseDocumentType>() {
	return <T extends ExpandParam<Doc>>(expand?: T): Promise<ExpandResult<Doc, T>> => {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-return
		return Promise.resolve({} as any);
	}
}
