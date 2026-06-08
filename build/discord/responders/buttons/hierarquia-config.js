import { createResponder } from "#base";
import { ResponderType } from "@constatic/base";
import { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import { pendingHierarquia, setHierarquiaConfig } from "#database";
import { montarContainerHierarquiaEditado } from "../../data/config.js";
import { montarMenuConfig } from "../../data/config.js";
createResponder({
    customId: "config/hierarquia/editar-nomes",
    types: [ResponderType.Button],
    cache: "cached",
    async run(interaction) {
        const key = `${interaction.guildId}-${interaction.user.id}`;
        const cargos = pendingHierarquia.get(key) ?? [];
        const textoAtual = cargos.map(c => c.nome).join("\n");
        const input = new TextInputBuilder()
            .setCustomId("nomes")
            .setLabel("Nomes dos cargos (um por linha)")
            .setStyle(TextInputStyle.Paragraph)
            .setValue(textoAtual)
            .setRequired(true);
        const modal = new ModalBuilder()
            .setCustomId("config/hierarquia/editar-nomes-modal")
            .setTitle("Editar Nomes da Hierarquia")
            .addComponents(new ActionRowBuilder({ components: [input] }));
        await interaction.showModal(modal);
    }
});
createResponder({
    customId: "config/hierarquia/editar-nomes-modal",
    types: [ResponderType.ModalComponent],
    cache: "cached",
    async run(interaction) {
        const key = `${interaction.guildId}-${interaction.user.id}`;
        const cargos = pendingHierarquia.get(key) ?? [];
        const texto = interaction.fields.getTextInputValue("nomes");
        const linhas = texto.split("\n").filter(l => l.trim().length > 0);
        if (linhas.length !== cargos.length) {
            await interaction.reply({
                flags: ["Ephemeral"],
                content: `❌ Número de linhas (${linhas.length}) não corresponde ao número de cargos selecionados (${cargos.length}).`
            });
            return;
        }
        for (let i = 0; i < cargos.length; i++) {
            cargos[i].nome = linhas[i].trim();
        }
        pendingHierarquia.set(key, cargos);
        const container = montarContainerHierarquiaEditado(cargos);
        await interaction.update({ components: [container] });
    }
});
createResponder({
    customId: "config/hierarquia/salvar",
    types: [ResponderType.Button],
    cache: "cached",
    async run(interaction) {
        const key = `${interaction.guildId}-${interaction.user.id}`;
        const cargos = pendingHierarquia.get(key);
        if (!cargos || cargos.length === 0) {
            await interaction.reply({
                flags: ["Ephemeral"],
                content: "❌ Selecione pelo menos um cargo para a hierarquia."
            });
            return;
        }
        await setHierarquiaConfig(interaction.guildId, cargos);
        pendingHierarquia.delete(key);
        const container = montarMenuConfig();
        await interaction.update({ components: [container] });
    }
});
