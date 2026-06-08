import { createResponder } from "#base";
import { ResponderType } from "@constatic/base";
import { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } from "discord.js";

export const selectedProdutoFarm = new Map<string, string>();

createResponder({
    customId: "farm/selecionar-produto",
    types: [ResponderType.StringSelect],
    cache: "cached",
    async run(interaction) {
        const produtoId = interaction.values[0];
        const key = `${interaction.guildId}-${interaction.user.id}`;
        selectedProdutoFarm.set(key, produtoId);

        const modal = new ModalBuilder()
            .setCustomId("farm/quantidade-modal")
            .setTitle("Quantidade")
            .addComponents(
                new ActionRowBuilder({ components: [
                    new TextInputBuilder()
                        .setCustomId("farm_quantidade")
                        .setLabel("Quantidade a entregar")
                        .setPlaceholder("Ex: 5")
                        .setStyle(TextInputStyle.Short)
                        .setRequired(true),
                ] }),
            );

        await interaction.showModal(modal);
    }
});
