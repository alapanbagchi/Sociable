import { APIInteractionGuildMember, Client, Guild, GuildMember, GuildMemberManager } from "discord.js";
import { getSettings } from "../schemas/Guild";
import { getMember } from "../schemas/Member";


const logModeration = () => {

}




const memberInteract = async (issuer: GuildMember, target: GuildMember) => {

    if (issuer.guild.ownerId === issuer.id) return true
    if (issuer.guild.ownerId === target.id) return false
    return issuer.roles.highest.position > target.roles.highest.position
}

const banTarget = async (issuer: GuildMember | APIInteractionGuildMember, target: GuildMember, reason: string, days_to_delete: number, client: any): Promise<{ message: string; type: "SUCCESS" | "ERROR" | "INFO" }> => {
    const bot = client.guilds.cache.get(target.guild.id).members.cache.get(client.user.id)
    if (!memberInteract(bot, target)) {
        return { message: `I do not have permission to ban ${target}`, type: "ERROR" }
    }
    if (!target.bannable) return {
        message: `I do not have permission to ban ${target}`, type: "ERROR"
    }
    const banned = await target.ban({ deleteMessageDays: days_to_delete, reason })
    if (banned) {
        return {
            message: `${target} has been banned ${reason ? 'for' + reason : ''}`, type: "SUCCESS"
        }
    }
    return { message: `I was unable to ban ${target}`, type: "ERROR" }
}

const unbanTarget = async (guild: Guild, issuer: GuildMember | APIInteractionGuildMember, target: string, reason: string): Promise<{ message: string; type: "SUCCESS" | "ERROR" | "INFO"; }> => {
    try {
        let bans = await guild.bans.fetch()
        let bannedUser = bans.find(user => user.user.id === target)
        if (bannedUser === undefined) return {
            message: `<@${target}> has not been banned yet`, type: "ERROR"
        }
        guild.members.unban(bannedUser.user)
        return {
            message: `<@${target}> has been unbanned ${reason ? 'for' + reason : ''}`, type: "SUCCESS"
        }
    } catch (err) {
        console.error('Error encountered while Unbanning the target', err);
        return {
            message: `<@${target}> could not be banned for an unknown reason`, type: "ERROR"
        }
    }
}

const muteTarget = async (issuer: GuildMember | APIInteractionGuildMember, target: GuildMember, time: number, duration: string, reason: string, client: Client): Promise<{ message: string; type: "SUCCESS" | "ERROR" | "INFO" }> => {
    console.log(time)

    try {
        const bot = client.guilds.cache.get(target.guild.id)!.members.cache.get(client.user!.id)
        if (!memberInteract(bot!, target)) {
            return { message: `I do not have permission to ban ${target}`, type: "ERROR" }
        }
        //If the member is in a voice channel disconnect them from the channel
        if (target.voice.channel) target.voice.disconnect(reason)

        const settings = await getSettings(target.guild)
        console.log(settings.mutedRole)
        if (!settings.mutedRole) return { message: `Mute role not set`, type: "ERROR" }

        const mutedRole = target.guild.roles.cache.get(settings.mutedRole)
        if (!mutedRole) return { message: `Mute role not found`, type: "ERROR" }

        //Check if the member has the muted role
        if (target.roles.cache.has(mutedRole.id)) {
            return { message: `${target} is already muted`, type: "ERROR" }
        } else {
            //Add the muted role to the member
            await target.roles.add(mutedRole)
            const memberDB = await getMember(target.guild, target)
            memberDB.mute.active = true
            let t = new Date()
            if (time != -1) {
                memberDB.mute.unmutedAt = t.setSeconds(t.getSeconds() + time / 1000)
                setTimeout(() => {
                    unmuteTarget(bot!, target, 'Mute Duration Ended', client)
                }, time)
            } else {
                memberDB.mute.unmutedAt = null
            }
            await memberDB.save()
            return { message: `${target} has been muted.  Duration: ${duration == 'undefinedundefined' ? 'Permanent' : duration}, Reason: ${reason}`, type: "SUCCESS" }
        }
    } catch (err) {
        console.log(err)
        return {
            message: `<@${target}> could not be muted due to \n > ${err}`, type: "ERROR"
        }
    }
}

const unmuteTarget = async (issuer: GuildMember | APIInteractionGuildMember, target: GuildMember, reason: string, client: Client): Promise<{ message: string; type: "SUCCESS" | "ERROR" | "INFO" }> => {

    try {
        const bot = client.guilds.cache.get(target.guild.id)!.members.cache.get(client.user!.id)
        if (!memberInteract(bot!, target)) {
            return { message: `I do not have permission to ban ${target}`, type: "ERROR" }
        }
        const memberDB = await getMember(target.guild, target)
        let settings = await getSettings(target.guild)
        if (!settings.mutedRole) return { message: `Mute role not set`, type: "ERROR" }
        let role = target.guild.roles.cache.get(settings.mutedRole)
        if (!role) return { message: `Mute role not found`, type: "ERROR" }
        if (!memberDB.mute?.active && !target.roles.cache.has(role.id)) {
            return { message: `${target} is not muted`, type: "ERROR" }
        }
        if (target.roles.cache.has(role.id)) {
            await target.roles.remove(role)
        }
        memberDB.mute.active = false
        memberDB.mute.unmutedAt = null
        await memberDB.save()
        return { message: `${target} has been unmuted`, type: "SUCCESS" }
    } catch (err) {
        console.log(err)
        return {
            message: `<@${target}> could not be unmuted due to \n > ${err}`, type: "ERROR"
        }
    }
}

const kickTarget = async (issuer: GuildMember | APIInteractionGuildMember, target: GuildMember, reason: string, client: Client): Promise<{ message: string; type: "SUCCESS" | "ERROR" | "INFO" }> => {
    try {
        const bot = client.guilds.cache.get(target.guild.id)!.members.cache.get(client.user!.id)
        if (!memberInteract(bot!, target)) {
            return { message: `I do not have permission to kick ${target}`, type: "ERROR" }
        }
        if(!target.kickable) return { message: `I do not have permission to kick ${target}`, type: "ERROR" }
        await target.kick(reason)
        return { message: `${target} has been kicked for Reason: ${reason}`, type: "SUCCESS" }
    } catch (err) {
        console.log(err)
        return {
            message: `<@${target}> could not be kicked due to \n > ${err}`, type: "ERROR"
        }
    }
}


export {
    banTarget,
    unbanTarget,
    muteTarget,
    unmuteTarget,
    kickTarget
}