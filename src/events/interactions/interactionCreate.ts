import CommandData from "../../../src/typings/Commands";
import { embed, permissionExtract } from "../../utils/botUtils";
import { ChatInputCommandInteraction, GuildMemberRoleManager, Interaction, PermissionFlagsBits, Permissions, PermissionsBitField, RoleResolvable } from "discord.js";

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
                    ephemeral: command.slashCommand.ephemeral
                })
            }
        }
    }
}

const executeInteractions = (interaction: ChatInputCommandInteraction, client: any) => {
    const command: CommandData = client.commands.get(interaction.commandName)
    if (!interaction.member && interaction.member == null) return interaction.reply({ content: "You are not a member of this server", ephemeral: true })
    if (typeof (interaction.member.permissions) === "string") return interaction.reply({ content: "Something went wrong while checking your permissions", ephemeral: true })
    const memberRoles = interaction.member.roles as GuildMemberRoleManager
    if (command.category === "ADMIN") {
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
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
                    embeds: [embed("Moderation Roles have not been configured for this server. Please do so before using moderation commands", "ERROR")],
                    ephemeral: true
                })
            if (!memberRoles.cache.some(role => settingsDummy.moderatorRoles.includes(role.id))) return interaction.reply({
                embeds: [embed("You do not have the required permissions to run this command", "ERROR")],
                ephemeral: true
            })
        }
    }

    if (command.rolePermissions.length > 0 && !interaction.member?.permissions.has(PermissionFlagsBits.Administrator)) {
        if (!command.rolePermissions.some((role: string) => memberRoles.cache.has(role))) {
            return interaction.reply({
                embeds:[embed("You do not have the required permissions to run this command", "ERROR")],
                ephemeral: true
            })
        }
    }

    command.interactionRun(interaction)
}
