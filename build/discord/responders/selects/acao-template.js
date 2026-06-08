import { createResponder } from "#base";
import { ResponderType } from "@constatic/base";
import { getAcoesTemplates } from "#database";
import { montarContainerSelecaoAcao } from "../../data/acao.js";
export const pendingAcaoTemplate = new Map();
createResponder({
    customId: "acao/selecionar-template",
    types: [ResponderType.StringSelect],
    cache: "cached",
    async run(interaction) {
        try {
            const templateId = interaction.values[0];
            const templates = await getAcoesTemplates(interaction.guildId);
            const template = templates.find(t => t.id === templateId);
            if (!template) {
                await interaction.reply({ flags: ["Ephemeral"], content: "❌ Ação não encontrada." });
                return;
            }
            pendingAcaoTemplate.set(interaction.user.id, {
                nome: template.nome,
                armamento: template.armamento,
                vagasMin: template.vagasMin,
                vagasMax: template.vagasMax,
                regras: template.regras,
            });
            const container = montarContainerSelecaoAcao(templates, {
                min: template.vagasMin,
                max: template.vagasMax,
            }, template.id);
            await interaction.update({ components: [container] });
        }
        catch (error) {
            console.error("[Acao-Template]", error);
        }
    }
});
