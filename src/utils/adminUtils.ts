import { Guild, Role } from "discord.js";
import { SysEmbed } from "../typings/utils";
import { getSettings } from "../schemas/Guild";

const moderatorConfig = async (action: 'ADD' | 'REMOVE' | 'LIST', guild: Guild, role?: Role): Promise<SysEmbed> => {
    const settings = await getSettings(guild)
    if (action != "LIST") {
        if (action == 'ADD') {
            if (settings.moderatorRoles?.includes(role!.id)) return {
                message: `${role} is already a moderator role.`,
                type: 'ERROR'
            }
            settings.moderatorRoles.push(role!.id)
        } else if (action == 'REMOVE') {
            if (!settings.moderatorRoles?.includes(role!.id)) return {
                message: `${role} is not a moderator role.`,
                type: 'ERROR'
            }
            settings.moderatorRoles.splice(settings.moderatorRoles.indexOf(role!.id), 1)
        }
        await settings.save()
        return {
            message: `${action == 'ADD' ? 'Added' : 'Removed'} ${role} as a moderator role.`,
            type: 'SUCCESS'
        }
    } else {
        let result = ''
        settings.moderatorRoles?.length > 0 ? settings.moderatorRoles.forEach(role => {
            result += `${guild.roles.cache.get(role)} `
        }) : result = 'No moderator roles'
        return {
            message: result,
            type: 'SUCCESS'
        }
    }
}

const bannedWords = async (action: 'ADD' | 'REMOVE' | 'LIST' | 'TOGGLE', guild: Guild, args?: string): Promise<SysEmbed> => {
    const settings = await getSettings(guild)
    if (action == 'ADD') {
        //Seperate words by comma and remove any spaces
        const wordArray = args!.split(',').map(word => word.trim())
        wordArray.forEach(word => {
            if (settings.bannedWords?.includes(word)) {
                wordArray.splice(wordArray.indexOf(word), 1)
                return {
                    message: `${word} is already a banned word.`,
                    type: 'ERROR'
                }
            }
            settings.bannedWords.push(word)
        })
        await settings.save()
        return {
            message: `Added ${wordArray.join(', ')} as banned words.`,
            type: 'SUCCESS'
        }

    }
    if (action == 'REMOVE') {
        //Seperate words by comma and remove any spaces
        const wordArray = args!.split(',').map(word => word.trim())
        wordArray.forEach(word => {
            if (!settings.bannedWords?.includes(word)) {
                wordArray.splice(wordArray.indexOf(word), 1)
                return {
                    message: `${word} is not a banned word.`,
                    type: 'ERROR'
                }
            }
            settings.bannedWords.splice(settings.bannedWords.indexOf(word), 1)
        })
        await settings.save()
        return {
            message: `Removed ${args} from the banned words list`,
            type: 'SUCCESS'
        }
    }
    if (action == 'LIST') {
        let result = ''
        settings.bannedWords?.length > 0 ? settings.bannedWords.forEach(word => {
            result += `${word} `
        }) : result = 'No banned words'
        return {
            message: result,
            type: 'SUCCESS'
        }
    }
    if (action == "TOGGLE") {
        let action = false
        if (args === 'ENABLE') action = true
        settings.automod.bannedWords = action
        await settings.save()
        return {
            message: `Banned words automoderation has been ${settings.automod.bannedWords ? 'enabled' : 'disabled'}`,
            type: 'SUCCESS'
        }
    }
    return {
        message: 'Something went wrong',
        type: 'ERROR'
    }
}


export {
    moderatorConfig,
    bannedWords
}