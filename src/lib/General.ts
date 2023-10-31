import { APIEmbed } from 'discord.js';

const prettify = (s: string, titleCase: boolean = false) => {
	let newString = s.replace(/(_|-)/gi, ' ');
	newString = newString.charAt(0).toUpperCase() + newString.slice(1);
	if (!titleCase) return newString;
	else
		return newString
			.split(' ')
			.map((word) => word[0].toUpperCase() + word.substring(1))
			.join(' ');
};

function replacePlaceholders(
	s: string,
	map: Map<string, string>,
	characters: string = '%%'
): string {
	let placeholded = s;

	for (const [key, value] of map.entries()) {
		const regex = new RegExp(`${characters[0]}${key}${characters[1]}`, 'g');
		placeholded = placeholded.replace(regex, value);
	}

	return placeholded;
}

function parseEmbed(obj: APIEmbed, map: Map<string, string>): APIEmbed {
	const result: APIEmbed = {};

	for (const key in obj) {
		if (Object.prototype.hasOwnProperty.call(obj, key)) {
			if (key === 'color') {
				result[key] = obj[key];
				continue;
			}
			result[key] = replacePlaceholders(obj[key], map);
		}
	}

	return result;
}

export { prettify, replacePlaceholders, parseEmbed };
