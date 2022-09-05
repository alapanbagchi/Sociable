import CommandData from '../../typings/Commands'
import { Message } from 'discord.js'
import { config } from '../../config'
import { embed } from '../../utils/botUtils'
import {guildSettings} from '../../dummydata'
import { automodHandler } from '../../utils/automodUtils'

const settings = guildSettings

module.exports = {
    name: 'messageCreate',
    once: false,
    execute(message: Message, client: any) {
        if (message.author.bot) return
        executeCommands(message, client)
        automodHandler(message, client)
    }
}


//Handles Command Execution
const executeCommands = (message: Message, client: any) => {
    const { PREFIX, OWNER_ID } = config
    if (!message.content.startsWith(PREFIX)) return
    const args = message.content.replace(`${PREFIX}`, "").split(/\s+/);
    const cmd = args.shift()?.toLowerCase()

    const validCommand = client.commands.has(cmd)
    if (!validCommand) return

    const command: CommandData = client.commands.get(cmd)

    if (!command.commandInfo.enabled) return
    //If the command is of an ADMIN category check if the sender is an admin and if not show an error

    if (command.category === "ADMIN") {
        if (!message.member?.permissions.has("Administrator"))
            return message.channel.send({ embeds: [embed('You have to be an Administrator to run this command', 'ERROR')] })
    }
    if (command.category === "MODERATION") {
        if (!message.member?.permissions.has("Administrator")) {
            if (settings.moderatorRoles.length === 0) return message.channel.send({ embeds: [embed("Moderation Roles have not been configured for this server. Please do so before using moderation commands", "INFO")] })
            if (!message.member?.roles.cache.some(role => settings.moderatorRoles.includes(role.id))) return message.channel.send({ embeds: [embed("You need moderator privilages to run this command", "ERROR")] })
        }
    }

    //Check if additional role permissions are required
    if (command.rolePermissions.length > 0 && !message.member?.permissions.has("Administrator")) {
        //Check if the user has the required roles to use that command
        if (!command.rolePermissions.some(role => message.member?.roles.cache.has(role))) {
            return message.channel.send({ embeds: [embed(`You don't have the required roles to use this command`, "ERROR")] })
        }
    }

    //Check if the number of arguments is correct
    if (args.length < command.commandInfo.minArgs) {
        let desc = "You used the command incorrectly, here's the correct way to use it: \n\n"
        if (command.commandInfo.subcommands.length > 0) {
            command.commandInfo.subcommands.forEach((sub) => {
                desc += `\`${PREFIX}${cmd} ${sub.trigger}\`\n ${sub.description}\n\n`;
            })
        } else {
            desc += `\`\`\`css\n${PREFIX}${cmd} ${command.commandInfo.usage}\`\`\`\n\n`;
        }
        return message.channel.send({
            embeds: [
                embed(desc, "INFO").setTitle("Usage")]
        })
    }
    command.messageRun(message, args)
}