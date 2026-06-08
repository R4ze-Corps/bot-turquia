import { createResponder } from "#base";
import { ResponderType } from "@constatic/base";
import { getVendasConfig } from "#database";
import { montarContainerSelecaoProdutos, montarContainerResultadoVenda } from "../../data/vendas.js";
import { selectedProdutosVenda } from "../selects/vendas.js";
export const tipoVenda = new Map();
createResponder({
    customId: "vendas/tipo/parceria",
    types: [ResponderType.Button],
    cache: "cached",
    async run(interaction) {
        const config = await getVendasConfig(interaction.guildId);
        if (config.produtos.length === 0) {
            await interaction.reply({ flags: ["Ephemeral"], content: "❌ Nenhum produto cadastrado. Peça a um administrador para configurar produtos em `/config`." });
            return;
        }
        const key = `${interaction.guildId}-${interaction.user.id}`;
        tipoVenda.set(key, "Parceria");
        const container = montarContainerSelecaoProdutos(config.produtos, "Parceria");
        await interaction.reply({
            components: [container],
            flags: ["Ephemeral", "IsComponentsV2"],
        });
    }
});
createResponder({
    customId: "vendas/tipo/pista",
    types: [ResponderType.Button],
    cache: "cached",
    async run(interaction) {
        const config = await getVendasConfig(interaction.guildId);
        if (config.produtos.length === 0) {
            await interaction.reply({ flags: ["Ephemeral"], content: "❌ Nenhum produto cadastrado. Peça a um administrador para configurar produtos em `/config`." });
            return;
        }
        const key = `${interaction.guildId}-${interaction.user.id}`;
        tipoVenda.set(key, "Pista");
        const container = montarContainerSelecaoProdutos(config.produtos, "Pista");
        await interaction.reply({
            components: [container],
            flags: ["Ephemeral", "IsComponentsV2"],
        });
    }
});
createResponder({
    customId: "vendas/cancelar",
    types: [ResponderType.Button],
    cache: "cached",
    async run(interaction) {
        const key = `${interaction.guildId}-${interaction.user.id}`;
        tipoVenda.delete(key);
        selectedProdutosVenda.delete(key);
        await interaction.reply({
            flags: ["Ephemeral"],
            content: "✅ Operação cancelada.",
        });
    }
});
createResponder({
    customId: "vendas/valor-modal",
    types: [ResponderType.ModalComponent],
    cache: "cached",
    async run(interaction) {
        try {
            const key = `${interaction.guildId}-${interaction.user.id}`;
            const tipo = tipoVenda.get(key);
            const produtoIds = selectedProdutosVenda.get(key);
            if (!tipo || !produtoIds || produtoIds.length === 0) {
                await interaction.reply({ flags: ["Ephemeral"], content: "❌ Sessão expirada. Use /vendas novamente." });
                return;
            }
            const config = await getVendasConfig(interaction.guildId);
            const items = [];
            for (const produtoId of produtoIds) {
                const produto = config.produtos.find(p => p.id === produtoId);
                if (!produto)
                    continue;
                const qtdStr = interaction.fields.getTextInputValue(produtoId).trim();
                const quantidade = parseInt(qtdStr.replace(/\./g, ""));
                if (isNaN(quantidade) || quantidade <= 0)
                    continue;
                const valorBase = tipo === "Parceria" ? produto.valorParceria : produto.valorPista;
                items.push({ produto, quantidade, valorBase, valorTotal: quantidade * valorBase });
            }
            if (items.length === 0) {
                await interaction.reply({ flags: ["Ephemeral"], content: "❌ Nenhuma quantidade válida informada." });
                return;
            }
            const resultContainer = montarContainerResultadoVenda(items, tipo, interaction.user.id);
            if (config.logChannelId) {
                const logChannel = interaction.guild.channels.cache.get(config.logChannelId);
                if (logChannel?.isTextBased()) {
                    await logChannel.send({
                        components: [resultContainer],
                        flags: ["IsComponentsV2"],
                    });
                }
            }
            await interaction.reply({
                components: [resultContainer],
                flags: ["Ephemeral", "IsComponentsV2"],
            });
            tipoVenda.delete(key);
            selectedProdutosVenda.delete(key);
        }
        catch (error) {
            console.error("[Vendas-Modal]", error);
            if (!interaction.replied) {
                await interaction.reply({ flags: ["Ephemeral"], content: "❌ Erro ao registrar venda." }).catch(() => { });
            }
        }
    }
});
