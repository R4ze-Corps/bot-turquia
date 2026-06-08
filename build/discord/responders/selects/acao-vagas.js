import { createResponder } from "#base";
import { ResponderType } from "@constatic/base";
export const pendingAcaoVagas = new Map();
createResponder({
    customId: "acao/selecionar-vagas",
    types: [ResponderType.StringSelect],
    cache: "cached",
    async run(interaction) {
        try {
            await interaction.deferUpdate();
            const vagas = parseInt(interaction.values[0]);
            pendingAcaoVagas.set(interaction.user.id, vagas);
        }
        catch (error) {
            console.error("[Acao-Vagas]", error);
        }
    }
});
