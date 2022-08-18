import CommandData from "../../typings/Commands";
import { ApplicationCommandOptionType } from "discord.js";
import { embed } from "../../utils/botUtils";
import { muteTarget } from "../../utils/modUtils";
import { resolveMember } from "src/utils/guildUtils";
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
                name: "user",
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
    async messageRun(message, args) {
        const target = await resolveMember(message, args[0], true)
        if (!target) return message.channel.send({ embeds: [embed("Invalid user", "ERROR")] })
        let duration: any,
            durationType: any,
            durationMultiplier: any
        let reason = ''
        let time = args[1]
        if (time != undefined) {
            duration = timeParser(time)
            durationType = timeParser(time)
            durationMultiplier = timeParser(time)
        }

        if(!duration){
            reason = args.slice(1).join("")
        } else {
            reason = args.slice(2).join("")
        }
        if(reason === ''){
            reason = 'No reason provided'
        }
        const response = await muteTarget(message.member!, target, duration * durationMultiplier * 1000, `${duration}${durationType}`, reason, message.client)
    },
    async interactionRun(interaction) {

    }
}

module.exports = MuteCommand