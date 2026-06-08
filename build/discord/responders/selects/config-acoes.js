import { createResponder } from "#base";
import { ResponderType } from "@constatic/base";
import { ButtonBuilder, ButtonStyle, ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import { createContainer, createRow, Separator } from "@magicyan/discord";
import { getAcoesTemplates, deleteAcaoTemplate } from "#database";
import { montarContainerAcoesConfig } from "../../data/config.js";
export const selectedAcaoId = new Map();
export const regrasSelectedId = new Map();
function montarContainerAcoesComSelecao(templates, selectedId) {
    const template = templates.find(t => t.id === selectedId);
    const lines = templates.map((t, i) => {
        const prefix = t.id === selectedId ? "**➡️" : `${i + 1}.`;
        return `${prefix} ${t.nome}**\n   🔫 ${t.armamento} — 👥 ${t.vagasMin}-${t.vagasMax} vagas`;
    });
    return createContainer("#FFFFFF", "**🎯 Configuração de Ações**", Separator.Default, lines.join("\n\n"), Separator.Default, "**Ação selecionada:**", `**${template.nome}** — 🔫 ${template.armamento} — 👥 ${template.vagasMin}-${template.vagasMax} vagas`, Separator.Default, createRow(new ButtonBuilder()
        .setCustomId("config/acoes/editar")
        .setLabel("Editar")
        .setStyle(ButtonStyle.Secondary), new ButtonBuilder()
        .setCustomId("config/acoes/excluir")
        .setLabel("Excluir")
        .setStyle(ButtonStyle.Secondary), new ButtonBuilder()
        .setCustomId("config/menu/voltar")
        .setLabel("Voltar")
        .setStyle(ButtonStyle.Secondary)));
}
createResponder({
    customId: "config/acoes/selecionar",
    types: [ResponderType.StringSelect],
    cache: "cached",
    async run(interaction) {
        const selectedId = interaction.values[0];
        const key = `${interaction.guildId}-${interaction.user.id}`;
        selectedAcaoId.set(key, selectedId);
        const templates = await getAcoesTemplates(interaction.guildId);
        const container = montarContainerAcoesComSelecao(templates, selectedId);
        await interaction.update({ components: [container] });
    }
});
createResponder({
    customId: "config/acoes/excluir-select",
    types: [ResponderType.StringSelect],
    cache: "cached",
    async run(interaction) {
        const acaoId = interaction.values[0];
        await deleteAcaoTemplate(interaction.guildId, acaoId);
        const templates = await getAcoesTemplates(interaction.guildId);
        const container = montarContainerAcoesConfig(templates);
        await interaction.update({ components: [container] });
    }
});
createResponder({
    customId: "config/acoes/regras-select",
    types: [ResponderType.StringSelect],
    cache: "cached",
    async run(interaction) {
        const acaoId = interaction.values[0];
        const key = `${interaction.guildId}-${interaction.user.id}`;
        regrasSelectedId.set(key, acaoId);
        const templates = await getAcoesTemplates(interaction.guildId);
        const template = templates.find(t => t.id === acaoId);
        if (!template) {
            await interaction.reply({ flags: ["Ephemeral"], content: "❌ Ação não encontrada." });
            return;
        }
        const regrasValue = template.regras?.includes("\n") ? "" : (template.regras ?? "");
        const modal = new ModalBuilder()
            .setCustomId("config/acoes/regras-modal")
            .setTitle(`Regras: ${template.nome}`)
            .addComponents(new ActionRowBuilder({ components: [
                new TextInputBuilder()
                    .setCustomId("regras_regras")
                    .setLabel("Link das Regras")
                    .setPlaceholder("https://...")
                    .setStyle(TextInputStyle.Short)
                    .setRequired(false)
                    .setValue(regrasValue),
            ] }));
        await interaction.showModal(modal);
    }
});
