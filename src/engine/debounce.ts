type DocumentLike = {
	uri: {
		toString(): string;
	};
};

export function debounceByDocument<T extends DocumentLike>(
	callback: (document: T) => void,
	delay: number
): (document: T) => void {
	const timers = new Map<string, ReturnType<typeof setTimeout>>();

	return (document: T) => {
		const documentKey = document.uri.toString();
		const existingTimer = timers.get(documentKey);
		if (existingTimer) {
			clearTimeout(existingTimer);
		}

		const timer = setTimeout(() => {
			timers.delete(documentKey);
			callback(document);
		}, delay);
		timers.set(documentKey, timer);
	};
}
