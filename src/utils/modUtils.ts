import { APIInteractionGuildMember, Client, Guild, GuildMember, Collection, Message, Channel, GuildChannel, TextChannel, TextBasedChannel, VoiceChannel, EmbedBuilder, Colors, ChannelType, ColorResolvable, User, GuildBan } from "discord.js";
import { config } from "../config";
import { getSettings } from "../schemas/Guild";
import { getMember } from "../schemas/Member";
import { containsLink } from "./miscUtils";

const memberInteract = async (issuer: GuildMember, target: GuildMember) => {

    if (issuer.guild.ownerId === issuer.id) return true
    if (issuer.guild.ownerId === target.id) return false
    return issuer.roles.highest.position > target.roles.highest.position
}


const logModeration = async (issuer: GuildMember | APIInteractionGuildMember, guild: Guild, target: GuildMember | string | GuildBan, reason: string, type: string, data: any) => {
    if (!type) return
    const settings = await getSettings(guild)
    let logChannel
    if (settings.modLogChannel) logChannel = guild.channels.cache.get(settings.modLogChannel) as TextChannel
    reason = reason?.length > 0 ? reason : "No Reason Provided"
    const dmEmbed = new EmbedBuilder()
    const embed = new EmbedBuilder()
    switch (type.toUpperCase()) {
        case "PURGE":
            embed
                .setAuthor({ name: type })
                .addFields(
                    {
                        name: "Issuer",
                        value: issuer.toString(),
                        inline: true
                    },
                    {
                        name: "Purge Type",
                        value: data.purgeType.toString(),
                        inline: true
                    },
                    {
                        name: "Purge Count",
                        value: data.purgeCount.toString(),
                        inline: true
                    },
                    {
                        name: "Channel",
                        value: data.channel.toString(),
                        inline: true
                    }
                )
                .setTimestamp(Date.now())
            break
        case "MUTE":
            dmEmbed
                .setTitle("You have been muted")
                .setDescription(`You have been muted in ${guild.name}`)
                .addFields(
                    { name: "Reason", value: reason, inline: true },
                    { name: "Duration", value: data.duration, inline: true },
                    {
                        name: "Appeal Form", value: "https://forms.gle/8Q5Z7Z1Z1Z1Z1Z1Z1", inline: true
                    }
                )
            break
        case "UNMUTE":
            dmEmbed
                .setTitle("You have been unmuted")
                .setDescription(`You have been unmuted in ${guild.name}`)
                .addFields(
                    { name: "Reason", value: reason, inline: true }
                )
            break;
        case "KICK":
            dmEmbed
                .setDescription(`You have been kicked from ${guild.name} ${reason ? `for ${reason}` : ''}`);
            break;
        case "BAN":
            dmEmbed
                .setTitle("You have been banned")
                .setDescription(`You have been banned from ${guild.name}`)
                .addFields({
                    name: "Reason", value: reason, inline: true
                },
                    { name: "Appeal Form", value: "https://forms.gle/8Q5Z7Z1Z1Z1Z1Z1Z1", inline: true })
            break;
        case "VMUTE":
            dmEmbed
                .setTitle("You have been voice muted")
                .setDescription(`You have been voice muted from ${guild.name}`)
                .addFields(
                    { name: "Reason", value: reason, inline: true },
                    {
                        name: "Appeal Form", value: "https://forms.gle/8Q5Z7Z1Z1Z1Z1Z1Z1", inline: true
                    }
                )
            break;
        case "VUNMUTE":
            dmEmbed
                .setDescription(`You have been voice unmuted from ${guild.name}`)
                .addFields(
                    { name: "Reason", value: reason, inline: true }
                )
            break;
        case "DEAFEN":
            dmEmbed
                .setDescription(`You have been deafened in ${guild.name}`)
                .addFields(
                    { name: "Reason", value: reason, inline: true },
                    {
                        name: "Appeal Form", value: "https://forms.gle/8Q5Z7Z1Z1Z1Z1Z1Z1", inline: true
                    }
                )
            break;
        case "UNDEAFEN":
            dmEmbed
                .setDescription(`You have been undeafened in ${guild.name}`)
                .addFields(
                    { name: "Reason", value: reason, inline: true }
                )
            break;
    }
    dmEmbed.setColor(config.EMBED_COLORS.DMEMBED as ColorResolvable)
    if (type.toUpperCase() !== "PURGE") {
        const targetMember = target as GuildMember
        embed
            .setAuthor({
                name: `${type} | ${targetMember.user.username}#${targetMember.user.discriminator} - ${targetMember.user.id}`,
                iconURL: targetMember.user.avatarURL() as string
            })
            .addFields(
                {
                    name: "Issuer",
                    value: issuer.toString(),
                    inline: true
                },
                {
                    name: "Target",
                    value: targetMember.user.toString(),
                    inline: true
                },
                {
                    name: "Reason",
                    value: reason.toString(),
                    inline: true
                },
            )
            .setColor(config.EMBED_COLORS.LOGS as ColorResolvable)
            .setTimestamp(Date.now())
        if (
            type.toUpperCase() === "MUTE"
            && data.duration.toString() != undefined)
            embed.addFields({
                name: "Duration",
                value: data.duration.toString(),
            })

        if (type.toUpperCase() === "MOVE")
            embed.addFields({
                name: "Moved To",
                value: data.channel.toString(),
            });
        //#FIX: This is not working
        console.log(type.toUpperCase())
        if (
            type.toUpperCase() !== "DISCONNECT"
            && type.toUpperCase() !== "MOVE"
            && type.toUpperCase() !== "UNBAN"
            && type.toUpperCase() !== "PURGE"
        ) {
            const targetMember = target as GuildMember
            if (targetMember) {
                await targetMember.send({
                    embeds: [dmEmbed]
                }).catch(err => {
                    console.log(err)
                })
            }
        }
    }
    if (logChannel) {
        await logChannel.send({ embeds: [embed] })
    }
}

