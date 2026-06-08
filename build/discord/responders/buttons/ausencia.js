import { createResponder } from "#base";
import { ResponderType } from "@constatic/base";
import { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
createResponder({
    customId: "ausencia/abrir",
    types: [ResponderType.Button],
    cache: "cached",
    async run(interaction) {
        const modal = new ModalBuilder()
            .setCustomId("ausencia/modal")
            .setTitle("Justificar Ausência")
            .addComponents(new ActionRowBuilder().addComponents(new TextInputBuilder()
            .setCustomId("motivo")
            .setLabel("Qual motivo da sua ausência?")
            .setPlaceholder("Explique o porquê de não poder comparecer...")
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true)), new ActionRowBuilder().addComponents(new TextInputBuilder()
            .setCustomId("data_retorno")
            .setLabel("Qual data de retorno? (ex: 10/07/2025)")
            .setPlaceholder("Ex: 10/07/2025")
            .setStyle(TextInputStyle.Short)
            .setRequired(true)));
        await interaction.showModal(modal);
    }
});
