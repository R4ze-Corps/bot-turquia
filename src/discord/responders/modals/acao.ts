import { ButtonBuilder, ButtonStyle } from "discord.js";
import { createContainer, createRow, Separator } from "@magicyan/discord";
import type { AcaoData } from "#database";
import { setActiveAcao, deleteActiveAcao } from "#database";

export const acoesEmAndamento = new Map<string, AcaoData>();

export async function persistAcao(msgId: string): Promise<void> {
    const acao = acoesEmAndamento.get(msgId);
    if (acao) {
        await setActiveAcao(msgId, acao);
    }
}

export async function deletePersistedAcao(msgId: string): Promise<void> {
    acoesEmAndamento.delete(msgId);
    await deleteActiveAcao(msgId);
}

export function montarContainerAcao(acao: AcaoData, options?: { status: "vitoria" | "derrota" | "encerrada"; valorTotal?: number }) {
    const isFinal = options?.status !== undefined;
    const isVitoria = options?.status === "vitoria";
    const isEncerrada = options?.status === "encerrada";
    const isIniciada = !!acao.pingMsgId;

    const participantesText = acao.participantes.length > 0
        ? acao.participantes.map(id => `<@${id}>`).join("\n")
        : "Nenhum";

    const reservasText = acao.reservas.length > 0
        ? acao.reservas.map(id => `<@${id}>`).join("\n")
        : "Nenhum";

    const lines: string[] = [];

    if (isFinal) {
        if (isEncerrada) {
            lines.push(`**🚫 Ação Encerrada**`);
        } else {
            lines.push(`**🏛 Ação Finalizada**`);
        }
        lines.push("");
        lines.push(`🎯 **Ação** > ${acao.nome}`);
        lines.push(`⏱️ **Horário** > ${acao.horario}`);
        lines.push(`👥 **Vagas** > ${acao.vagas}`);
        lines.push("");
        lines.push(`**🔫 Armamento:** ${acao.armamento}`);
        lines.push("");
        lines.push(`**Participantes (${acao.participantes.length}/${acao.vagas})**`);
        lines.push(participantesText);
        if (isVitoria && options?.valorTotal) {
            lines.push("");
            lines.push("**💰 Valor Ganho**");
            lines.push(`R$: ${options.valorTotal}`);
        }
        if (!isEncerrada) {
            lines.push("");
            lines.push("**🛡️ Reservas**");
            lines.push(reservasText);
        }
        lines.push("");
        lines.push("**📊 Status**");
        if (isEncerrada) {
            lines.push("🚫 Encerrada pelo criador");
        } else {
            lines.push(isVitoria ? "✅ Vitória" : "💀 Derrota");
        }
        lines.push("");
        lines.push("**👤 Ação puxada por**");
        lines.push(`<@${acao.criadorId}>`);
    } else {
        lines.push(`**🎯 Ação** > ${acao.nome}`);
        lines.push(`**⏱️ Horário** > ${acao.horario}`);
        lines.push(`**👥 Vagas** > ${acao.vagas}`);
        lines.push("");
        lines.push(`**🔫 Armamento:** ${acao.armamento}`);
        lines.push("");
        lines.push(`**Participantes (${acao.participantes.length}/${acao.vagas})**`);
        lines.push(participantesText);
        lines.push("");
        lines.push("**🛡️ Reservas**");
        lines.push(reservasText);
        lines.push("");
        lines.push("**👤 Ação puxada por**");
        lines.push(`<@${acao.criadorId}>`);
    }

    const components: any[] = [
        lines.join("\n"),
        Separator.Default,
    ];

    if (!isFinal) {
        if (!isIniciada) {
            components.push(
                createRow(
                    new ButtonBuilder()
                        .setCustomId("acao/participar")
                        .setLabel("Participar")
                        .setEmoji({ id: "1504675350662090863", name: "user_round_plus" })
                        .setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder()
                        .setCustomId("acao/reserva")
                        .setLabel("Reserva")
                        .setEmoji({ id: "1504675352801312791", name: "user_star" })
                        .setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder()
                        .setCustomId("acao/encerrar")
                        .setLabel("Encerrar")
                        .setEmoji("🚫")
                        .setStyle(ButtonStyle.Secondary),
                ),
                Separator.Default,
                createRow(
                    new ButtonBuilder()
                        .setCustomId("acao/sair")
                        .setLabel("Sair")
                        .setEmoji({ id: "1504675348908867604", name: "log_out" })
                        .setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder()
                        .setCustomId("acao/iniciar")
                        .setLabel("Iniciar")
                        .setEmoji({ id: "1504675346690211900", name: "circle_play" })
                        .setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder()
                        .setCustomId("acao/editar")
                        .setLabel("Editar")
                        .setEmoji("✏️")
                        .setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder()
                        .setCustomId("acao/regras")
                        .setLabel("Regras")
                        .setEmoji({ id: "1504675344198799390", name: "book_marked" })
                        .setStyle(ButtonStyle.Secondary),
                ),
            );
        } else {
            components.push(
                createRow(
                    new ButtonBuilder()
                        .setCustomId("acao/vitoria")
                        .setLabel("🏆 Vitória")
                        .setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder()
                        .setCustomId("acao/derrota")
                        .setLabel("💀 Derrota")
                        .setStyle(ButtonStyle.Secondary),
                ),
            );
        }
    }

    return createContainer("#FFFFFF", ...components);
}
