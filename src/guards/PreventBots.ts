import { GuardFunction, ArgsOf } from 'discordx';

export const PreventBots: GuardFunction<ArgsOf<'messageCreate'>> = async (
	[message],
	client,
	next
) => {
	if (client.user.id !== message.author.id) await next();
};
