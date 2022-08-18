require('dotenv').config()
const { BOT_TOKEN } = process.env
import { Collection, GatewayIntentBits } from 'discord.js'
const { Client } = require('discord.js')
import * as fs from 'fs'
import * as path from 'path'

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

    


client.handleEvents()

client.login(BOT_TOKEN)



