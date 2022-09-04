import { Guild } from 'discord.js'
import * as mongoose from 'mongoose'

const cache = new Map()

interface GuildSchema {
    _id: string,
    data: {
        name: string,
        owner: {
            id: string,
            tag: string
        },
        joinedAt: Date,
        leftAt: Date,
    },
    automod: {
        bannedWords: Boolean
    },
    mutedRole: string,
    moderatorRoles: string[],
    modLogChannel: string,
    bannedWords: string[],
}

const Schema = new mongoose.Schema<GuildSchema>({
    _id: {
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
    automod: {
        bannedWords: Boolean
    },
    mutedRole: String,
    moderatorRoles: [String],
    modLogChannel: String,
    bannedWords: [String]
})
const Model = mongoose.model("guild", Schema);
type GuildType = mongoose.InferSchemaType<typeof Schema>

// Gets the guild details from the database
const getSettings = async (guild: Guild): Promise<mongoose.Document<unknown, any, GuildSchema> & GuildSchema> => {
    if (cache.has(guild.id)) return cache.get(guild.id)
    let guildData = await Model.findById(guild.id)

    //If the guild is not in the database, create a new entry for it
    if (!guildData) {
        guildData = new Model({
            _id: guild.id,
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