const createMuteRole = async (guild: Guild) => {
    const settings = await getSettings(guild)
    let role = guild.roles.cache.get(settings.mutedRole)
    if (role) return role
    role = await guild.roles.create({
        name: "Muted",
        color: Colors.Grey
    })
    settings.mutedRole = role.id
    await settings.save()
    guild.channels.cache.forEach(async (channel) => {
        if (channel.type === ChannelType.GuildText) {
            const textChannel = channel as TextChannel
            await textChannel.permissionOverwrites.create(role!, {
                SendMessages: false,
                AddReactions: false,
            })
        }
        if (channel.type === ChannelType.GuildVoice) {
            const voiceChannel = channel as VoiceChannel
            await voiceChannel.permissionOverwrites.create(role!, {
                Speak: false,
                Connect: false,
            })
        }
    })
    return role
}
const banTarget = async (issuer: GuildMember | APIInteractionGuildMember, target: GuildMember, reason: string, days_to_delete: number, client: any): Promise<{ message: string; type: "SUCCESS" | "ERROR" | "INFO"; }> => {
    try {
        const bot = client.guilds.cache.get(target.guild.id).members.cache.get(client.user.id)
        if (!memberInteract(bot, target)) {
            return { message: `I do not have permission to ban ${target}`, type: "ERROR" }
        }
        if (!target.bannable) return {
            message: `I do not have permission to ban ${target}`, type: "ERROR"
        }
        await logModeration(issuer, target.guild, target, reason, "BAN", {})
        const banned = await target.ban({ deleteMessageDays: days_to_delete, reason })
        if (banned) {
            return {
                message: `${target} has been banned ${reason ? 'for' + reason : ''}`, type: "SUCCESS"
            }
        }
        return { message: `I was unable to ban ${target}`, type: "ERROR" }
    } catch (err) {
        console.log(err)
        return { message: `An unexpected error occoured while banning ${target}`, type: "ERROR" }
    }
}

