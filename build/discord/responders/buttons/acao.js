import { createResponder } from "#base";
import { ResponderType } from "@constatic/base";
import { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } from "discord.js";
import { acoesEmAndamento, montarContainerAcao, persistAcao, deletePersistedAcao } from "../modals/acao.js";
const sessoesFinalizacaoAcao = new Map();
const sessoesEdicaoAcao = new Map();
createResponder({
    customId: "acao/participar",
    types: [ResponderType.Button],
    cache: "cached",
    async run(interaction) {
        try {
            const msgId = interaction.message.id;
            const acao = acoesEmAndamento.get(msgId);
            if (!acao) {
                await interaction.reply({ flags: ["Ephemeral"], content: "Ação não encontrada." });
                return;
            }
            const userId = interaction.user.id;
            if (acao.participantes.length < acao.vagas) {
                if (!acao.participantes.includes(userId)) {
                    acao.participantes.push(userId);
                    acao.reservas = acao.reservas.filter(id => id !== userId);
                }
            }
            else {
                await interaction.reply({ flags: ["Ephemeral"], content: "Vagas preenchidas. Entre como reserva." });
                return;
            }
            const container = montarContainerAcao(acao);
            await persistAcao(msgId);
            await interaction.update({ components: [container] });
        }
        catch (error) {
            console.error("[Acao-Participar]", error);
        }
    }
});
createResponder({
    customId: "acao/reserva",
    types: [ResponderType.Button],
    cache: "cached",
    async run(interaction) {
        try {
            const msgId = interaction.message.id;
            const acao = acoesEmAndamento.get(msgId);
            if (!acao) {
                await interaction.reply({ flags: ["Ephemeral"], content: "Ação não encontrada." });
                return;
            }
            const userId = interaction.user.id;
            if (!acao.reservas.includes(userId)) {
                acao.reservas.push(userId);
                acao.participantes = acao.participantes.filter(id => id !== userId);
            }
            const container = montarContainerAcao(acao);
            await persistAcao(msgId);
            await interaction.update({ components: [container] });
        }
        catch (error) {
            console.error("[Acao-Reserva]", error);
        }
    }
});
createResponder({
    customId: "acao/sair",
    types: [ResponderType.Button],
    cache: "cached",
    async run(interaction) {
        try {
            const msgId = interaction.message.id;
            const acao = acoesEmAndamento.get(msgId);
            if (!acao) {
                await interaction.reply({ flags: ["Ephemeral"], content: "Ação não encontrada." });
                return;
            }
            const userId = interaction.user.id;
            acao.participantes = acao.participantes.filter(id => id !== userId);
            acao.reservas = acao.reservas.filter(id => id !== userId);
            const container = montarContainerAcao(acao);
            await persistAcao(msgId);
            await interaction.update({ components: [container] });
        }
        catch (error) {
            console.error("[Acao-Sair]", error);
        }
    }
});
createResponder({
    customId: "acao/iniciar",
    types: [ResponderType.Button],
    cache: "cached",
    async run(interaction) {
        try {
            const msgId = interaction.message.id;
            const acao = acoesEmAndamento.get(msgId);
            if (!acao) {
                await interaction.reply({ flags: ["Ephemeral"], content: "Ação não encontrada." });
                return;
            }
            acao.pingMsgId = "iniciada";
            const criador = await interaction.client.users.fetch(acao.criadorId);
            const dmMsg = [
                `# ⚡ PRESSÁGIO - OPERAÇÃO INICIADA`,
                ``,
                `> **👤 Operador:** ${criador.globalName ?? criador.username}`,
                `> **📍 Ação:** ${acao.nome}`,
                `> **🕒 Horário:** ${acao.horario}`,
                `> **🔫 Armamento:** ${acao.armamento}`,
                `> `,
                `> **STATUS:** Ação em andamento.`,
                `> *Mantenha o foco e siga as regras da ação.*`,
                `> `,
                `> **ONE NETWORK © 2026**`,
            ].join("\n");
            for (const pid of acao.participantes) {
                const member = await interaction.client.users.fetch(pid).catch(() => null);
                if (member)
                    member.send(dmMsg).catch(() => { });
            }
            const container = montarContainerAcao(acao);
            await persistAcao(msgId);
            await interaction.update({ components: [container] });
        }
        catch (error) {
            console.error("[Acao-Iniciar]", error);
        }
    }
});
createResponder({
    customId: "acao/vitoria",
    types: [ResponderType.Button],
    cache: "cached",
    async run(interaction) {
        try {
            const msgId = interaction.message.id;
            const acao = acoesEmAndamento.get(msgId);
            if (!acao) {
                await interaction.reply({ flags: ["Ephemeral"], content: "Ação não encontrada." });
                return;
            }
            if (interaction.user.id !== acao.criadorId) {
                await interaction.reply({ flags: ["Ephemeral"], content: "Apenas o criador pode finalizar." });
                return;
            }
            const valInput = new TextInputBuilder()
                .setCustomId("valor_vitoria")
                .setLabel("Valor Total Ganho")
                .setStyle(TextInputStyle.Short)
                .setRequired(true);
            const modal = new ModalBuilder()
                .setCustomId("acao/valor-vitoria")
                .setTitle("Valor da Vitória")
                .addComponents(new ActionRowBuilder({ components: [valInput] }));
            await interaction.showModal(modal);
            sessoesFinalizacaoAcao.set(interaction.user.id, msgId);
        }
        catch (error) {
            console.error("[Acao-Vitoria]", error);
        }
    }
});
createResponder({
    customId: "acao/derrota",
    types: [ResponderType.Button],
    cache: "cached",
    async run(interaction) {
        try {
            const msgId = interaction.message.id;
            const acao = acoesEmAndamento.get(msgId);
            if (!acao) {
                await interaction.reply({ flags: ["Ephemeral"], content: "Ação não encontrada." });
                return;
            }
            if (interaction.user.id !== acao.criadorId) {
                await interaction.reply({ flags: ["Ephemeral"], content: "Apenas o criador pode finalizar." });
                return;
            }
            const container = montarContainerAcao(acao, { status: "derrota" });
            await deletePersistedAcao(msgId);
            await interaction.update({ components: [container] });
        }
        catch (error) {
            console.error("[Acao-Derrota]", error);
        }
    }
});
createResponder({
    customId: "acao/valor-vitoria",
    types: [ResponderType.ModalComponent],
    cache: "cached",
    async run(interaction) {
        try {
            const valor = interaction.fields.getTextInputValue("valor_vitoria");
            const msgId = sessoesFinalizacaoAcao.get(interaction.user.id);
            if (!msgId)
                return;
            const acao = acoesEmAndamento.get(msgId);
            if (!acao)
                return;
            const container = montarContainerAcao(acao, {
                status: "vitoria",
                valorTotal: parseInt(valor),
            });
            await deletePersistedAcao(msgId);
            sessoesFinalizacaoAcao.delete(interaction.user.id);
            await interaction.update({ components: [container] });
        }
        catch (error) {
            console.error("[Acao-ValorVitoria]", error);
        }
    }
});
createResponder({
    customId: "acao/encerrar",
    types: [ResponderType.Button],
    cache: "cached",
    async run(interaction) {
        try {
            const msgId = interaction.message.id;
            const acao = acoesEmAndamento.get(msgId);
            if (!acao) {
                await interaction.reply({ flags: ["Ephemeral"], content: "Ação não encontrada." });
                return;
            }
            if (interaction.user.id !== acao.criadorId) {
                await interaction.reply({ flags: ["Ephemeral"], content: "Apenas o criador pode encerrar a ação." });
                return;
            }
            const container = montarContainerAcao(acao, { status: "encerrada" });
            await deletePersistedAcao(msgId);
            await interaction.update({ components: [container] });
        }
        catch (error) {
            console.error("[Acao-Encerrar]", error);
        }
    }
});
createResponder({
    customId: "acao/editar",
    types: [ResponderType.Button],
    cache: "cached",
    async run(interaction) {
        try {
            const msgId = interaction.message.id;
            const acao = acoesEmAndamento.get(msgId);
            if (!acao) {
                await interaction.reply({ flags: ["Ephemeral"], content: "Ação não encontrada." });
                return;
            }
            if (interaction.user.id !== acao.criadorId) {
                await interaction.reply({ flags: ["Ephemeral"], content: "Apenas o criador pode editar a ação." });
                return;
            }
            const nomeInput = new TextInputBuilder()
                .setCustomId("edit_nome")
                .setLabel("Nome da Ação")
                .setStyle(TextInputStyle.Short)
                .setValue(acao.nome)
                .setRequired(true);
            const horarioInput = new TextInputBuilder()
                .setCustomId("edit_horario")
                .setLabel("Horário")
                .setStyle(TextInputStyle.Short)
                .setValue(acao.horario)
                .setPlaceholder("HH:mm")
                .setRequired(true);
            const vagasInput = new TextInputBuilder()
                .setCustomId("edit_vagas")
                .setLabel("Vagas")
                .setStyle(TextInputStyle.Short)
                .setValue(String(acao.vagas))
                .setRequired(true);
            const armamentoInput = new TextInputBuilder()
                .setCustomId("edit_armamento")
                .setLabel("Armamento")
                .setStyle(TextInputStyle.Short)
                .setValue(acao.armamento)
                .setRequired(true);
            const regrasInput = new TextInputBuilder()
                .setCustomId("edit_regras")
                .setLabel("Regras (opcional)")
                .setStyle(TextInputStyle.Paragraph)
                .setValue(acao.regras ?? "")
                .setRequired(false);
            const modal = new ModalBuilder()
                .setCustomId("acao/editar-modal")
                .setTitle("Editar Ação")
                .addComponents(new ActionRowBuilder({ components: [nomeInput] }), new ActionRowBuilder({ components: [horarioInput] }), new ActionRowBuilder({ components: [vagasInput] }), new ActionRowBuilder({ components: [armamentoInput] }), new ActionRowBuilder({ components: [regrasInput] }));
            sessoesEdicaoAcao.set(interaction.user.id, msgId);
            await interaction.showModal(modal);
        }
        catch (error) {
            console.error("[Acao-Editar]", error);
        }
    }
});
createResponder({
    customId: "acao/editar-modal",
    types: [ResponderType.ModalComponent],
    cache: "cached",
    async run(interaction) {
        try {
            const msgId = sessoesEdicaoAcao.get(interaction.user.id);
            if (!msgId)
                return;
            const acao = acoesEmAndamento.get(msgId);
            if (!acao) {
                await interaction.reply({ flags: ["Ephemeral"], content: "Ação não encontrada." });
                return;
            }
            if (interaction.user.id !== acao.criadorId) {
                await interaction.reply({ flags: ["Ephemeral"], content: "Apenas o criador pode editar a ação." });
                return;
            }
            const nome = interaction.fields.getTextInputValue("edit_nome");
            const horario = interaction.fields.getTextInputValue("edit_horario");
            const vagas = parseInt(interaction.fields.getTextInputValue("edit_vagas"));
            const armamento = interaction.fields.getTextInputValue("edit_armamento");
            const regras = interaction.fields.getTextInputValue("edit_regras");
            if (isNaN(vagas) || vagas < 1) {
                await interaction.reply({ flags: ["Ephemeral"], content: "Número de vagas inválido." });
                return;
            }
            acao.nome = nome;
            acao.horario = horario;
            acao.vagas = vagas;
            acao.armamento = armamento;
            acao.regras = regras || undefined;
            const container = montarContainerAcao(acao);
            await persistAcao(msgId);
            sessoesEdicaoAcao.delete(interaction.user.id);
            await interaction.update({ components: [container] });
        }
        catch (error) {
            console.error("[Acao-EditarModal]", error);
        }
    }
});
createResponder({
    customId: "acao/regras",
    types: [ResponderType.Button],
    cache: "cached",
    async run(interaction) {
        try {
            const msgId = interaction.message.id;
            const acao = acoesEmAndamento.get(msgId);
            if (!acao) {
                await interaction.reply({ flags: ["Ephemeral"], content: "Ação não encontrada." });
                return;
            }
            const parts = [
                `# 📕 REGRAS DA AÇÃO — ${acao.nome}`,
                ``,
                `**👤 Operador:** <@${acao.criadorId}>`,
                `**🔫 Armamento:** ${acao.armamento}`,
                `**⏱️ Horário:** ${acao.horario}`,
                ``,
            ];
            if (acao.regras) {
                parts.push(`📖 **Regras:** ${acao.regras}`);
                parts.push("");
            }
            else {
                parts.push(`**1.** Respeite todos os participantes.`);
                parts.push(`**2.** Siga as orientações do operador.`);
                parts.push(`**3.** Mantenha o armamento obrigatório: **${acao.armamento}**`);
                parts.push(`**4.** Esteja presente no horário: **${acao.horario}**`);
                parts.push(`**5.** A reserva entra caso haja desistência.`);
                parts.push(`**6.** Descumprimento das regras pode resultar em remoção da ação.`);
                parts.push("");
            }
            await interaction.reply({
                flags: ["Ephemeral"],
                content: parts.join("\n"),
            });
        }
        catch (error) {
            console.error("[Acao-Regras]", error);
        }
    }
});
