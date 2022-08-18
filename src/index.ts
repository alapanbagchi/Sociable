require('dotenv').config()
const { BOT_TOKEN, MONGO_URI } = process.env
import { Collection, GatewayIntentBits } from 'discord.js'
const { Client } = require('discord.js')
import * as fs from 'fs'
import * as path from 'path'
const mongoose = require('mongoose')

const client = new Client({
    intents: [GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildInvites,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildWebhooks,
    GatewayIntentBits.GuildEmojisAndStickers
    ],
})
client.commands = new Collection()
client.commandArray = []


const functionFolders = fs.readdirSync(path.resolve(path.join(__dirname, `/functions`)))
console.log(path.resolve(path.join(__dirname, './functions/handlers')))
functionFolders.forEach((folder) => {
    const functionFiles = fs
        .readdirSync(path.resolve(path.join(__dirname, `./functions/${folder}`)))
    functionFiles.forEach((file) => {
        console.log(file)
        require(path.resolve(path.join(__dirname, `/functions/${folder}/${file}`)))(client);
    })
})

const initializeMongoose = async () => {
    await mongoose.connect(MONGO_URI, {
        keepAlive: true,
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    console.log("Connected to mongoDB")
}

initializeMongoose()


client.handleEvents()

client.login(BOT_TOKEN)



