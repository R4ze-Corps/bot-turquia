import { ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } from "discord.js";
import { createContainer, createRow, Separator, createMediaGallery } from "@magicyan/discord";
import type { FarmProduto, FarmEntrega } from "#database";

export function montarContainerRegistrarFarm(imagemUrl?: string | null) {
    const components: any[] = [
        "📁 **REGISTRAR FARM**\n\nSeja bem-vindo ao sistema de registrar o farm, use o botão abaixo para abrir uma sala para registrar seu farm.\n",
    ];

    if (imagemUrl) {
        components.push(createMediaGallery(imagemUrl));
    }

    components.push(
        createRow(
            new ButtonBuilder()
                .setCustomId("farm/criar-sala")
                .setLabel("Registrar Farm")
                .setEmoji("🌾")
                .setStyle(ButtonStyle.Success),
        ),
    );

    return createContainer("#2B2D31", ...components);
}

export function montarContainerBoasVindas(memberId: string, produtos: FarmProduto[]) {
    const metasTexto = produtos.length > 0
        ? produtos.map(p => `📦 **${p.nome}:** ${p.meta} meta(s)`).join("\n")
        : "*Nenhum produto cadastrado*";

    const botoes: ButtonBuilder[] = [
        new ButtonBuilder()
            .setCustomId("farm/registrar")
            .setLabel("Registrar Farm")
            .setEmoji("🌾")
            .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
            .setCustomId("farm/ver-entregas")
            .setLabel("Ver Entregas")
            .setEmoji("📊")
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId("farm/finalizar")
            .setLabel("Finalizar")
            .setEmoji("🔒")
            .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
            .setCustomId("farm/fechar")
            .setLabel("Fechar Canal")
            .setEmoji("🔒")
            .setStyle(ButtonStyle.Danger),
    ];

    return createContainer("#2B2D31",
        "🚜 **Painel de Registro de Farm**",
        Separator.Default,
        `Olá <@${memberId}>, bem-vindo(a) à sua sala de farm!`,
        Separator.Default,
        "**Como registrar seu farm:**\n1️⃣ Clique em Registrar Farm.\n2️⃣ Selecione o produto que você irá entregar.\n3️⃣ Digite a quantidade que deseja entregar.",
        Separator.Default,
        "📊 **Seu progresso pode ser visto em \"Ver Entregas\"**.",
        Separator.Default,
        "**🎯 Metas de Farm:**",
        metasTexto,
        Separator.Default,
        createRow(botoes[0], botoes[1]),
        createRow(botoes[2], botoes[3]),
    );
}

export function montarContainerLog(produtos: FarmProduto[], entregas: FarmEntrega[], memberId: string, inicioTimestamp: number | null, ultimaTimestamp: number | null, status: "em_andamento" | "meta_encerrada", finalizedBy?: string, showButtons = true) {
    const inicioTexto = inicioTimestamp ? `<t:${Math.floor(inicioTimestamp / 1000)}:f>` : "—";
    const ultimaTexto = ultimaTimestamp ? `<t:${Math.floor(ultimaTimestamp / 1000)}:f>` : "—";

    const inventario = produtos.map(p => {
        const total = entregas
            .filter(e => e.produtoId === p.id)
            .reduce((s, e) => s + e.quantidade, 0);
        const batido = total >= p.meta;
        return `🔸 **${p.nome}** | ${total}/${p.meta} ${batido ? "✔" : "⏳"}`;
    }).join("\n") || "*Nenhum produto cadastrado*";

    const statusTexto = status === "em_andamento" ? "⏳ Em andamento" : "🌴 Meta Encerrada";
    const notasTexto = finalizedBy ? `<@${finalizedBy}> Encerrou o Farm` : "—";

    const components: any[] = [
        "🎯 **REGISTRO DE FARM** 🎯",
        Separator.Default,
        `**👤 Membro:** <@${memberId}>`,
        `**🕒 Data/Hora:**\n(Início: ${inicioTexto}) - (${ultimaTexto})`,
        Separator.Default,
        "**📦 INVENTÁRIO / METAS**",
        inventario,
        Separator.Default,
        `**📊 Status:** ${statusTexto}`,
        `**📝 Notas:** ${notasTexto}`,
    ];

    if (showButtons) {
        components.push(
            Separator.Default,
            createRow(
                new ButtonBuilder()
                    .setCustomId("farm/registrar")
                    .setLabel("Registrar Farm")
                    .setEmoji("🌾")
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId("farm/ver-entregas")
                    .setLabel("Ver Entregas")
                    .setEmoji("📊")
                    .setStyle(ButtonStyle.Secondary),
            ),
            createRow(
                new ButtonBuilder()
                    .setCustomId("farm/finalizar")
                    .setLabel("Finalizar")
                    .setEmoji("🔒")
                    .setStyle(ButtonStyle.Danger),
                new ButtonBuilder()
                    .setCustomId("farm/fechar")
                    .setLabel("Fechar Canal")
                    .setEmoji("🔒")
                    .setStyle(ButtonStyle.Danger),
            ),
        );
    }

    return createContainer("#2B2D31", ...components);
}

