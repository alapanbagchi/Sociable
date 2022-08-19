import CommandData from "../../typings/Commands";
import { ApplicationCommandOptionType, EmbedBuilder, Role } from "discord.js";
import { embed } from "../../utils/botUtils";
import { moderatorConfig } from "../../utils/adminUtils";
import { config } from "../../config";

const ModeratorConfig: CommandData = {
    name: "moderatorconfig",
    description: "Gives or removes moderator privilages from roles",
    category: "ADMIN",
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
                name: "action",
                description: "The action to perform",
                type: ApplicationCommandOptionType.String,
                required: true,
                choices: [
                    {
                        name: "add",
                        value: "ADD"
                    },
                    {
                        name: "remove",
                        value: "REMOVE"
                    },
                    {
                        name: "list",
                        value: "LIST"
                    }
                ]
            },
            {
                name: "role",
                description: "The role to add or remove moderator privilages from",
                type: ApplicationCommandOptionType.Role,
                required: true
            }
        ]
    },
    async messageRun(message, args) {
        const action = args[0].toUpperCase()
        if (action != "ADD" && action != "REMOVE" && action != "LIST") return message.channel.send({ embeds: [embed("Invalid action", "ERROR")] })
        if (!message.guild) return message.channel.send({ embeds: [embed("This command can only be used in a server", "ERROR")] })
        if (action == "LIST") {
            const status = await moderatorConfig(action, message.guild)
            const listEmbed = new EmbedBuilder()
                .setTitle("Moderator Role Configurations")
                .setDescription(`These are the roles with moderator privilages in the server: \n\n${status.message}`)
            message.channel.send({ embeds: [listEmbed] })
        } else {
            const role: Role | undefined = message.guild?.roles.cache.get(args[1].replace('<@&', '').replace('>', ''))
            if (!role) return message.channel.send({ embeds: [embed(`Role ${args[1]} does not exist`, "ERROR")] })
            const status = await moderatorConfig(action, message.guild, role)
            message.channel.send({ embeds: [embed(status.message, status.type)] })
        }
    },
    async interactionRun(interaction) {
        const action = interaction.options.getString("action") || "LIST"
        if (action != "ADD" && action != "REMOVE" && action != "LIST") return interaction.reply({ embeds: [embed("Invalid action", "ERROR")] })
        if (!interaction.guild) return interaction.reply({ embeds: [embed("This command can only be used in a server", "ERROR")] })
        if (action == "LIST") {
            const status = await moderatorConfig(action, interaction.guild)
            const listEmbed = new EmbedBuilder()
                .setTitle("Moderator Role Configurations")
                .setDescription(`These are the roles with moderator privilages in the server: \n\n${status.message}`)
            interaction.reply({ embeds: [listEmbed] })
        } else {
            const role: Role | undefined = interaction.guild?.roles.cache.get(interaction.options.getRole("role")!.id.replace('<@&', '').replace('>', ''))
            if (!role) return interaction.reply({ embeds: [embed(`Role ${interaction.options.getRole("role")} does not exist`, "ERROR")] })
            const status = await moderatorConfig(action, interaction.guild, role)
            interaction.reply({ embeds: [embed(status.message, status.type)] })
        }

    }
}

module.exports = ModeratorConfig