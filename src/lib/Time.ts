function convertTime(input: string, returnEpoch: boolean = true): number {
	const [numericValue, timeUnit]: string[] = input.match(/\d+|\D+/g) || [];

	const timeUnitInMillis: { [key: string]: number } = {
		s: 1000,
		m: 1000 * 60,
		h: 1000 * 60 * 60,
		d: 1000 * 60 * 60 * 24
	};

	const valueInMillis = timeUnitInMillis[timeUnit];

	if (!valueInMillis) {
		throw new Error('Invalid time unit specified');
	}

	const futureTimestamp = parseInt(numericValue) * valueInMillis;
	return returnEpoch ? Date.now() + futureTimestamp : futureTimestamp;
}

function convertDate(input: string): number {
	return convertTime(input);
}

function convertSeconds(input: string): number {
	return convertTime(input, false);
}

export { convertDate, convertSeconds };