export function montarContainerSelecaoProduto(produtos: FarmProduto[]) {
    const select = new StringSelectMenuBuilder()
        .setCustomId("farm/selecionar-produto")
        .setPlaceholder("Selecione o produto...")
        .addOptions(
            produtos.map(p => ({
                label: p.nome,
                description: `Meta: ${p.meta}`,
                value: p.id,
            }))
        );

    return createContainer("#2B2D31",
        "**🌾 Registrar Farm**",
        Separator.Default,
        "Selecione o produto que você irá entregar:",
        Separator.Default,
        createRow(select),
        Separator.Default,
        createRow(
            new ButtonBuilder()
                .setCustomId("farm/voltar-painel")
                .setLabel("Voltar")
                .setStyle(ButtonStyle.Secondary),
        ),
    );
}

export function montarContainerVerEntregas(produtos: FarmProduto[], entregas: FarmEntrega[]) {
    const linhas = produtos.map(p => {
        const total = entregas
            .filter(e => e.produtoId === p.id)
            .reduce((s, e) => s + e.quantidade, 0);
        const batido = total >= p.meta;
        return `🔸 **${p.nome}** — ${total}/${p.meta} ${batido ? "✔" : "⏳"}`;
    }).join("\n") || "*Nenhum produto cadastrado*";

    return createContainer("#2B2D31",
        "**📊 Entregas Realizadas**",
        Separator.Default,
        linhas,
    );
}

export function montarContainerConfirmacaoFinalizar() {
    return createContainer("#2B2D31",
        "**🔒 Finalizar Farm**",
        Separator.Default,
        "Tem certeza que deseja finalizar o farm?",
        Separator.Default,
        "Isso irá travar as entregas e atribuir os cargos conforme o progresso.",
        Separator.Default,
        createRow(
            new ButtonBuilder()
                .setCustomId("farm/finalizar/confirmar")
                .setLabel("Sim, Finalizar")
                .setStyle(ButtonStyle.Danger),
            new ButtonBuilder()
                .setCustomId("farm/voltar-painel")
                .setLabel("Cancelar")
                .setStyle(ButtonStyle.Secondary),
        ),
    );
}

export function montarContainerConfirmacaoFechar() {
    return createContainer("#2B2D31",
        "**🔒 Fechar Canal**",
        Separator.Default,
        "Tem certeza que deseja fechar este canal?",
        Separator.Default,
        "O canal será deletado em instantes.",
        Separator.Default,
        createRow(
            new ButtonBuilder()
                .setCustomId("farm/fechar/confirmar")
                .setLabel("Sim, Fechar")
                .setStyle(ButtonStyle.Danger),
            new ButtonBuilder()
                .setCustomId("farm/voltar-painel")
                .setLabel("Cancelar")
                .setStyle(ButtonStyle.Secondary),
        ),
    );
}

export function montarContainerFarmFinalizado(produtos: FarmProduto[], entregas: FarmEntrega[], memberId: string, inicioTimestamp: number | null, ultimaTimestamp: number | null, finalizedBy: string, showButtons = true) {
    const inicioTexto = inicioTimestamp ? `<t:${Math.floor(inicioTimestamp / 1000)}:f>` : "—";
    const ultimaTexto = ultimaTimestamp ? `<t:${Math.floor(ultimaTimestamp / 1000)}:f>` : "—";

    const inventario = produtos.map(p => {
        const total = entregas
            .filter(e => e.produtoId === p.id)
            .reduce((s, e) => s + e.quantidade, 0);
        const batido = total >= p.meta;
        return `🔸 **${p.nome}** | ${total}/${p.meta} ${batido ? "✔" : "⏳"}`;
    }).join("\n") || "*Nenhum produto cadastrado*";

    const todasBatidas = produtos.length > 0 && produtos.every(p => {
        const total = entregas.filter(e => e.produtoId === p.id).reduce((s, e) => s + e.quantidade, 0);
        return total >= p.meta;
    });

    const components: any[] = [
        "🎯 **REGISTRO DE FARM** 🎯",
        Separator.Default,
        `**👤 Membro:** <@${memberId}>`,
        `**🕒 Data/Hora:**\n(Início: ${inicioTexto}) - (${ultimaTexto})`,
        Separator.Default,
        "**📦 INVENTÁRIO / METAS**",
        inventario,
        Separator.Default,
        `**📊 Status:** 🌴 Meta Encerrada`,
        `**📝 Notas:** <@${finalizedBy}> Encerrou o Farm`,
        Separator.Default,
        todasBatidas ? "✅ **Todas as metas foram concluídas!**" : "❌ **Algumas metas não foram atingidas.**",
    ];

    if (showButtons) {
        components.push(
            Separator.Default,
            createRow(
                new ButtonBuilder()
                    .setCustomId("farm/fechar")
                    .setLabel("Fechar Canal")
                    .setEmoji("🔒")
                    .setStyle(ButtonStyle.Danger),
            ),
        );
    }

    return createContainer("#2B2D31", ...components);
}
