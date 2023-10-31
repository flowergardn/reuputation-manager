import 'reflect-metadata';

import { importx } from '@discordx/importer';
import { Client } from 'discordx';
import { IntentsBitField } from 'discord.js';
import { PrismaClient } from '@prisma/client';
import { env } from './env/server';

require('dotenv').config();

export const prisma = new PrismaClient();

export const client = new Client({
	intents: [
		IntentsBitField.Flags.GuildMembers,
		IntentsBitField.Flags.GuildMessages,
		IntentsBitField.Flags.MessageContent,
		IntentsBitField.Flags.Guilds
	],
	silent: false
});

client.on('ready', async () => {
	await client.clearApplicationCommands();
	await client.initApplicationCommands();

	console.log('> Bot online, logged in as: ' + client.user!!.tag);
});

client.on('interactionCreate', (interaction) => {
	client.executeInteraction(interaction);
});

async function start() {
	await importx(__dirname + '/commands/*.{js,ts}');
	await importx(__dirname + '/commands/*/*.{js,ts}');
	await importx(__dirname + '/events/*.{js,ts}');
	await client.login(env.TOKEN);
}

start()
	.then(() => prisma.$disconnect())
	.catch(async (e) => {
		console.error(e);
		await prisma.$disconnect();
		process.exit(1);
	});
