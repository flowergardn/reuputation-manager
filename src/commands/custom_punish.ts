import {
	ApplicationCommandOptionType,
	CommandInteraction,
	EmbedBuilder,
	GuildMember,
	GuildTextBasedChannel,
	bold,
	userMention
} from 'discord.js';
import { Discord, Slash, SlashOption } from 'discordx';
import { client, prisma } from '..';
import Colors from '../constants/Colors';
import { Punishments } from '@prisma/client';
import { env } from '../env/server';
import { executePunishment } from '../lib/Punishments';

@Discord()
class Punish {
	async sendLog(punishment: Punishments) {
		const embed = new EmbedBuilder()
			.setColor(Colors.red)
			.setTitle('Member Punished')
			.setFields([
				{
					name: 'Punishment ID',
					value: punishment.id
				},
				{
					name: 'Reason',
					value: punishment.reason
				},
				{
					name: 'User',
					value: `${userMention(punishment.member)}`,
					inline: true
				},
				{
					name: 'Moderator',
					value: `${userMention(punishment.moderator)}`,
					inline: true
				}
			]);

		const channel = (await client.channels.fetch(env.LOGS_CHANNEL)) as GuildTextBasedChannel;
		await channel.send({
			embeds: [embed]
		});
	}

	@Slash({
		description: 'Punish a member',
		defaultMemberPermissions: 'ModerateMembers',
		name: 'custom-punish'
	})
	async punish(
		@SlashOption({
			description: 'The member',
			name: 'member',
			required: true,
			type: ApplicationCommandOptionType.User
		})
		user: GuildMember,
		@SlashOption({  
			description: 'The punishment reason',
			name: 'reason',
			required: true,
			type: ApplicationCommandOptionType.String
		})
		reason: string,
		@SlashOption({
			description: 'The violation points to give',
			name: 'points',
			required: true,
			type: ApplicationCommandOptionType.Number
		})
		points: number,
		interaction: CommandInteraction
	) {
		await interaction.deferReply();

		const where = {
			id: user.id
		};

		let member = await prisma.member.findUnique({
			where
		});
		if (!member) {
			member = await prisma.member.create({
				data: {
					id: user.id
				}
			});
		}

		await prisma.member.update({
			where,
			data: {
				points: {
					increment: points
				}
			}
		});

		const punishment = await prisma.punishments.create({
			data: {
				member: user.id,
				moderator: interaction.user.id,
				reason: reason
			}
		});

		const embed = new EmbedBuilder()
			.setColor(Colors.purple)
			.setTitle('Punishment issued')
			.setDescription(`You received a punishment in ${bold(interaction.guild.name)}.`)
			.setFields([
				{
					name: 'Reason',
					value: reason
				},
				{
					name: 'Punishment ID',
					value: punishment.id
				}
			])
			.setFooter({
				text: `You currently have ${points + member.points} points.`
			});

		let moderatorMsg = `Punished ${user.id} for ${reason} (${points} points)`;

		try {
			await user.send({
				embeds: [embed]
			});
			interaction.editReply({
				content: moderatorMsg
			});
		} catch (err) {
			moderatorMsg += ' [User had DMs disabled]';
			interaction.editReply({
				content: moderatorMsg
			});
		}

		this.sendLog(punishment);

		executePunishment(user);
	}
}
