import { StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { createContainer, createRow, Separator } from "@magicyan/discord";
const HORARIOS = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, "0")}:00`);
export function montarContainerSelecaoAcao(templates, vagasOptions, selectedId) {
    const selectedNome = selectedId
        ? templates.find(t => t.id === selectedId)?.nome
        : undefined;
    const acaoSelect = new StringSelectMenuBuilder()
        .setCustomId("acao/selecionar-template")
        .setPlaceholder(selectedNome ?? "Selecione uma ação...")
        .addOptions(templates.map(t => ({
        label: t.nome,
        description: `${t.armamento} — ${t.vagasMin}-${t.vagasMax} vagas`,
        value: t.id,
        default: t.id === selectedId,
    })));
    const horarioSelect = new StringSelectMenuBuilder()
        .setCustomId("acao/selecionar-horario")
        .setPlaceholder("Selecione o horário...")
        .addOptions(HORARIOS.map(h => ({ label: h, value: h })));
    const vagasOptionsList = vagasOptions
        ? Array.from({ length: vagasOptions.max - vagasOptions.min + 1 }, (_, i) => ({
            label: `${vagasOptions.min + i}`,
            value: `${vagasOptions.min + i}`,
        }))
        : [{ label: "Selecione a ação primeiro", value: "0" }];
    const vagasSelect = new StringSelectMenuBuilder()
        .setCustomId("acao/selecionar-vagas")
        .setPlaceholder(vagasOptions ? "Selecione as vagas..." : "Ação não selecionada")
        .addOptions(vagasOptionsList);
    const avancarBtn = new ButtonBuilder()
        .setCustomId("acao/avancar")
        .setLabel("Avançar")
        .setEmoji("➡️")
        .setStyle(ButtonStyle.Secondary);
    const titleText = selectedNome
        ? `**🎯 Selecione a ação que deseja iniciar**\n\n**Ação selecionada:** ${selectedNome}`
        : "**🎯 Selecione a ação que deseja iniciar**";
    return createContainer("#FFFFFF", titleText, Separator.Default, "**Ação**", createRow(acaoSelect), Separator.Default, "**Horário**", createRow(horarioSelect), Separator.Default, "**Vagas**", createRow(vagasSelect), Separator.Default, createRow(avancarBtn));
}
