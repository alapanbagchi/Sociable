import CommandData from "../../typings/Commands";
import { ApplicationCommandOptionType, ChannelType, Client, GuildMember, Message, User, VoiceChannel } from "discord.js";
import { embed } from "../../utils/botUtils";
import { deafen, disconnectVC, moveVC, undeafen, unmuteTarget, voiceMute, voiceUnmute } from "../../utils/modUtils";
import { resolveMember } from "../../utils/guildUtils";


const VoiceModeration: CommandData = {
    name: "voice",
    description: "Voice Moderation",
    category: "MODERATION",
    commandInfo: {
        enabled: true,
        minArgs: 2,
        aliases: [],
        subcommands: [
            {
                trigger: "deafen",
                description: "Deafens a user",
            },
            {
                trigger: "undeafen",
                description: "Undeafens a user",
            },
            {
                trigger: "mute",
                description: "Mutes a user",
            },
            {
                trigger: "unmute",
                description: "Unmutes a user",
            },
            {
                trigger: "move",
                description: "Moves a user to a different voice channel",
            },
            {
                trigger: "kick",
                description: "Kicks a user from a voice channel",
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
                name: "action",
                description: "The action to perform",
                type: ApplicationCommandOptionType.String,
                required: true,
                choices: [
                    {
                        name: "Deafen",
                        value: "deafen"
                    },
                    {
                        name: "Undeafen",
                        value: "undeafen"
                    },
                    {
                        name: "Mute",
                        value: "mute"
                    },
                    {
                        name: "Unmute",
                        value: "unmute"
                    },
                    {
                        name: "Move",
                        value: "move"
                    },
                    {
                        name: "Kick",
                        value: "kick"
                    }
                ]
            },
            {
                name: "target",
                description: "The member to perform the action on",
                type: ApplicationCommandOptionType.User,
                required: true
            },
            {
                name: "reason",
                description: "The reason for the action",
                type: ApplicationCommandOptionType.String,
                required: false,
            },
            {
                name: "channel",
                description: "The channel to move the user to",
                type: ApplicationCommandOptionType.Channel,
                required: false,
            }
        ]
    },
    async messageRun(message: Message, args) {
        const action = args[0]
        const validActions = ["deafen", "undeafen", "mute", "unmute", "move", "kick"]
        if (!validActions.includes(action)) return message.channel.send(`Invalid action ${action}`)
        const target = await resolveMember(message, args[1])
        if (!target) return message.channel.send(`No user found matching ${args[1]}`);
        let reason = message.content.split(args[1])[1].trim()
        if (!reason) reason = "No reason provided"
        if (!message.member) return message.channel.send({
            embeds: [embed("Something went wrong while executing that command", "ERROR")]
        })
        let res: { message: string, type: "SUCCESS" | "ERROR" | "INFO" }
        switch (action) {
            case "deafen":
                res = await deafen(message.member, target, reason, message.client)
                break;
            case "undeafen":
                res = await undeafen(message.member, target, reason, message.client)
                break;
            case "mute":
                res = await voiceMute(message.member, target, reason, message.client)
                return message.channel.send({ embeds: [embed(res.message, res.type)] })
            case "unmute":
                res = await voiceUnmute(message.member, target, reason, message.client)
                return message.channel.send({ embeds: [embed(res.message, res.type)] })
            case "move":
                let channel = message.mentions.channels.first()
                if (!channel) return message.channel.send({
                    embeds: [embed("Please mention a channel to move the user to", "ERROR")]
                })
                if (channel.type != ChannelType.GuildVoice) return message.channel.send({
                    embeds: [embed(`${channel} is not a voice channel`, "ERROR")]
                })
                reason = message.content.split(args[2])[1].trim()
                if (!reason) reason = "No reason provided"
                res = await moveVC(message.member, target, channel, reason, message.client)
                return message.channel.send({ embeds: [embed(res.message, res.type)] })
            case "kick":
                res = await disconnectVC(message.member, target, reason, message.client)
                return message.channel.send({ embeds: [embed(res.message, res.type)] })
        }
    },
    async interactionRun(interaction) {
        let action = interaction.options.getString("action")
        if (!action) return interaction.reply({
            embeds: [embed("You need to provide an action", "ERROR")]
        })
        const validActions = ["deafen", "undeafen", "mute", "unmute", "move", "kick"]
        if (!validActions.includes(action)) return interaction.reply({
            embeds: [embed("Invalid action", "ERROR")]
        })
        let target = interaction.options.getUser("target")
        let reason = interaction.options.getString("reason")
        const channel = interaction.options.getChannel("channel")
        if (!target) return interaction.reply({
            embeds: [embed("Please provide a target", "ERROR")]
        })
        if (!interaction.guild) return interaction.reply({
            embeds: [embed("Something went wrong while executing that command", "ERROR")]
        })
        const targetMember = interaction.guild?.members.cache.get(target!.id)
        if (!targetMember) return interaction.reply({
            embeds: [embed("Something went wrong while executing that command", "ERROR")]
        })
        if (!interaction.member) return interaction.reply({
            embeds: [embed("Something went wrong while executing that command", "ERROR")]
        })
        let res: { message: string, type: "SUCCESS" | "ERROR" | "INFO" }
        if (!reason) reason = "No reason provided"
        switch (action) {
            case "deafen":
                res = await deafen(interaction.member, targetMember, reason, interaction.client)
                break;
            case "undeafen":
                res = await undeafen(interaction.member, targetMember, reason, interaction.client)
                break;
            case "mute":
                res = await voiceMute(interaction.member, targetMember, reason, interaction.client)
                return interaction.reply({ embeds: [embed(res.message, res.type)] })
            case "unmute":
                res = await voiceUnmute(interaction.member, targetMember, reason, interaction.client)
                return interaction.reply({ embeds: [embed(res.message, res.type)] })
            case "move":
                if (!channel) return interaction.reply({
                    embeds: [embed("Please provide a channel to move the user to", "ERROR")]
                })
                if (channel.type != ChannelType.GuildVoice) return interaction.reply({
                    embeds: [embed(`${channel} is not a voice channel`, "ERROR")]
                })
                res = await moveVC(interaction.member, targetMember, channel as VoiceChannel, reason, interaction.client)
                return interaction.reply({ embeds: [embed(res.message, res.type)] })
            case "kick":
                res = await disconnectVC(interaction.member, targetMember, reason, interaction.client)
                return interaction.reply({ embeds: [embed(res.message, res.type)] })
        }


    }
}

module.exports = VoiceModeration