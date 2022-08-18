import CommandData from "../../typings/Commands";
import { ApplicationCommandOptionType } from "discord.js";
import { embed } from "../../utils/botUtils";
import { unbanTarget } from "../../utils/modUtils";

const UnbanCommand: CommandData = {
    name: "unban",
    description: "Unbans a user from the server",
    category: "MODERATION",
    commandInfo: {
        enabled: true,
        minArgs: 1,
        aliases: [],
        subcommands: [
        ],
        usage: '<ID|@member> [reason]'
    },
    cooldown: 0,
    rolePermissions: [],
    slashCommand: {
        enabled: true,
        ephemeral: true,
        options: [
            {
                name: "userid",
                description: "The ID of the user to unban",
                type: ApplicationCommandOptionType.String,
                required: true
            },
            {
                name: "reason",
                description: "The reason for the ban",
                type: ApplicationCommandOptionType.String,
                required: false,
            }
        ]
    },
    async messageRun(message, args) {
        const reason = message.content.split(args[0])[1].trim();
        const status = await unbanTarget(message.guild!, message.member!, args[0], reason)
        message.channel.send({ embeds: [embed(status.message, status.type)] })
    },
    async interactionRun(interaction) {
        const target = interaction.options.getString("user")
        const reason = interaction.options.getString("reason")!
        const status = await unbanTarget(interaction.guild!, interaction.member!, target !, reason)
        await interaction.reply({ embeds: [embed(status.message, status.type)] })
    }
}

module.exports = UnbanCommand