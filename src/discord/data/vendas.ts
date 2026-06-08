import { StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { createContainer, createRow, Separator } from "@magicyan/discord";
import type { Produto } from "#database";

export function montarContainerSelecaoProdutos(produtos: Produto[], tipo: "Parceria" | "Pista") {
    const select = new StringSelectMenuBuilder()
        .setCustomId("vendas/selecionar-produtos")
        .setPlaceholder("Selecione os produtos...")
        .setMinValues(1)
        .setMaxValues(Math.min(produtos.length, 5))
        .addOptions(
            produtos.map(p => ({
                label: p.nome,
                description: `🤝 R$ ${p.valorParceria.toLocaleString("pt-BR")} | 🏪 R$ ${p.valorPista.toLocaleString("pt-BR")} | ${p.porcentagemPainel}%`,
                value: p.id,
            }))
        );

    return createContainer("#FFFFFF",
        `**💵 Registro de Venda — ${tipo}**`,
        Separator.Default,
        "Selecione os produtos vendidos (máx. 5):",
        Separator.Default,
        createRow(select),
        Separator.Default,
        createRow(
            new ButtonBuilder()
                .setCustomId("vendas/cancelar")
                .setLabel("Voltar")
                .setEmoji("🔙")
                .setStyle(ButtonStyle.Secondary),
        ),
    );
}

export function montarContainerResultadoVenda(
    items: { produto: Produto; quantidade: number; valorBase: number; valorTotal: number }[],
    tipo: "Parceria" | "Pista",
    autorId: string
) {
    const color = tipo === "Parceria" ? "#3b82f6" : "#22c55e";
    const valorGeral = items.reduce((acc, i) => acc + i.valorTotal, 0);
    const painelGeral = items.reduce((acc, i) => acc + (i.valorTotal * i.produto.porcentagemPainel) / 100, 0);

    const lines = items.map(i =>
        `**📦 ${i.produto.nome}** — ${i.quantidade}x R$ ${i.valorBase.toLocaleString("pt-BR")} = R$ ${i.valorTotal.toLocaleString("pt-BR")}`
    );

    return createContainer(color,
        `**💵 Venda Registrada — ${tipo}**`,
        Separator.Default,
        ...lines.flatMap(l => [l]),
        Separator.Default,
        `**💰 Total Geral:** R$ ${valorGeral.toLocaleString("pt-BR")}`,
        `**📊 Painel Total:** R$ ${painelGeral.toLocaleString("pt-BR")}`,
        `**👤 Vendido por:** <@${autorId}>`,
        Separator.Default,
        `🕐 <t:${Math.floor(Date.now() / 1000)}:F>`,
    );
}
