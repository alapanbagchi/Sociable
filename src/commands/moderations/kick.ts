import CommandData from "../../typings/Commands";
import { resolveMember } from "../../utils/guildUtils";
import { ApplicationCommandOptionType } from "discord.js";
import { embed } from "../../utils/botUtils";
import { banTarget, kickTarget } from "../../utils/modUtils";

const KickCommand:CommandData = {
    name: "kick",
    description: "Kicks a user from the server",
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
                name: "user",
                description: "The user to ban",
                type: ApplicationCommandOptionType.User,
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
        const target = await resolveMember(message, args[0], true)
        if(!target) return message.channel.send({embeds:[embed("Invalid user", "ERROR" )]})
        const reason = message.content.split(args[0])[1].trim() == "" ? "No reason provided" : message.content.split(args[0])[1].trim();
        
        const status = await kickTarget(message.member!, target, reason, message.client)
        message.channel.send({embeds:[embed(status.message, status.type)]})
    },
    async interactionRun(interaction) {
        const user = interaction.options.getUser("user")
        const reason = interaction.options.getString("reason") || 'No reason provided'
        const target = interaction.guild?.members.cache.get(user!.id)
        if(!target) return interaction.reply({embeds:[embed("Invalid user", "ERROR" )]})
        const status = await kickTarget(interaction.member!, target, reason, interaction.client)
        await interaction.reply({embeds:[embed(status.message, status.type)]})
    }
}

module.exports = KickCommand