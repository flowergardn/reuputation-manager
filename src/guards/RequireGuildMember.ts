import { CommandInteraction, EmbedBuilder } from 'discord.js';
import { GuardFunction } from 'discordx';
import Colors from '../constants/Colors';

export const RequireGuildMember: GuardFunction<CommandInteraction> = async (
	interaction,
	_,
	next
) => {
	const member = interaction.options.get('member');

	if (member !== null) return await next();

	const embed = new EmbedBuilder()
		.setColor(Colors.red)
		.setTitle('Uh oh!')
		.setDescription(`The member you've specified isn't here.`);

	interaction.reply({
		embeds: [embed],
		ephemeral: true
	});
};
