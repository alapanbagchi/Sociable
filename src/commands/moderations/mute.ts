import CommandData from "../../typings/Commands";
import { ApplicationCommandOptionType, GuildMember, Message, User } from "discord.js";
import { embed } from "../../utils/botUtils";
import { muteTarget } from "../../utils/modUtils";
import { resolveMember } from "../../utils/guildUtils";

const timeParser = (time: string) => {
    const duration = time.slice(0, -1)
    const durationType = time.slice(-1)
    const durationTypes = ['s', 'm', 'h', 'd', 'w', 'M']
    const durationMultiplier = [1, 60, 3600, 86400, 604800, 2628000]
    if (durationTypes.includes(durationType)) {
        return [duration, durationType, durationMultiplier[durationTypes.indexOf(durationType)]]
    }
    return undefined
}


const MuteCommand: CommandData = {
    name: "mute",
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
            {
                name: "duration",
                description: "The duration of the mute",
                type: ApplicationCommandOptionType.Number,
                required: false,
            },
            {
                name: "unit",
                description: "The unit of the duration",
                type: ApplicationCommandOptionType.String,
                required: false,
                choices: [
                    {
                        name: "seconds",
                        value: "s"
                    },
                    {
                        name: "minutes",
                        value: "m"
                    },
                    {
                        name: "hours",
                        value: "h"
                    },
                    {
                        name: "days",
                        value: "d"
                    },
                    {
                        name: "weeks",
                        value: "w"
                    },
                    {
                        name: "months",
                        value: "M"
                    }
                ]
            }
        ]
    },
    async messageRun(message: Message, args) {
        //Get the target
        const target = await resolveMember(message, args[0], true)
        if (!target) return message.channel.send({ embeds: [embed("Invalid user", "ERROR")] })

        //Duration is the time, duration type is the unit(s,h,d,w,M) and duration multiplier is the amount of seconds in the unit
        let duration: any,
            durationType: any,
            durationMultiplier: any
        let reason = ''
        //If time is not provided then the mute is permanent and set time to -1 to denote permanent
        let time = args[1] || -1

        //If the time is not permanent then parse the time and set the duration and duration type
        if (time != -1) {
            duration = timeParser(time)![0]
            durationType = timeParser(time)![1]
            durationMultiplier = timeParser(time)![2]
        }

        //Logic for getting the reason
        if (!duration) {
            reason = args.slice(1).join("")
        } else {
            reason = args.slice(2).join("")
        }
        if (reason === '') {
            reason = 'No reason provided'
        }

        //If time is not provided set time to -1 or else set the time to the duration * durationMultiplier * 1000
        time = time === -1 ? -1 : duration * durationMultiplier * 1000
        const response = await muteTarget(message.member as GuildMember, target, time, `${duration}${durationType}`, reason, message.client)

        await message.channel.send({ embeds: [embed(response.message, response.type)] })
    },
    async interactionRun(interaction) {
        const user = interaction.options.getUser("target")
        if (!user) return interaction.reply({ embeds: [embed("Invalid user", "ERROR")] })
        const target = await interaction.guild?.members.fetch(user.id)
        const reason = interaction.options.getString("reason") || 'No reason provided'
        let time = interaction.options.getNumber("duration") || -1
        const unit = interaction.options.getString("unit") || 's'


        //Formatted time is a combination of time(ex: 12) and unit(ex: s) i.e. 12s
        const formattedTime = `${time}${unit}`
        let duration: any, durationType: any, durationMultiplier: any

        //If the time is not permanent then parse the time and set the duration and duration type
        if (time != -1) {
            duration = timeParser(formattedTime)![0]
            durationType = timeParser(formattedTime)![1]
            durationMultiplier = timeParser(formattedTime)![2]
        }
        //If time is not provided set time to -1 or else set the time to the duration * durationMultiplier * 1000
        time = time === -1 ? -1 : duration * durationMultiplier * 1000
        
        const response = await muteTarget(interaction.member as GuildMember, target as GuildMember, time, `${duration}${durationType}`, reason, interaction.client)
        interaction.reply({ embeds: [embed(response.message, response.type)] })
    }
}

module.exports = MuteCommand