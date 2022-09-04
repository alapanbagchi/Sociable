import CommandData from "../../typings/Commands";
import { resolveMember } from "../../utils/guildUtils";
import { ApplicationCommandOptionType } from "discord.js";
import { embed } from "../../utils/botUtils";
import { banTarget, kickTarget } from "../../utils/modUtils";
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
            }
        ]
    },
    async messageRun(message, args) {

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
        } else{
            const action = interaction.options.getString('action', true)
            const result = await bannedWords("TOGGLE", interaction.guild!, action)
            interaction.reply({ embeds: [embed(result.message, result.type)] })
        }
    }
}

module.exports = KickCommand