const unbanTarget = async (guild: Guild, issuer: GuildMember | APIInteractionGuildMember, target: string, reason: string): Promise<{ message: string; type: "SUCCESS" | "ERROR" | "INFO"; }> => {
    try {
        let bans = await guild.bans.fetch()
        let bannedUser = await bans.find(user => user.user.id === target)
        if (bannedUser === undefined) return {
            message: `<@${target}> has not been banned yet`, type: "ERROR"
        }
        guild.members.unban(bannedUser.user)
        await logModeration(issuer, guild, bannedUser, reason, "UNBAN", {})
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
    try {
        const bot = client.guilds.cache.get(target.guild.id)!.members.cache.get(client.user!.id)
        if (!memberInteract(bot!, target)) {
            return { message: `I do not have permission to ban ${target}`, type: "ERROR" }
        }
        if (target.voice.channel) target.voice.disconnect(reason)
        let settings = await getSettings(target.guild)
        if (!settings.mutedRole) {
            await createMuteRole(target.guild)
        }
        settings = await getSettings(target.guild)
        const mutedRole = target.guild.roles.cache.get(settings.mutedRole)
        if (!mutedRole) return { message: `Mute role not found`, type: "ERROR" }
        if (target.roles.cache.has(mutedRole.id)) {
            return { message: `${target} is already muted`, type: "ERROR" }
        } else {
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
            await logModeration(issuer, target.guild, target, reason, "MUTE", {
                duration: duration == 'undefinedundefined' ? 'Permanent' : duration
            })
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
        await logModeration(issuer, target.guild, target, reason, "UNMUTE", {})
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
        if (!target.kickable) return { message: `I do not have permission to kick ${target}`, type: "ERROR" }
        await target.kick(reason)
        await logModeration(issuer, target.guild, target, reason, "KICK", {})
        return { message: `${target} has been kicked for Reason: ${reason}`, type: "SUCCESS" }
    } catch (err) {
        console.log(err)
        return {
            message: `<@${target}> could not be kicked due to \n > ${err}`, type: "ERROR"
        }
    }
}

const purgeMessages = async (issuer: GuildMember | APIInteractionGuildMember, channel: TextChannel, type: 'ALL' | 'ATTACHMENT' | 'BOT' | 'LINK' | 'USER' | 'TOKEN', amount: number, argument?: GuildMember | string): Promise<{ message: string; type: "SUCCESS" | "ERROR" | "INFO" }> => {
    const toDelete: Collection<string, Message> = new Collection()
    try {
        const messages = await channel.messages.fetch({
            limit: amount
        })
        for (const message of messages.values()) {
            if (toDelete.size >= amount) break
            if (!message.deletable) continue
            if (type === 'ALL') {
                toDelete.set(message.id, message)
            } else if (type === 'ATTACHMENT') {
                if (message.attachments.size > 0)
                    toDelete.set(message.id, message)
            } else if (type === 'TOKEN') {
                if (message.content.includes(argument as string)) {
                    toDelete.set(message.id, message)
                }
            }
            else if (type === 'BOT') {
                if (message.author.bot)
                    toDelete.set(message.id, message)
            } else if (type === 'LINK') {
                if (containsLink(message.content))
                    toDelete.set(message.id, message)
            } else if (type === 'USER') {
                if (typeof (argument) != 'string') {
                    if (message.author.id === argument!.id) {
                        toDelete.set(message.id, message)
                    }
                }
            }
        }
        const deletedMessages = await channel.bulkDelete(toDelete, true)
        await logModeration(issuer, channel.guild, "", "", "PURGE", {
            purgeType: type,
            channel: channel,
            purgeCount: deletedMessages.size
        })
        return { message: `${deletedMessages.size} messages deleted`, type: "SUCCESS" }
    } catch (err) {
        console.log(err)
        return {
            message: `Could not purge messages due to \n > ${err}`, type: "ERROR"
        }
    }
}

const voiceMute = async (issuer: GuildMember | APIInteractionGuildMember, target: GuildMember, reason: string, client: Client): Promise<{ message: string; type: "SUCCESS" | "ERROR" | "INFO" }> => {
    try {
        const bot = client.guilds.cache.get(target.guild.id)!.members.cache.get(client.user!.id)
        if (!memberInteract(bot!, target)) {
            return { message: `I do not have permission to mute ${target}`, type: "ERROR" }
        }
        if (!target.voice.channel) return { message: `${target} is not in a voice channel`, type: "ERROR" }
        if (target.voice.serverMute) return { message: `${target} is already voice muted`, type: "ERROR" }
        await target.voice.setMute(true, reason)
        await logModeration(issuer, target.guild, target, reason, "VMUTE", {})
        return { message: `${target} has been voice muted`, type: "SUCCESS" }
    } catch (err) {
        console.log(err)
        return {
            message: `<@${target}> could not be voice muted due to \n > ${err}`, type: "ERROR"
        }
    }
}

const voiceUnmute = async (issuer: GuildMember | APIInteractionGuildMember, target: GuildMember, reason: string, client: Client): Promise<{ message: string; type: "SUCCESS" | "ERROR" | "INFO" }> => {
    try {
        const bot = client.guilds.cache.get(target.guild.id)!.members.cache.get(client.user!.id)
        if (!memberInteract(bot!, target)) {
            return { message: `I do not have permission to unmute ${target}`, type: "ERROR" }
        }
        if (!target.voice.channel) return { message: `${target} is not in a voice channel`, type: "ERROR" }
        if (!target.voice.serverMute) return { message: `${target} is not voice muted`, type: "ERROR" }
        await target.voice.setMute(false, reason)
        await logModeration(issuer, target.guild, target, reason, "VUNMUTE", {})
        return { message: `${target} has been voice unmuted`, type: "SUCCESS" }
    } catch (err) {
        console.log(err)
        return {
            message: `<@${target}> could not be voice unmuted due to \n > ${err}`, type: "ERROR"
        }
    }
}

const deafen = async (issuer: GuildMember | APIInteractionGuildMember, target: GuildMember, reason: string, client: Client): Promise<{ message: string; type: "SUCCESS" | "ERROR" | "INFO" }> => {
    try {
        const bot = client.guilds.cache.get(target.guild.id)!.members.cache.get(client.user!.id)
        if (!memberInteract(bot!, target)) {
            return { message: `I do not have permission to deafen ${target}`, type: "ERROR" }
        }
        if (!target.voice.channel) return { message: `${target} is not in a voice channel`, type: "ERROR" }
        if (target.voice.serverDeaf) return { message: `${target} is already deafened`, type: "ERROR" }
        await target.voice.setDeaf(true, reason)
        await logModeration(issuer, target.guild, target, reason, "DEAFEN", {})
        return { message: `${target} has been deafened`, type: "SUCCESS" }
    } catch (err) {
        console.log(err)
        return {
            message: `<@${target}> could not be deafened due to \n > ${err}`, type: "ERROR"
        }
    }
}

const undeafen = async (issuer: GuildMember | APIInteractionGuildMember, target: GuildMember, reason: string, client: Client): Promise<{ message: string; type: "SUCCESS" | "ERROR" | "INFO" }> => {
    try {
        const bot = client.guilds.cache.get(target.guild.id)!.members.cache.get(client.user!.id)
        if (!memberInteract(bot!, target)) {
            return { message: `I do not have permission to undeafen ${target}`, type: "ERROR" }
        }
        if (!target.voice.channel) return { message: `${target} is not in a voice channel`, type: "ERROR" }
        if (!target.voice.serverDeaf) return { message: `${target} is not deafened`, type: "ERROR" }
        await target.voice.setDeaf(false, reason)
        await logModeration(issuer, target.guild, target, reason, "UNDEAFEN", {})
        return { message: `${target} has been undeafened`, type: "SUCCESS" }
    } catch (err) {
        console.log(err)
        return {
            message: `<@${target}> could not be undeafened due to \n > ${err}`, type: "ERROR"
        }
    }
}

const moveVC = async (issuer: GuildMember | APIInteractionGuildMember, target: GuildMember, channel: VoiceChannel, reason: string, client: Client): Promise<{ message: string; type: "SUCCESS" | "ERROR" | "INFO" }> => {
    try {
        const bot = client.guilds.cache.get(target.guild.id)!.members.cache.get(client.user!.id)
        if (!memberInteract(bot!, target)) {
            return { message: `I do not have permission to move ${target}`, type: "ERROR" }
        }
        if (!target.voice.channel) return { message: `${target} is not in a voice channel`, type: "ERROR" }
        if (target.voice.channel.id === channel.id) return { message: `${target} is already in ${channel}`, type: "ERROR" }
        await target.voice.setChannel(channel, reason)
        await logModeration(issuer, target.guild, target, reason, "MOVE", { channel: channel.id })
        return { message: `${target} has been moved to ${channel}`, type: "SUCCESS" }
    } catch (err) {
        console.log(err)
        return {
            message: `<@${target}> could not be moved to ${channel} due to \n > ${err}`, type: "ERROR"
        }
    }
}

const disconnectVC = async (issuer: GuildMember | APIInteractionGuildMember, target: GuildMember, reason: string, client: Client): Promise<{ message: string; type: "SUCCESS" | "ERROR" | "INFO" }> => {
    try {
        const bot = client.guilds.cache.get(target.guild.id)!.members.cache.get(client.user!.id)
        if (!memberInteract(bot!, target)) {
            return { message: `I do not have permission to kick ${target}`, type: "ERROR" }
        }
        if (!target.voice.channel) return { message: `${target} is not in a voice channel`, type: "ERROR" }
        await target.voice.disconnect(reason)
        await logModeration(issuer, target.guild, target, reason, "DISCONNECT", {})
        return { message: `${target} has been kicked from the voice channel`, type: "SUCCESS" }
    } catch (err) {
        console.log(err)
        return {
            message: `<@${target}> could not be kicked from the voice channel due to \n > ${err}`, type: "ERROR"
        }
    }
}

export {
    banTarget,
    unbanTarget,
    muteTarget,
    unmuteTarget,
    kickTarget,
    purgeMessages,
    voiceMute,
    voiceUnmute,
    deafen,
    undeafen,
    moveVC,
    disconnectVC
}