import { Message, TextChannel, DMChannel, GuildMember } from 'discord.js';
import { Command } from 'discord-akairo';
import { Task, TaskStatus } from '../util/task';
import { HackathonClient } from '../HackathonClient';

export default class FeedCommand extends Command {
	public constructor() {
		super('feed', {
			aliases: ['feed'],
			args: [
				{
					id: 'target',
					type: 'member',
					prompt: {
						start: 'Who would you like to feed?',
						retry: 'That\'s not a valid member! Try again.'
					}
				}
			],
			channel: 'guild'
		});
	}

	public async exec(message: Message, args: { target: GuildMember }) {
		const client = message.client as HackathonClient;
		const task = new Task({
			title: 'Feed Member',
			issuer: message.author,
			description: `Feeding **${args.target.user.tag}** (${args.target.id})`
		});
		await task.sendTo(message.channel as TextChannel | DMChannel);

		try {
			if (!(await client.discordUserCanAccessResource(message.author.id, 'hs:hs_discord:bot:feed'))) {
				return task.update({
					status: TaskStatus.Failed,
					description: 'Sorry, you do not have permission to feed the participants :('
				});
			}

			// hackersuite api call here

			await task.update({
				status: TaskStatus.Completed,
				description: `Fed **${args.target.user.tag}** (${args.target.id})`
			});
		} catch (err) {
			client.loggers.bot.warn(err);
			task.update({
				status: TaskStatus.Failed,
				description: `An error occurred processing your request. Please try again later.`
			}).catch(err => client.loggers.bot.warn(err));
		}
	}
}
