import CommandData from "../../typings/Commands";
import { ApplicationCommandOptionType, channelLink, ChannelType } from "discord.js";
import { embed } from "../../utils/botUtils";
import { purgeMessages } from "../../utils/modUtils";

const PurgeCommand: CommandData = {
    name: "purge",
    description: "Purges the last X(upto 100) messages from the channel",
    category: "MODERATION",
    commandInfo: {
        enabled: true,
        minArgs: 2,
        aliases: [],
        subcommands: [
            {
                trigger:"all <limit>",
                description: "Purges all messages from the channel",
            },
            {
                trigger:"user <user> <limit>",
                description: "Purges all messages from the user",
            },
            {
               trigger:"token <token> <limit>",
                description: "Purges all messages from the token",
            },
            {
                trigger: "link <limit>",
                description: "Purges all messages from the link",
            },
            {
                trigger: 'attachment <limit>',
                description: "Purges all messages with attachments",
            },
            {
                trigger: 'bot <limit>',
                description: "Purges all messages from bots"
            }
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
                name: "all",
                description: "Purge all messages",
                type: ApplicationCommandOptionType.Subcommand,
                required: false,
                options: [
                    {
                        name: "channel",
                        description: "The channel to purge",
                        type: ApplicationCommandOptionType.Channel,
                        required: true,
                        channelTypes: [ChannelType.GuildText]
                    },
                    {
                        name: "amount",
                        description: "The amount of messages to purge",
                        type: ApplicationCommandOptionType.Number,
                        required: true,
                    }
                ]
            },
            {
                name: "attachment",
                description: "Purge all messages with attachments",
                type: ApplicationCommandOptionType.Subcommand,
                required: false,
                options: [
                    {
                        name: "channel",
                        description: "The channel to purge",
                        type: ApplicationCommandOptionType.Channel,
                        required: true,
                        channelTypes: [ChannelType.GuildText]
                    },
                    {
                        name: "amount",
                        description: "The amount of messages to purge",
                        type: ApplicationCommandOptionType.Number,
                        required: true,
                    }
                ]

            },
            {
                name: "bot",
                description: "Purge all messages from bots",
                type: ApplicationCommandOptionType.Subcommand,
                required: false,
                options: [
                    {
                        name: "channel",
                        description: "The channel to purge",
                        type: ApplicationCommandOptionType.Channel,
                        required: true,
                        channelTypes: [ChannelType.GuildText]
                    },
                    {
                        name: "amount",
                        description: "The amount of messages to purge",
                        type: ApplicationCommandOptionType.Number,
                        required: true,
                    }
                ]
            },
            {
                name: "link",
                description: "Purge all messages with links",
                type: ApplicationCommandOptionType.Subcommand,
                required: false,
                options: [
                    {
                        name: "channel",
                        description: "The channel to purge",
                        type: ApplicationCommandOptionType.Channel,
                        required: true,
                        channelTypes: [ChannelType.GuildText]
                    },
                    {
                        name: "amount",
                        description: "The amount of messages to purge",
                        type: ApplicationCommandOptionType.Number,
                        required: true,
                    }
                ]
            },
            {
                name: "token",
                description: "Purge all messages with the token",
                type: ApplicationCommandOptionType.Subcommand,
                required: false,
                options: [
                    {
                        name: "channel",
                        description: "The channel to purge",
                        type: ApplicationCommandOptionType.Channel,
                        required: true,
                        channelTypes: [ChannelType.GuildText]
                    },
                    {
                        name: "token",
                        description: "The token to purge",
                        type: ApplicationCommandOptionType.String,
                        required: true,
                    },
                    {
                        name: "amount",
                        description: "The amount of messages to purge",
                        type: ApplicationCommandOptionType.Number,
                        required: true,
                    }
                ]
            },
            {
                name: "user",
                description: "Purge all messages from a user",
                type: ApplicationCommandOptionType.Subcommand,
                required: false,
                options: [
                    {
                        name: "channel",
                        description: "The channel to purge",
                        type: ApplicationCommandOptionType.Channel,
                        required: true,
                        channelTypes: [ChannelType.GuildText]
                    },
                    {
                        name: "user",
                        description: "The user to purge",
                        type: ApplicationCommandOptionType.User,
                        required: true,
                    },
                    {
                        name: "amount",
                        description: "The amount of messages to purge",
                        type: ApplicationCommandOptionType.Number,
                        required: true,
                    }
                ]
            }
        ]
    },
    async messageRun(message, args) {
        const typeArr = ["ALL", "ATTACHMENTS", "BOT", "LINKS", "TOKEN", "USER"];
        const type = args[0].toUpperCase();
        if (!typeArr.includes(type)) {
            message.channel.send({ embeds: [embed(`${type} is not a valid type`, "ERROR")] })
        }
        if (type != "TOKEN" && type != "USER") {
            const amount = parseInt(args[1]);
            if (amount > 100) return message.channel.send({ embeds: [embed(`You cannot purge more than 100 messages due to discord limitations`, "ERROR")] })
            if (isNaN(amount)) {
                message.channel.send({ embeds: [embed(`${args[1]} is not a valid amount`, "ERROR")] })
            }
            if (message.member == null) return message.channel.send({ embeds: [embed(`You must be in a guild to purge messages`, "ERROR")] })
            if (message.channel.type != ChannelType.GuildText) return message.channel.send({ embeds: [embed(`You cannot purge messages in a DM channel`, "ERROR")] })
            const status = await purgeMessages(message.member, message.channel, type, amount)
        } else {
            const argument = args[1];
            const amount = parseInt(args[2]);
            if (amount > 100) return message.channel.send({ embeds: [embed(`You cannot purge more than 100 messages due to discord limitations`, "ERROR")] })
            if (isNaN(amount)) {
                message.channel.send({ embeds: [embed(`${args[2]} is not a valid amount`, "ERROR")] })
            }
            if (message.member == null) return message.channel.send({ embeds: [embed(`You must be in a guild to purge messages`, "ERROR")] })
            if (message.channel.type != ChannelType.GuildText) return message.channel.send({ embeds: [embed(`You cannot purge messages in a DM channel`, "ERROR")] })
            const status = await purgeMessages(message.member, message.channel, type, amount, argument)
        }
    },
    async interactionRun(interaction) {
        const typeArr = ["ALL", "ATTACHMENTS", "BOT", "LINKS", "TOKEN", "USER"];
        const type = interaction.options.getSubcommand().toUpperCase()
        const amount = interaction.options.getNumber("amount")
        if (interaction.member == null) return interaction.reply({ embeds: [embed(`You must be in a guild to purge messages`, "ERROR")] })
        if (interaction.channel == null || interaction.channel.type != ChannelType.GuildText) return interaction.reply({ embeds: [embed(`You must be in a guild to purge messages`, "ERROR")] })
        if (interaction.guild === null) return interaction.reply({ embeds: [embed(`You must be in a guild to purge messages`, "ERROR")] })
        if (!amount) return interaction.reply({ embeds: [embed(`You must provide an amount`, "ERROR")] })
        if (type == "USER") {
            const user = interaction.options.getUser("user")
            if (!user) return interaction.reply({ embeds: [embed(`You must provide a user`, "ERROR")] })
            const target = interaction.guild.members.cache.get(user.id)
            if (!target) return interaction.reply({ embeds: [embed(`${user.username} is not in this guild`, "ERROR")] })
            const status = await purgeMessages(interaction.member, interaction.channel, type, amount, target)
            interaction.reply({ embeds: [embed(status.message, status.type)] })
        } else if (type == "TOKEN") {
            const token = interaction.options.getString("token")
            if (!token) return interaction.reply({ embeds: [embed(`You must provide a token`, "ERROR")] })
            const status = await purgeMessages(interaction.member, interaction.channel, type, amount, token)
            interaction.reply({ embeds: [embed(status.message, status.type)] })
        }
        else if(type=="ALL" || type=="ATTACHMENT" || type=="BOT" || type=="LINK") {
            const status = await purgeMessages(interaction.member, interaction.channel, type, amount)
            interaction.reply({ embeds: [embed(status.message, status.type)] })
        }
    }
}

module.exports = PurgeCommand