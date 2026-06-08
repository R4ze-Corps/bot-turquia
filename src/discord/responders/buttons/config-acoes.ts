import { createResponder } from "#base";
import { ResponderType } from "@constatic/base";
import { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { createContainer, createRow, Separator } from "@magicyan/discord";
import { addAcaoTemplate, updateAcaoTemplate, deleteAcaoTemplate, getAcoesTemplates } from "#database";
import { montarContainerAcoesConfig } from "../../data/config.js";
import { selectedAcaoId, regrasSelectedId } from "../selects/config-acoes.js";

const editingAcaoId = new Map<string, string>();

function parseVagas(input: string): { min: number; max: number } | null {
    const parts = input.split("-").map(s => parseInt(s.trim()));
    if (parts.length === 1 && !isNaN(parts[0]) && parts[0] >= 2) return { min: parts[0], max: parts[0] };
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1]) && parts[0] >= 2 && parts[1] >= parts[0]) return { min: parts[0], max: parts[1] };
    return null;
}

createResponder({
    customId: "config/acoes/adicionar",
    types: [ResponderType.Button],
    cache: "cached",
    async run(interaction) {
        const modal = new ModalBuilder()
            .setCustomId("config/acoes/adicionar-modal")
            .setTitle("Adicionar Ação")
            .addComponents(
                new ActionRowBuilder({ components: [
                    new TextInputBuilder()
                        .setCustomId("acao_nome")
                        .setLabel("Nome da Ação")
                        .setPlaceholder("Ex: Banco Central")
                        .setStyle(TextInputStyle.Short)
                        .setRequired(true),
                ] }),
                new ActionRowBuilder({ components: [
                    new TextInputBuilder()
                        .setCustomId("acao_armamento")
                        .setLabel("Armamento")
                        .setPlaceholder("Ex: Fuzil, Pistola...")
                        .setStyle(TextInputStyle.Short)
                        .setRequired(true),
                ] }),
                new ActionRowBuilder({ components: [
                    new TextInputBuilder()
                        .setCustomId("acao_vagas")
                        .setLabel("Vagas ( min-max ou apenas o número)")
                        .setPlaceholder("Ex: 2-10  ou  7")
                        .setStyle(TextInputStyle.Short)
                        .setRequired(true),
                ] }),
            );

        await interaction.showModal(modal);
    }
});

createResponder({
    customId: "config/acoes/adicionar-modal",
    types: [ResponderType.ModalComponent],
    cache: "cached",
    async run(interaction) {
        const nome = interaction.fields.getTextInputValue("acao_nome");
        const armamento = interaction.fields.getTextInputValue("acao_armamento");
        const vagas = parseVagas(interaction.fields.getTextInputValue("acao_vagas"));

        if (!nome || !armamento || !vagas) {
            await interaction.reply({
                flags: ["Ephemeral"],
                content: "❌ Preencha os campos obrigatórios (nome, armamento, vagas).",
            });
            return;
        }

        await addAcaoTemplate(interaction.guildId!, { nome, armamento, vagasMin: vagas.min, vagasMax: vagas.max });

        const templates = await getAcoesTemplates(interaction.guildId!);
        const container = montarContainerAcoesConfig(templates);
        await interaction.update({ components: [container] });
    }
});

createResponder({
    customId: "config/acoes/editar",
    types: [ResponderType.Button],
    cache: "cached",
    async run(interaction) {
        const key = `${interaction.guildId}-${interaction.user.id}`;
        const acaoId = selectedAcaoId.get(key);

        if (!acaoId) {
            await interaction.reply({ flags: ["Ephemeral"], content: "❌ Selecione uma ação primeiro." });
            return;
        }

        const templates = await getAcoesTemplates(interaction.guildId!);
        const template = templates.find(t => t.id === acaoId);
        if (!template) {
            await interaction.reply({ flags: ["Ephemeral"], content: "❌ Ação não encontrada." });
            return;
        }

        editingAcaoId.set(key, acaoId);

        const vagasStr = template.vagasMin === template.vagasMax
            ? `${template.vagasMin}`
            : `${template.vagasMin}-${template.vagasMax}`;

        const modal = new ModalBuilder()
            .setCustomId("config/acoes/editar-modal")
            .setTitle(`Editar: ${template.nome}`)
            .addComponents(
                new ActionRowBuilder({ components: [
                    new TextInputBuilder()
                        .setCustomId("acao_nome")
                        .setLabel("Nome da Ação")
                        .setValue(template.nome)
                        .setStyle(TextInputStyle.Short)
                        .setRequired(true),
                ] }),
                new ActionRowBuilder({ components: [
                    new TextInputBuilder()
                        .setCustomId("acao_armamento")
                        .setLabel("Armamento")
                        .setValue(template.armamento)
                        .setStyle(TextInputStyle.Short)
                        .setRequired(true),
                ] }),
                new ActionRowBuilder({ components: [
                    new TextInputBuilder()
                        .setCustomId("acao_vagas")
                        .setLabel("Vagas ( min-max ou apenas o número)")
                        .setValue(vagasStr)
                        .setStyle(TextInputStyle.Short)
                        .setRequired(true),
                ] }),
            );

        await interaction.showModal(modal);
    }
});

