// Needed since discord.js within Typescript only supports decimals, for some reason.

function parseColor(color: string) {
	let baseColor = color;
	baseColor = color.replace('#', '');
	return parseInt(baseColor, 16);
}

export default {
	pink: parseColor('#ffd4e3'),
	purple: parseColor('#9630f5'),
	red: parseColor('#ff697b'),
	green: parseColor('#9beba7'),
	blue: parseColor('#4054db'),
	parseColor
};
