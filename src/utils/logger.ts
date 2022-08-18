import { Embed, EmbedBuilder, WebhookClient } from 'discord.js';
import moment from 'moment';
import chalk from 'chalk';
const { EMBED_COLORS } = require("../config")


const errorWebhook = process.env.ERROR_LOGS ? new WebhookClient({
    url:
        process.env.ERROR_LOGS
}) : null

const sendWebhook = (content: string, err: any) => {
    if (!content && !err) return
    const errString = err?.stack || err

    const embed = new EmbedBuilder()
        .setAuthor(err?.name || "ERROR")
        .setDescription("```js\n" + (errString.length > 4096 ? `${errString.substring(0, 4096)}...` : errString) + "\n```")
        .setColor(EMBED_COLORS.ERROR)

    if (err?.description) embed.addFields({ name: "Description", value: content })
    if (err?.message) embed.addFields({ name: "Message", value: err?.message })
    errorWebhook?.send({
        username: "Logs",
        embeds: [embed]
    })
}

const sendLogs = (level: "LOG" | "SUCCESS" | "WARN" | "ERROR" | "DEBUG", content: string, data?: string) => {
    const timestamp = `${moment().format("yyyy-MM-DD HH:mm:ss:SSS")}`

    switch (level) {
        case "LOG": console.log(`[${chalk.cyan(timestamp)}] [${chalk.blueBright("INFO")}] ${content}`)
            break;
        case "SUCCESS":
            console.log(`[${chalk.cyan(timestamp)}] [${chalk.green(level)}] ${content} `);
            break;
        case "WARN":
            console.log(`[${chalk.cyan(timestamp)}] [${chalk.yellow("warn")}] ${content} `);
            break;

        case "ERROR":
            console.log(`[${chalk.cyan(timestamp)}] [${chalk.redBright(level)}] ${content} ${data ? ": " + data : ""}`);
            if (errorWebhook) sendWebhook(content, data);
            break;

        case "DEBUG":
            break;

        default:
            break;
    }
}

exports.success = (content: string) => sendLogs("SUCCESS", content);
exports.warn = (content: string) => sendLogs("WARN", content);
exports.error = (content: string, ex: any) => sendLogs("ERROR", content, ex);
exports.debug = (content: string) => sendLogs("DEBUG", content);
exports.log = (content: string) => sendLogs("LOG", content);
