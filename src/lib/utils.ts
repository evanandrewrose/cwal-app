// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapToObject = (map: Map<any, any>) => {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const result: Record<string, any> = {};

	for (const key of map.keys()) {
		const value = map.get(key);
		if (value instanceof Map) {
			result[key] = mapToObject(value);
		} else {
			result[key] = value;
		}
	}

	return result;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const jsonParseMap = (map: any) =>
	JSON.stringify(mapToObject(map));