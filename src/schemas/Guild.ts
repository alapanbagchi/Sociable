import { Guild } from 'discord.js'
import * as mongoose from 'mongoose'

const cache = new Map()

const Schema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
    },
    data: {
        name: String,
        owner: {
            id: String,
            tag: String
        },
        joinedAt: Date,
        leftAt: Date
    },
    mutedRole: String
})
const Model = mongoose.model("guild", Schema);
type GuildType = mongoose.InferSchemaType<typeof Schema>

// Gets the guild details from the database
const getSettings = async (guild: Guild): Promise<GuildType> => {
    if (cache.has(guild.id)) return cache.get(guild.id)

    let guildData = await Model.findOne({
        id: guild.id
    })

    //If the guild is not in the database, create a new entry for it
    if (!guildData) {
        guildData = new Model({
            id: guild.id,
            data: {
                name: guild.name,
                joinedAt: guild.joinedAt,
                owner: {
                    id: guild.ownerId,
                    tag: guild.members.cache.get(guild.ownerId)?.user.tag
                },
            }
        })
        await guildData.save()
    }
    cache.set(guild.id, guildData)
    return guildData
}


export {
    getSettings
}
