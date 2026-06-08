import { createResponder } from "#base";
import { ResponderType } from "@constatic/base";
import { pendingAcaoTemplate } from "../selects/acao-template.js";
import { pendingAcaoHorario } from "../selects/acao-horario.js";
import { pendingAcaoVagas } from "../selects/acao-vagas.js";
import { montarContainerAcao, acoesEmAndamento, persistAcao } from "../modals/acao.js";
createResponder({
    customId: "acao/avancar",
    types: [ResponderType.Button],
    cache: "cached",
    async run(interaction) {
        try {
            const template = pendingAcaoTemplate.get(interaction.user.id);
            const horario = pendingAcaoHorario.get(interaction.user.id);
            const vagas = pendingAcaoVagas.get(interaction.user.id);
            if (!template) {
                await interaction.reply({ flags: ["Ephemeral"], content: "❌ Selecione uma ação." });
                return;
            }
            if (!horario) {
                await interaction.reply({ flags: ["Ephemeral"], content: "❌ Selecione um horário." });
                return;
            }
            if (!vagas || vagas < template.vagasMin || vagas > template.vagasMax) {
                await interaction.reply({ flags: ["Ephemeral"], content: `❌ Selecione as vagas (${template.vagasMin} até ${template.vagasMax}).` });
                return;
            }
            const acao = {
                nome: template.nome,
                horario,
                vagas,
                armamento: template.armamento,
                criadorId: interaction.user.id,
                participantes: [],
                reservas: [],
                regras: template.regras,
                channelId: interaction.channelId,
                guildId: interaction.guildId,
            };
            pendingAcaoTemplate.delete(interaction.user.id);
            pendingAcaoHorario.delete(interaction.user.id);
            pendingAcaoVagas.delete(interaction.user.id);
            const container = montarContainerAcao(acao);
            const res = await interaction.update({
                components: [container],
                withResponse: true,
            });
            const msg = res.resource?.message;
            if (msg) {
                acoesEmAndamento.set(msg.id, acao);
                await persistAcao(msg.id);
            }
        }
        catch (error) {
            console.error("[Acao-Avancar]", error);
        }
    }
});
