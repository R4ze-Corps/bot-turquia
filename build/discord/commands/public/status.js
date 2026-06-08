import { createCommand } from "#base";
import { ApplicationCommandType, RoleSelectMenuBuilder } from "discord.js";
import { createContainer, createRow, Separator } from "@magicyan/discord";
import { ButtonBuilder, ButtonStyle } from "discord.js";
import { getStatusConfig } from "#database";
function formatUptime(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const d = Math.floor(totalSeconds / 86400);
    const h = Math.floor((totalSeconds % 86400) / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    return `${d}d ${h}h ${m}m`;
}
function statusRoleLabel(config, presenceStatus, defaultLabel) {
    const map = {
        online: config.roleOnline,
        idle: config.roleAtualizando,
        dnd: config.roleInstavel,
        invisible: config.roleOffline,
    };
    const roleId = map[presenceStatus];
    return roleId ? `<@&${roleId}>` : defaultLabel;
}
createCommand({
    name: "status",
    description: "Exibe informações do bot e permite alterar o status",
    type: ApplicationCommandType.ChatInput,
    async run(interaction) {
        const client = interaction.client;
        const config = await getStatusConfig(interaction.guildId);
        const isConfigured = config.roleOnline || config.roleAtualizando || config.roleOffline || config.roleInstavel;
        if (!isConfigured) {
            const container = createContainer("#FFFFFF", "**📡 Configurar Cargos de Status**", Separator.Default, "Configure os cargos para cada status do bot.", "Os cargos serão atribuídos automaticamente ao alterar o status.", Separator.Default, "**Selecione os cargos abaixo:**", Separator.Default, createRow(new RoleSelectMenuBuilder()
                .setCustomId("config/status/role/online")
                .setPlaceholder("🟢 Online")
                .setMaxValues(1)), createRow(new RoleSelectMenuBuilder()
                .setCustomId("config/status/role/atualizando")
                .setPlaceholder("🔄 Atualizando")
                .setMaxValues(1)), createRow(new RoleSelectMenuBuilder()
                .setCustomId("config/status/role/offline")
                .setPlaceholder("⚫ Offline")
                .setMaxValues(1)), createRow(new RoleSelectMenuBuilder()
                .setCustomId("config/status/role/instavel")
                .setPlaceholder("⚠️ Instável")
                .setMaxValues(1)), Separator.Default, createRow(new ButtonBuilder()
                .setCustomId("config/status/concluir")
                .setLabel("Concluir")
                .setStyle(ButtonStyle.Secondary)));
            await interaction.reply({
                components: [container],
                flags: ["Ephemeral", "IsComponentsV2"],
            });
            return;
        }
        const ping = client.ws.ping;
        const uptime = client.uptime ?? 0;
        const botName = client.user?.username ?? "ONE NETWORK";
        const statusMap = {
            online: "🟢 Online",
            idle: "🌙 Ausente",
            dnd: "⛔ Não Perturbe",
            offline: "⚫ Offline",
        };
        const presenceStatus = client.user?.presence?.status ?? "online";
        const defaultLabel = statusMap[presenceStatus] ?? "🟢 Online";
        const statusLabel = statusRoleLabel(config, presenceStatus, defaultLabel);
        const container = createContainer("#FFFFFF", "⚙️ Informações Gerais", Separator.Default, `**Bot:** ${botName}`, `**Criador:** Megan`, Separator.Default, "📡 Desempenho e Conexão", Separator.Default, `**Ping:** ${ping}ms`, `**Uptime:** ${formatUptime(uptime)}`, `**Status do Bot:** ${statusLabel}`, Separator.Default, createRow(new ButtonBuilder()
            .setCustomId("status/online")
            .setLabel("Online")
            .setStyle(ButtonStyle.Secondary), new ButtonBuilder()
            .setCustomId("status/atualizando")
            .setLabel("Atualizando")
            .setStyle(ButtonStyle.Secondary), new ButtonBuilder()
            .setCustomId("status/offline")
            .setLabel("Offline")
            .setStyle(ButtonStyle.Secondary), new ButtonBuilder()
            .setCustomId("status/instavel")
            .setLabel("Instável")
            .setStyle(ButtonStyle.Secondary)));
        await interaction.reply({
            components: [container],
            flags: ["IsComponentsV2"],
        });
    },
});
