import * as fs from 'fs'
import path from 'path'

module.exports = async (client: any) => {
    client.handleEvents = async () => {
        const events = fs.readdirSync(path.join(__dirname, `../../events`))
        events.forEach((folder) => {
            const eventFolders = fs
                .readdirSync(path.resolve(path.join(__dirname, `../../events/${folder}`)))
                .filter(file => { return (file.endsWith('.js') || file.endsWith('.ts')) })

            eventFolders.forEach(async (file) => {
                const event = require(path.join(__dirname, `../../events/${folder}/${file}`))
                if(event.once) await client.once(event.name, (...args:any)=>event.execute(...args,client))
                else await client.on(event.name, (...args:any) => event.execute(...args,client))
            })
        })
    }
}