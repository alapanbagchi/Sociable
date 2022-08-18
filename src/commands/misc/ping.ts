import { SlashCommandBuilder } from "discord.js"
import CommandData from "../../typings/Commands"

const command: CommandData = {
    name: 'ping',
    description: 'Ping!!!!',
    category: "UTILITY",
    commandInfo: {
        enabled: true,
        minArgs: 0,
        aliases: [],
        subcommands: [
        ],
        usage: ''
    },
    cooldown: 0,
    rolePermissions: [],
    slashCommand: {
        enabled: true,
        ephemeral: true,
        options: []
    },
    messageRun(message, args) {
        message.channel.send("PONG!!!")
    },
    interactionRun(interaction) {
        interaction.reply("PONG!!!")
    },
    
}

module.exports = command

