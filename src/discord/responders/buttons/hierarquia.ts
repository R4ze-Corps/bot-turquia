import { createResponder } from "#base";
import { ResponderType } from "@constatic/base";
import { montarContainerHierarquia } from "../../data/hierarquia.js";

createResponder({
    customId: "hierarquia/atualizar",
    types: [ResponderType.Button],
    cache: "cached",
    async run(interaction) {
        const guild = interaction.guild;
        if (!guild) return;

        const container = await montarContainerHierarquia(guild);

        await interaction.update({ components: [container] });
    }
});