import CommandData from "@root/src/typings/Commands";
import { permissionExtract } from "../../utils/botUtils";
import { ChatInputCommandInteraction, GuildMemberRoleManager, Interaction, PermissionFlagsBits, Permissions, PermissionsBitField } from "discord.js";

const settingsDummy = {
    moderatorRoles: ["1003052041695932416"]
}

module.exports = {
    name: 'interactionCreate',
    once: false,
    async execute(interaction: ChatInputCommandInteraction, client: any) {
        if (interaction.isChatInputCommand()) {
            const { commands } = client
            const { commandName } = interaction
            const command: CommandData = commands.get(commandName)
            if (!command) return
            try {
                executeInteractions(interaction, client)
            } catch (err) {
                console.error(err)
                await interaction.reply({
                    content: `Something went wrong while executing the command`,
                    ephemeral: true
                })
            }
        }
    }
}

const executeInteractions = (interaction: ChatInputCommandInteraction, client: any) => {
    const command: CommandData = client.commands.get(interaction.commandName)
    if (command.category === "ADMIN") {
        if (!interaction.member?.permissions.has(PermissionFlagsBits.Administrator)) {
            return interaction.reply({
                content: `You have to be an Administrator to run this command`,
                ephemeral: true
            })
        }
    }

    if (command.category === "MODERATION") {
        if (!interaction.member?.permissions.has(PermissionFlagsBits.Administrator)) {
            if (settingsDummy.moderatorRoles.length === 0)
                return interaction.reply({
                    content: `Moderation Roles have not been configured for this server. Please do so before using moderation commands`,
                    ephemeral: true
                })
        }
    }
    if (command.rolePermissions.length > 0 && !interaction.member?.permissions.has(PermissionFlagsBits.Administrator)) {
        //The cache property exists on member.roles
        //@ts-ignore
        if (!command.rolePermissions.some((role: any) => interaction.member?.roles.cache.has(role))) {
            return interaction.reply({
                content: `You don't have the required roles to use this command`,
                ephemeral: true
            })
        }
    }

    command.interactionRun(interaction)
}
