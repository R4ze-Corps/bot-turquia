import { createCommand } from "#base";
import { ApplicationCommandType, ButtonBuilder, ButtonStyle } from "discord.js";
import { createContainer, createRow, Separator } from "@magicyan/discord";
createCommand({
    name: "vendas",
    description: "Registrar uma venda",
    type: ApplicationCommandType.ChatInput,
    async run(interaction) {
        try {
            const guild = interaction.guild;
            if (!guild) {
                await interaction.reply({ flags: ["Ephemeral"], content: "Este comando só pode ser usado em servidores." });
                return;
            }
            const container = createContainer("#FFFFFF", "**💵 Sistema de Vendas**", Separator.Default, "Selecione o tipo de venda:", Separator.Default, createRow(new ButtonBuilder()
                .setCustomId("vendas/tipo/parceria")
                .setLabel("Parceria")
                .setEmoji("🤝")
                .setStyle(ButtonStyle.Secondary), new ButtonBuilder()
                .setCustomId("vendas/tipo/pista")
                .setLabel("Pista")
                .setEmoji("🏪")
                .setStyle(ButtonStyle.Secondary)));
            await interaction.reply({
                components: [container],
                flags: ["IsComponentsV2"],
            });
        }
        catch (error) {
            console.error("[Vendas-Command]", error);
            if (!interaction.replied) {
                await interaction.reply({ flags: ["Ephemeral"], content: "❌ Erro ao abrir vendas." }).catch(() => { });
            }
        }
    }
});
