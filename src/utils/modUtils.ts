import { APIInteractionGuildMember, Client, Guild, GuildMember, GuildMemberManager } from "discord.js";
import { embed } from "./botUtils";


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
    return { message: `I do not have permission to ban ${target}`, type: "ERROR" }
}

export {
    banTarget,
    unbanTarget,
    muteTarget
}