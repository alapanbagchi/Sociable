import {ApplicationCommandData, ChatInputCommandInteraction, Interaction, Message} from 'discord.js'



interface SubCommand{
    trigger: string,
    description: string
}


type CommandCategory = "ADMIN"|"ANIME"|"AUTOMOD"|"ECONOMY"|"FUN"|"IMAGE"|"INFORMATION"|"INVITE"|"MODERATION"|"MUSIC"|"NONE"|"OWNER"|"SOCIAL"|"TICKET"|"UTILITY"

interface InteractionInfo{
    enabled:boolean,
    ephemeral:boolean,
    options: ApplicationCommandData
}

interface CommandInfo{
    enabled:boolean,
    aliases:string[],
    usage:string,
    minArgs: number,
    subcommands: SubCommand[]
}
interface SlashCommandOptions{
    name:string,
    description:string,
    type:number,
    required:boolean,
    options?:SlashCommandOptions[],
    choices?:{name:string, value:string}[]
}

interface CommandData{
    name:string,
    description:string,
    cooldown:number,
    category:CommandCategory,
    rolePermissions:string[],
    commandInfo:CommandInfo,
    slashCommand:{
        enabled:boolean,
        ephemeral:boolean,
        options:SlashCommandOptions[]
    },
    messageRun:(message:Message, args:any[]) => void,
    interactionRun:(interaction:ChatInputCommandInteraction) => void
}

export default CommandData