import { ColorResolvable, EmbedBuilder, Message } from "discord.js";
import { config } from "../config";
import { getSettings } from "../schemas/Guild";
import { embed } from "./botUtils";

const bannedWordsController = async (message: Message, client: any) => {
    try {
        if (!message.guild) return
        const settings = await getSettings(message.guild)
        if (settings.bannedWords?.length > 0 && settings.automod.bannedWords) {
            settings.bannedWords.forEach(async word => {
                //Wildcard after the end of the word
                if (word.endsWith('*')) {
                    const sentence = message.content.split(' ')
                    sentence.forEach(async msgword => {
                        if (msgword.toLowerCase().startsWith(word.replace('*', '').toLowerCase())) {
                            await message.delete()
                            return message.channel.send({
                                embeds: [
                                    new EmbedBuilder()
                                        .setDescription(`**Banned Word Detected** \n Your message has been deleted because it contained a banned word`)
                                        .setColor(config.EMBED_COLORS.ERROR as ColorResolvable)
                                ]
                            })
                        }
                    })
                }
                //Wildcard before the start of the word
                else if (word.startsWith('*')) {
                    const sentence = message.content.split(' ')
                    sentence.forEach(async msgword => {
                        if (msgword.toLowerCase().endsWith(word.replace('*', '').toLowerCase())) {
                            await message.delete()
                            return message.channel.send({
                                embeds: [
                                    new EmbedBuilder()
                                        .setDescription(`**Banned Word Detected** \n Your message has been deleted because it contained a banned word`)
                                        .setColor(config.EMBED_COLORS.ERROR as ColorResolvable)
                                ]
                            })
                        }
                    })
                }

                else if (message.content.toLowerCase().split(' ').includes(word)) {
                    const sentence = message.content.split(' ')
                    sentence.forEach(async msgword => {
                        if (msgword.toLowerCase() == word) {
                            await message.delete()
                            return message.channel.send({
                                embeds: [
                                    new EmbedBuilder()
                                        .setDescription(`**Banned Word Detected** \n Your message has been deleted because it contained a banned word`)
                                        .setColor(config.EMBED_COLORS.ERROR as ColorResolvable)
                                ]
                            })
                        }
                    })
                }
            })
        }
    } catch (err) {
        console.log(err)
    }
}











const automodHandler = async (message: Message, client: any) => {
    bannedWordsController(message, client)
}




export {
    automodHandler
}