function convertDate(input: string): number {
	const [numericValue, timeUnit]: string[] = input.match(/\d+|\D+/g) || [];

	const timeUnitInMillis: { [key: string]: number } = {
		s: 1000, // 1 second = 1000 milliseconds
		m: 1000 * 60, // 1 minute = 60 seconds * 1000 milliseconds
		h: 1000 * 60 * 60, // 1 hour = 60 minutes * 60 seconds * 1000 milliseconds
		d: 1000 * 60 * 60 * 24 // 1 day =  24 hours * 60 minutes * 60 seconds * 1000 milliseconds
	};

	const valueInMillis: number = timeUnitInMillis[timeUnit];

	if (!valueInMillis) {
		throw new Error('Invalid time unit specified');
	}

	const futureTimestamp: number = Date.now() + parseInt(numericValue) * valueInMillis;

	return futureTimestamp;
}

function getStdTTL(futureTimestamp: number): number {
	const now = new Date().getTime();
	const stdTTL = futureTimestamp - now;
	return Math.ceil(stdTTL / 1000);
}

function prettyTime(timeUnit: string): string {
	const unitValue = parseInt(timeUnit);
	const unit = timeUnit.slice(-1);

	switch (unit) {
		case 's':
			return unitValue === 1 ? '1 second' : `${unitValue} seconds`;
		case 'm':
			return unitValue === 1 ? '1 minute' : `${unitValue} minutes`;
		case 'h':
			return unitValue === 1 ? '1 hour' : `${unitValue} hours`;
		case 'd':
			return unitValue === 1 ? '1 day' : `${unitValue} days`;
		default:
			throw new Error('Invalid time unit specified');
	}
}

export { convertDate, prettyTime, getStdTTL };
