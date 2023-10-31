import {
	ApplicationCommandOptionType,
	CommandInteraction,
	EmbedBuilder,
	GuildMember,
	bold
} from 'discord.js';
import { Discord, Slash, SlashChoice, SlashOption } from 'discordx';
import { prisma } from '..';
import Colors from '../constants/Colors';

interface PunishmentInfo {
	reason: string;
	points: number;
}

const punishments: Record<string, PunishmentInfo> = {
	nonEngPhrases: {
		reason: 'Multiple non-English phrases',
		points: 1
	},
	miniModPinging: {
		reason: 'Mini-modding when pinging a mod is a better option',
		points: 1
	},
	excessiveCapsLock: {
		reason: 'Excessive use of caps-lock across multiple longer messages',
		points: 1
	},
	wrongChannel: {
		reason: 'Using the wrong channel',
		points: 2
	},
	selfPromotion: {
		reason: 'Self-promotion in the incorrect channel',
		points: 2
	},
	nsfwUsername: {
		reason: 'NSFW username',
		points: 5
	},
	earRapeVC: {
		reason: 'Ear-rape in VC',
		points: 5
	},
	textSpam: {
		reason: 'Text spam',
		points: 5
	},
	nsfwProfile: {
		reason: 'NSFW profile picture/nickname/banner/message',
		points: 10
	},
	plagiarism: {
		reason: 'Plagiarism',
		points: 10
	},
	hateComments: {
		reason: 'Racist/Sexist/LGBTQ-phobic comments',
		points: 10
	},
	derogatoryTerms: {
		reason: 'Derogatory terms',
		points: 10
	},
	nsfwContent: {
		reason: 'NSFW image/video',
		points: 30
	},
	harmfulLink: {
		reason: 'Harmful link',
		points: 30
	},
	doxxing: {
		reason: 'Doxxing',
		points: 30
	},
	massPinging: {
		reason: 'Mass-pinging',
		points: 30
	}
};

const slashOpts = Object.keys(punishments).map((punishment) => {
	return {
		name: punishments[punishment].reason,
		value: punishment
	};
});

@Discord()
class Punish {
	@Slash({ description: 'Punish a member', defaultMemberPermissions: 'ModerateMembers' })
	async punish(
		@SlashOption({
			description: 'The member',
			name: 'member',
			required: true,
			type: ApplicationCommandOptionType.User
		})
		user: GuildMember,
		@SlashChoice(...slashOpts)
		@SlashOption({
			description: 'The punishment reason',
			name: 'reason',
			required: true,
			type: ApplicationCommandOptionType.String
		})
		reason: string,
		interaction: CommandInteraction
	) {
		const punishmentInfo = punishments[reason];

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
					increment: punishmentInfo.points
				}
			}
		});

		const embed = new EmbedBuilder()
			.setColor(Colors.purple)
			.setTitle('Punishment issued')
			.setDescription(`You received a punishment in ${bold(interaction.guild.name)}.`)
			.setFields({
				name: 'Reason',
				value: punishmentInfo.reason
			})
			.setFooter({
				text: `You currently have ${punishmentInfo.points + member.points} points.`
			});

		let moderatorMsg = `Punished ${user.id} for ${punishmentInfo.reason} (${punishmentInfo.points} points)`;

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
	}
}
