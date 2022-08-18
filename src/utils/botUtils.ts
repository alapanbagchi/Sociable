import { BitField, ColorResolvable, Colors, EmbedBuilder, PermissionFlagsBits } from "discord.js"
import {config} from '../config'

const embed = (description:string, status:"SUCCESS" | "ERROR" | "INFO"):EmbedBuilder => {
    let symbol = ''
    let color:ColorResolvable = Colors.Purple
    if(status === "ERROR") 
    {
        // symbol = '🚫'
        color = Colors.Red
    }
    else if(status === "SUCCESS"){
        //  symbol = '✅'
         color = Colors.Green
    }

    const embed = new EmbedBuilder()
    .setDescription(`${description}`)
    .setColor(color)

    return embed
}

const permissionExtract = (bitfield:bigint) => {
    return Object.entries(PermissionFlagsBits).find(perm=>{
        console.log(perm[1], bitfield)
        perm[1] == bitfield
    })
}



export {
    embed,
    permissionExtract,
}