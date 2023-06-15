interface UrlItem {
	url: string | null;
	title: string;
	target: string | null;
	destinationId: string | null;
	destinationType: string | null;
	route: {
		path: string;
		startItem: {
			id: string;
			path: string;
		};
	} | null;
	linkType: string;
}
