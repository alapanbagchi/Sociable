import CommandData from "../../typings/Commands";
import { ApplicationCommandOptionType } from "discord.js";
import { embed } from "../../utils/botUtils";
import { bannedWords } from "../../utils/adminUtils";

const KickCommand: CommandData = {
    name: "bannedwords",
    description: "Kicks a user from the server",
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
                name: 'toggle',
                description: 'Toggle the banned words filter',
                type: ApplicationCommandOptionType.Subcommand,
                options: [
                    {
                        name: 'action',
                        description: 'The action to perform',
                        type: ApplicationCommandOptionType.String,
                        required: true,
                        choices: [
                            {
                                name: 'Enable',
                                value: 'ENABLE'
                            },
                            {
                                name: 'Disable',
                                value: 'DISABLE'
                            }
                        ]
                    }
                ],
                required: false
            },

            {
                name: "add",
                description: "Add banned words to the list. Separate words with a comma and use * for wildcard",
                type: ApplicationCommandOptionType.Subcommand,
                options: [
                    {
                        name: "words",
                        description: "The words to add",
                        type: ApplicationCommandOptionType.String,
                        required: true
                    }
                ],
                required: false
            },
            {
                name: "remove",
                description: "Remove banned words from the list",
                type: ApplicationCommandOptionType.Subcommand,
                options: [
                    {
                        name: "words",
                        description: "The words to add",
                        type: ApplicationCommandOptionType.String,
                        required: true
                    }
                ],
                required: false
            },
            {
                name: "list",
                description: "List the banned words",
                type: ApplicationCommandOptionType.Subcommand,
                options: [
                ],
                required: false
            },
            {
                name: "allowedrolesadd",
                description: "Add roles that are allowed to use banned words",
                type: ApplicationCommandOptionType.Subcommand,
                options: [
                    {
                        name: "role",
                        description: "The roles to add",
                        type: ApplicationCommandOptionType.Role,
                        required: true
                    }
                ],
                required: false
            },
            {
                name: "allowedrolesremove",
                description: "Remove roles that are allowed to use banned words",
                type: ApplicationCommandOptionType.Subcommand,
                options: [
                    {
                        name: "role",
                        description: "The roles to remove",
                        type: ApplicationCommandOptionType.Role,
                        required: true
                    }
                ],
                required: false
            },
            {
                name: "allowedroleslist",
                description: "List the roles that are allowed to use banned words",
                type: ApplicationCommandOptionType.Subcommand,
                options: [
                ],
                required: false
            }
        ]
    },
    async messageRun(message, args) {
        const action = args.shift()?.toUpperCase()
        await message.delete()
        if (!['ADD', 'REMOVE', 'LIST', 'TOGGLE', 'ALLOWEDROLESADD', 'ALLOWEDROLESREMOVE', 'ALLOWEDROLESLIST'].includes(action!)) return message.channel.send(
            {
                embeds: [embed(`Invalid action. Valid actions are: \`add\`, \`remove\`, \`list\`, \`toggle\``, 'ERROR')]
            }
        )
        if (!message.guild) return
        const result = await bannedWords(action, message.guild, args.join(' '))
        return message.channel.send({ embeds: [embed(result.message, result.type)] })
    },
    async interactionRun(interaction) {
        const subcommand = interaction.options.getSubcommand()
        if (subcommand == 'add') {
            const words = interaction.options.getString('words', true)
            const result = await bannedWords('ADD', interaction.guild!, words)
            interaction.reply({ embeds: [embed(result.message, result.type)] })
        } else if (subcommand == 'remove') {
            const words = interaction.options.getString('words', true)
            const result = await bannedWords('REMOVE', interaction.guild!, words)
            interaction.reply({ embeds: [embed(result.message, result.type)] })
        } else if (subcommand == 'list') {
            const result = await bannedWords('LIST', interaction.guild!)
            interaction.reply({ embeds: [embed(result.message, result.type)] })
        } else if (subcommand == 'toggle') {
            const action = interaction.options.getString('action', true)
            const result = await bannedWords("TOGGLE", interaction.guild!, action)
            interaction.reply({ embeds: [embed(result.message, result.type)] })
        } else if (subcommand == 'allowedrolesadd') {
            const roles = interaction.options.getRole('role', true)
            const result = await bannedWords('ALLOWEDROLESADD', interaction.guild!, roles)
            interaction.reply({ embeds: [embed(result.message, result.type)] })
        } else if (subcommand == 'allowedrolesremove') {
            const roles = interaction.options.getRole('role', true)
            const result = await bannedWords('ALLOWEDROLESREMOVE', interaction.guild!, roles)
            interaction.reply({ embeds: [embed(result.message, result.type)] })
        } else if (subcommand == 'allowedroleslist') {
            const result = await bannedWords('ALLOWEDROLESLIST', interaction.guild!)
            interaction.reply({ embeds: [embed(result.message, result.type)] })
        }
    }
}

module.exports = KickCommand