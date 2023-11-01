import { GuildMember } from 'discord.js';
import { prisma } from '..';
import { convertDate, convertSeconds } from './Time';

export async function executePunishment(user: GuildMember) {
	async function applyBan(points: number, duration?: number) {
		user.ban({
			reason: `Reached ${points} violation points`
		});
		await prisma.member.update({
			where: {
				id: user.id
			},
			data: {
				punishedUntil: convertDate(`${duration}d`)
			}
		});
	}

	const violationLevels = [
		{ threshold: 280, action: applyBan, duration: 90 },
		{ threshold: 250, action: applyBan, duration: 60 },
		{ threshold: 180, action: applyBan, duration: 30 },
		{ threshold: 120, action: applyBan, duration: 14 },
		{
			threshold: 80,
			action: () => {
				user.ban({
					reason: `Soft-banned for reaching 80 violation points`,
					deleteMessageSeconds: 3600 // 1 hour
				});
			}
		},
		{
			threshold: 50,
			action: () => {
				user.timeout(convertSeconds('3h'), 'Reached 50 violation points');
			}
		},
		{
			threshold: 20,
			action: () => {
				user.timeout(convertSeconds('1h'), 'Reached 20 violation points');
			}
		}
	];

	const member = await prisma.member.findUnique({
		where: {
			id: user.id
		}
	});

	for (const { threshold, action, duration } of violationLevels) {
		if (member.points >= threshold) {
			console.log(`executing punishment for ${threshold}`);
			if (duration) await action(threshold, duration);
			else await action(threshold);
			return;
		}
	}
}
