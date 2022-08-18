import CommandData from '../../typings/Commands'
import { Collection, Guild, Message, REST, Routes } from 'discord.js'
import * as fs from 'fs'
import * as path from 'path'
import { config } from '../../config'

const slashCommands: Collection<string, CommandData> = new Collection()

module.exports = async (client: any) => {
    const { commands, commandArray } = client
    client.handleCommands = () => {
        const commandFolders = fs.readdirSync(path.join(__dirname, `../../commands`))
        commandFolders.forEach((folder) => {
            const commandFiles = fs
                .readdirSync(path.join(__dirname, `../../commands/${folder}`))
                .filter(file => { return (file.endsWith('.js') || file.endsWith('.ts')) })

            commandFiles.forEach((file) => {
                const command = require(`../../commands/${folder}/${file}`)

                commands.set(command.name, command)
                commandArray.push(command, JSON.stringify(command))
                if (command.slashCommand.enabled) {
                    if (slashCommands.has(command.name)) {
                        throw new Error(`Slash command with name ${command.name} already exists`)
                    }
                    slashCommands.set(command.name, command)
                } else {
                    console.log(`Skipping slash command ${command.name} because it is disabled`)
                }
            }
            )
        })
        registerInteractions(config.INTERACTONS.TEST_GUILD_ID, client)
    }
}

const registerInteractions = async (guildID: string, client: any) => {
    const toRegister: any = []

    //Filter slash commands
    if (config.INTERACTONS.SLASH) {
        slashCommands.map((cmd: CommandData) => ({
            name: cmd.name,
            description: cmd.description,
            options: cmd.slashCommand.options,
        })).forEach((s) => {
            toRegister.push(s)
        })
        if (config.INTERACTONS.TEST_GUILD_ID) {
            const guild = await client.guilds.cache.get(guildID)
            if (guild) {
                await guild.commands.set(toRegister)
            }
        } else {
            await client.application.commands.set(toRegister)
        }
       
    }

}