createResponder({
    customId: "config/acoes/editar-modal",
    types: [ResponderType.ModalComponent],
    cache: "cached",
    async run(interaction) {
        const key = `${interaction.guildId}-${interaction.user.id}`;
        const acaoId = editingAcaoId.get(key);
        if (!acaoId) {
            await interaction.reply({ flags: ["Ephemeral"], content: "❌ Sessão expirada. Tente novamente." });
            return;
        }

        const nome = interaction.fields.getTextInputValue("acao_nome");
        const armamento = interaction.fields.getTextInputValue("acao_armamento");
        const vagas = parseVagas(interaction.fields.getTextInputValue("acao_vagas"));

        if (!nome || !armamento || !vagas) {
            await interaction.reply({
                flags: ["Ephemeral"],
                content: "❌ Preencha os campos obrigatórios (nome, armamento, vagas).",
            });
            return;
        }

        await updateAcaoTemplate(interaction.guildId!, acaoId, { nome, armamento, vagasMin: vagas.min, vagasMax: vagas.max });
        editingAcaoId.delete(key);

        const templates = await getAcoesTemplates(interaction.guildId!);
        const container = montarContainerAcoesConfig(templates);
        await interaction.update({ components: [container] });
    }
});

createResponder({
    customId: "config/acoes/excluir",
    types: [ResponderType.Button],
    cache: "cached",
    async run(interaction) {
        const key = `${interaction.guildId}-${interaction.user.id}`;
        const acaoId = selectedAcaoId.get(key);

        if (!acaoId) {
            await interaction.reply({ flags: ["Ephemeral"], content: "❌ Selecione uma ação primeiro." });
            return;
        }

        await deleteAcaoTemplate(interaction.guildId!, acaoId);
        selectedAcaoId.delete(key);

        const templates = await getAcoesTemplates(interaction.guildId!);
        const container = montarContainerAcoesConfig(templates);
        await interaction.update({ components: [container] });
    }
});

createResponder({
    customId: "config/acoes/importar",
    types: [ResponderType.Button],
    cache: "cached",
    async run(interaction) {
        const modal = new ModalBuilder()
            .setCustomId("config/acoes/importar-modal")
            .setTitle("Importar Ações (JSON)")
            .addComponents(
                new ActionRowBuilder({ components: [
                    new TextInputBuilder()
                        .setCustomId("json_data")
                        .setLabel("Cole o JSON das ações")
                        .setPlaceholder('[{"local":"Banco","bandidos":"Mín 2 (Máx 10)","armamento":"Fuzil"}]')
                        .setStyle(TextInputStyle.Paragraph)
                        .setRequired(true),
                ] }),
            );

        await interaction.showModal(modal);
    }
});

