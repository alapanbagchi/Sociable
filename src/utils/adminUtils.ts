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

export {
    moderatorConfig
}