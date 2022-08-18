import { Guild, GuildMember } from "discord.js";
import * as mongoose from 'mongoose'

const cache = new Map()

const Schema = new mongoose.Schema({
    guildID: {
        type: String,
        required: true
    },
    memberID: {
        type: String,
        required: true
    },
    mute: {
        active: Boolean,
        unmutedAt: Date || null
    }
})
const Model = mongoose.model("members", Schema);

const getMember = async (guild: Guild, member: GuildMember) => {
    const key = `${guild.id}|${member.id}`
    if (cache.has(key)) return cache.get(key)
    let memberData = await Model.findOne({
        guildID: guild.id,
        memberID: member.id
    })
    if (!memberData) {
        memberData = new Model({
            guildID: guild.id,
            memberID: member.id,
        })
        await memberData.save()
    }
    cache.set(key, memberData)
    return memberData
}

const getMutedMembers = async() => {
    return await Model.find({
        'mute.active': true,
        'mute.unmutedAt': {$ne:null}
    })
}

export{
    getMember,
    getMutedMembers
}
