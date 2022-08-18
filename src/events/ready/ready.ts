module.exports = {
    name: 'ready',
    once: true,
    async execute(client:any) {
        console.log(`${client.user.tag} is online!`)
        client.handleCommands()
    }
}

