import { createResponder } from "#base";
import { ResponderType } from "@constatic/base";

export const pendingAcaoHorario = new Map<string, string>();

createResponder({
    customId: "acao/selecionar-horario",
    types: [ResponderType.StringSelect],
    cache: "cached",
    async run(interaction) {
        try {
            await interaction.deferUpdate();
            const horario = interaction.values[0];
            pendingAcaoHorario.set(interaction.user.id, horario);
        } catch (error) {
            console.error("[Acao-Horario]", error);
        }
    }
});