createResponder({
    customId: "config/acoes/importar-modal",
    types: [ResponderType.ModalComponent],
    cache: "cached",
    async run(interaction) {
        try {
            const json = interaction.fields.getTextInputValue("json_data").trim();
            const data = JSON.parse(json);

            function extrairMinMax(bandidos: string): { min: number; max: number } {
                const parenteses = bandidos.match(/\((\d+)/);
                const maximo = bandidos.match(/Máximo (\d+)/i);
                const obrigatorio = bandidos.match(/Obrigatório (\d+)/i);
                const minimo = bandidos.match(/Mínimo (\d+)/i);
                const primeiro = bandidos.match(/(\d+)/);

                const max = parenteses
                    ? parseInt(parenteses[1])
                    : maximo
                    ? parseInt(maximo[1])
                    : obrigatorio
                    ? parseInt(obrigatorio[1])
                    : primeiro
                    ? parseInt(primeiro[1])
                    : 0;

                const min = minimo ? parseInt(minimo[1]) : obrigatorio ? max : 2;
                return { min: Math.max(2, Math.min(min, max)), max };
            }

            const items: any[] = [];

            if (Array.isArray(data)) {
                items.push(...data);
            } else if (typeof data === "object" && data !== null) {
                for (const key of Object.keys(data)) {
                    if (Array.isArray(data[key])) {
                        items.push(...data[key]);
                    }
                }
            }

            await interaction.deferUpdate();

            let imported = 0;
            for (const item of items) {
                const nome = item.nome || item.local;
                const armamento = item.armamento;
                const vagasMin = item.vagasMin ?? item.vagas_min ?? null;
                const vagasMax = item.vagasMax ?? item.vagas_max ?? item.vagas ?? null;

                const regras = item.regras || undefined;

                if (vagasMin !== null && vagasMax !== null) {
                    if (!nome || !armamento || vagasMin < 2 || vagasMax < vagasMin) continue;
                    await addAcaoTemplate(interaction.guildId!, { nome, armamento, vagasMin, vagasMax, regras });
                    imported++;
                } else if (item.bandidos) {
                    const { min, max } = extrairMinMax(item.bandidos);
                    if (!nome || !armamento || max < 2) continue;
                    await addAcaoTemplate(interaction.guildId!, { nome, armamento, vagasMin: min, vagasMax: max, regras });
                    imported++;
                }
            }

            const templates = await getAcoesTemplates(interaction.guildId!);
            const container = montarContainerAcoesConfig(templates);

            await interaction.editReply({
                content: "Arquivo json importado! clique em voltar e após clique em ação novamente.",
                components: [container],
            });
        } catch (error) {
            console.error("[Importar JSON]", error);
            try {
                if (!interaction.replied) {
                    await interaction.reply({ flags: ["Ephemeral"], content: "❌ JSON inválido. Verifique o formato e tente novamente." });
                } else {
                    await interaction.editReply({ content: "❌ JSON inválido. Verifique o formato e tente novamente.", components: [] });
                }
            } catch {}
        }
    }
});

createResponder({
    customId: "config/acoes/regras",
    types: [ResponderType.Button],
    cache: "cached",
    async run(interaction) {
        const templates = await getAcoesTemplates(interaction.guildId!);
        if (templates.length === 0) {
            await interaction.reply({ flags: ["Ephemeral"], content: "❌ Nenhuma ação cadastrada." });
            return;
        }

        const select = new StringSelectMenuBuilder()
            .setCustomId("config/acoes/regras-select")
            .setPlaceholder("Selecione uma ação...")
            .addOptions(
                templates.map(t => ({
                    label: t.nome,
                    description: `${t.armamento} — ${t.vagasMin}-${t.vagasMax} vagas`,
                    value: t.id,
                }))
            );

        const backBtn = new ButtonBuilder()
            .setCustomId("config/menu/voltar")
            .setLabel("Voltar")
            .setStyle(ButtonStyle.Secondary);

        const container = createContainer("#FFFFFF",
            "**📜 Selecione a ação para configurar regras**",
            Separator.Default,
            createRow(select),
            Separator.Default,
            createRow(backBtn),
        );

        await interaction.update({ components: [container] });
    }
});

createResponder({
    customId: "config/acoes/regras-modal",
    types: [ResponderType.ModalComponent],
    cache: "cached",
    async run(interaction) {
        const key = `${interaction.guildId}-${interaction.user.id}`;
        const acaoId = regrasSelectedId.get(key);
        if (!acaoId) {
            await interaction.reply({ flags: ["Ephemeral"], content: "❌ Sessão expirada. Selecione a ação novamente." });
            return;
        }

        const regras = interaction.fields.getTextInputValue("regras_regras").trim() || undefined;

        await updateAcaoTemplate(interaction.guildId!, acaoId, { regras });
        regrasSelectedId.delete(key);

        const container = montarContainerAcoesConfig(await getAcoesTemplates(interaction.guildId!));
        await interaction.update({ components: [container] });
    }
});
