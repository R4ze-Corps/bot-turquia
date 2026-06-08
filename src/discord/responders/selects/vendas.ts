import { createResponder } from "#base";
import { ResponderType } from "@constatic/base";
import { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import { getVendasConfig } from "#database";
import { tipoVenda } from "../buttons/vendas.js";

export const selectedProdutosVenda = new Map<string, string[]>();

createResponder({
    customId: "vendas/selecionar-produtos",
    types: [ResponderType.StringSelect],
    cache: "cached",
    async run(interaction) {
        const key = `${interaction.guildId}-${interaction.user.id}`;
        const tipo = tipoVenda.get(key);
        if (!tipo) {
            await interaction.reply({ flags: ["Ephemeral"], content: "❌ Sessão expirada. Use /vendas novamente." });
            return;
        }

        const produtoIds = interaction.values;
        selectedProdutosVenda.set(key, produtoIds);

        const config = await getVendasConfig(interaction.guildId!);
        const produtos = produtoIds.map(id => config.produtos.find(p => p.id === id)).filter(Boolean) as { id: string; nome: string }[];

        const modal = new ModalBuilder()
            .setCustomId("vendas/valor-modal")
            .setTitle(`Quantidades — ${tipo}`);

        for (const p of produtos.slice(0, 5)) {
            modal.addComponents(
                new ActionRowBuilder<TextInputBuilder>({
                    components: [
                        new TextInputBuilder()
                            .setCustomId(p.id)
                            .setLabel(p.nome.length > 45 ? p.nome.slice(0, 42) + "..." : p.nome)
                            .setPlaceholder("Ex: 5")
                            .setStyle(TextInputStyle.Short)
                            .setRequired(true),
                    ],
                })
            );
        }

        await interaction.showModal(modal);
    }
});
