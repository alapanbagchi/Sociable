import CommandData from "../../typings/Commands";
import { ApplicationCommandOptionType, Client, GuildMember, Message, User } from "discord.js";
import { embed } from "../../utils/botUtils";
import { unmuteTarget } from "../../utils/modUtils";
import { resolveMember } from "../../utils/guildUtils";


const UnmuteCommand: CommandData = {
    name: "unmute",
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
                name: "target",
                description: "The member to mute",
                type: ApplicationCommandOptionType.User,
                required: true
            },
            {
                name: "reason",
                description: "The reason for the ban",
                type: ApplicationCommandOptionType.String,
                required: false,
            },
        ]
    },
    async messageRun(message: Message, args) {
        const target = await resolveMember(message, args[0])
        if (!target) return message.channel.send(`No user found matching ${args[0]}`);
        const reason = message.content.split(args[0])[1].trim()
        const response = await unmuteTarget(message.member as GuildMember, target, reason, message.client)
        message.channel.send({ embeds: [embed(response.message, response.type)] })
    },
    async interactionRun(interaction) {
        const target = interaction.options.getUser("target")
        const reason = interaction.options.getString("reason")!
        const targetMember = interaction.guild?.members.cache.get(target!.id)
        if (!targetMember) return interaction.reply({ embeds: [embed("Invalid user", "ERROR")] })
        const response = await unmuteTarget(interaction.member as GuildMember, targetMember, reason, interaction.client)
        await interaction.reply({ embeds: [embed(response.message, response.type)] })
    }
}

module.exports = UnmuteCommand