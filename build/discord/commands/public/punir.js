import { createCommand } from "#base";
import { ApplicationCommandType, ApplicationCommandOptionType, PermissionFlagsBits } from "discord.js";
import { getPunishmentConfig } from "#database";
createCommand({
    name: "punir",
    description: "Aplica uma advertência a um usuário",
    type: ApplicationCommandType.ChatInput,
    defaultMemberPermissions: PermissionFlagsBits.ModerateMembers,
    options: [
        { name: "usuario", description: "Usuário a ser punido", type: ApplicationCommandOptionType.User, required: true },
        { name: "motivo", description: "Motivo da punição", type: ApplicationCommandOptionType.String, required: true },
    ],
    async run(interaction) {
        try {
            const guild = interaction.guild;
            if (!guild)
                return;
            const config = await getPunishmentConfig(guild.id);
            if (!config.advertencia1 || !config.advertencia2 || !config.advertencia3) {
                await interaction.reply({ flags: ["Ephemeral"], content: "❌ Os cargos de advertência não foram configurados. Peça a um administrador para configurar em `/config` > Punições > Cargos." });
                return;
            }
            const targetUser = interaction.options.getUser("usuario", true);
            const reason = interaction.options.getString("motivo", true);
            if (targetUser.id === interaction.user.id) {
                await interaction.reply({ flags: ["Ephemeral"], content: "❌ Você não pode punir a si mesmo." });
                return;
            }
            const member = await guild.members.fetch(targetUser.id).catch(() => null);
            if (!member) {
                await interaction.reply({ flags: ["Ephemeral"], content: "❌ Usuário não encontrado no servidor." });
                return;
            }
            const warnRoles = [config.advertencia1, config.advertencia2, config.advertencia3];
            const warnLabels = ["1ª", "2ª", "3ª"];
            let currentLevel = 0;
            if (member.roles.cache.has(config.advertencia3)) {
                await interaction.reply({ flags: ["Ephemeral"], content: `❌ ${targetUser} já atingiu o máximo de advertências (3/3).` });
                return;
            }
            if (member.roles.cache.has(config.advertencia2))
                currentLevel = 2;
            else if (member.roles.cache.has(config.advertencia1))
                currentLevel = 1;
            await member.roles.add(warnRoles[currentLevel], reason);
            const logChannel = config.logChannelId ? guild.channels.cache.get(config.logChannelId) : null;
            if (logChannel?.isTextBased()) {
                await logChannel.send({
                    embeds: [{
                            color: 0xED4245,
                            title: "⚠️ REGISTRO DE PUNIÇÃO",
                            fields: [
                                { name: "👤 Usuário", value: `${member} (\`${member.id}\`)`, inline: true },
                                { name: "📋 Infração", value: `<@&${warnRoles[currentLevel]}>`, inline: true },
                                { name: "📝 Motivo", value: reason },
                                { name: "🛡️ Responsável", value: `${interaction.user} (\`${interaction.user.id}\`)`, inline: true },
                                { name: "📅 Data", value: new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" }), inline: true },
                            ],
                            footer: { text: "Este log foi gerado automaticamente pelo Ecossistema • ONE" },
                            timestamp: new Date().toISOString(),
                        }],
                });
            }
            await interaction.reply({
                flags: ["Ephemeral"],
                content: `✅ ${targetUser} recebeu **${warnLabels[currentLevel]} advertência**! Cargo <@&${warnRoles[currentLevel]}> aplicado. Motivo: ${reason}`,
            });
        }
        catch (error) {
            console.error("[Punir]", error);
        }
    }
});
