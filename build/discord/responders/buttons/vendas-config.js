import { createResponder } from "#base";
import { ResponderType } from "@constatic/base";
import { ChannelType, ButtonBuilder, ButtonStyle, ChannelSelectMenuBuilder, ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import { createContainer, createRow, Separator } from "@magicyan/discord";
import { getVendasConfig, setVendasConfig, addProduto, updateProduto, deleteProduto } from "#database";
import { montarContainerVendasConfig } from "../../data/config.js";
export const selectedProdutoId = new Map();
const editingProdutoId = new Map();
function montarContainerVendasComSelecao(config, selectedId) {
    const produto = config.produtos.find(p => p.id === selectedId);
    return montarContainerVendasConfig(config, produto);
}
createResponder({
    customId: "config/vendas/selecionar",
    types: [ResponderType.StringSelect],
    cache: "cached",
    async run(interaction) {
        const selectedId = interaction.values[0];
        const key = `${interaction.guildId}-${interaction.user.id}`;
        selectedProdutoId.set(key, selectedId);
        const config = await getVendasConfig(interaction.guildId);
        const container = montarContainerVendasComSelecao(config, selectedId);
        await interaction.update({ components: [container] });
    }
});
createResponder({
    customId: "config/vendas/editar",
    types: [ResponderType.Button],
    cache: "cached",
    async run(interaction) {
        const key = `${interaction.guildId}-${interaction.user.id}`;
        const produtoId = selectedProdutoId.get(key);
        if (!produtoId) {
            await interaction.reply({ flags: ["Ephemeral"], content: "❌ Selecione um produto primeiro." });
            return;
        }
        const config = await getVendasConfig(interaction.guildId);
        const produto = config.produtos.find(p => p.id === produtoId);
        if (!produto) {
            await interaction.reply({ flags: ["Ephemeral"], content: "❌ Produto não encontrado." });
            return;
        }
        editingProdutoId.set(key, produtoId);
        const modal = new ModalBuilder()
            .setCustomId("config/vendas/editar-modal")
            .setTitle(`Editar: ${produto.nome}`)
            .addComponents(new ActionRowBuilder({ components: [
                new TextInputBuilder()
                    .setCustomId("produto_nome")
                    .setLabel("Nome do Produto")
                    .setValue(produto.nome)
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true),
            ] }), new ActionRowBuilder({ components: [
                new TextInputBuilder()
                    .setCustomId("produto_valor_pista")
                    .setLabel("Valor Pista (R$)")
                    .setValue(String(produto.valorPista))
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true),
            ] }), new ActionRowBuilder({ components: [
                new TextInputBuilder()
                    .setCustomId("produto_valor_parceria")
                    .setLabel("Valor Parceria (R$)")
                    .setValue(String(produto.valorParceria))
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true),
            ] }), new ActionRowBuilder({ components: [
                new TextInputBuilder()
                    .setCustomId("produto_porcentagem")
                    .setLabel("Porcentagem para o painel (%)")
                    .setValue(String(produto.porcentagemPainel))
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true)
                    .setMaxLength(3),
            ] }));
        await interaction.showModal(modal);
    }
});
createResponder({
    customId: "config/vendas/editar-modal",
    types: [ResponderType.ModalComponent],
    cache: "cached",
    async run(interaction) {
        const key = `${interaction.guildId}-${interaction.user.id}`;
        const produtoId = editingProdutoId.get(key);
        if (!produtoId) {
            await interaction.reply({ flags: ["Ephemeral"], content: "❌ Sessão expirada. Tente novamente." });
            return;
        }
        const nome = interaction.fields.getTextInputValue("produto_nome").trim();
        const valorPistaStr = interaction.fields.getTextInputValue("produto_valor_pista").trim();
        const valorPista = parseInt(valorPistaStr.replace(/\./g, ""));
        const valorParceriaStr = interaction.fields.getTextInputValue("produto_valor_parceria").trim();
        const valorParceria = parseInt(valorParceriaStr.replace(/\./g, ""));
        const porcentagemStr = interaction.fields.getTextInputValue("produto_porcentagem").trim();
        const porcentagem = parseInt(porcentagemStr);
        if (!nome) {
            await interaction.reply({ flags: ["Ephemeral"], content: "❌ Nome do produto é obrigatório." });
            return;
        }
        if (isNaN(valorPista) || valorPista <= 0) {
            await interaction.reply({ flags: ["Ephemeral"], content: "❌ Valor de Pista inválido. Digite um número maior que 0." });
            return;
        }
        if (isNaN(valorParceria) || valorParceria <= 0) {
            await interaction.reply({ flags: ["Ephemeral"], content: "❌ Valor de Parceria inválido. Digite um número maior que 0." });
            return;
        }
        if (isNaN(porcentagem) || porcentagem < 0 || porcentagem > 100) {
            await interaction.reply({ flags: ["Ephemeral"], content: "❌ Porcentagem inválida. Digite um número entre 0 e 100." });
            return;
        }
        await updateProduto(interaction.guildId, produtoId, { nome, valorPista, valorParceria, porcentagemPainel: porcentagem });
        editingProdutoId.delete(key);
        const config = await getVendasConfig(interaction.guildId);
        const container = montarContainerVendasConfig(config);
        await interaction.update({ components: [container] });
    }
});
createResponder({
    customId: "config/vendas/canal",
    types: [ResponderType.Button],
    cache: "cached",
    async run(interaction) {
        const container = createContainer("#FFFFFF", "**📢 Selecione o canal de logs de vendas**", Separator.Default, createRow(new ChannelSelectMenuBuilder({
            customId: "config/vendas/canal-select",
            placeholder: "Selecione o canal de logs...",
            channelTypes: [ChannelType.GuildText],
            maxValues: 1,
        })), Separator.Default, createRow(new ButtonBuilder()
            .setCustomId("config/menu/voltar")
            .setLabel("Voltar")
            .setEmoji({ id: "1504675345687773244", name: "chevron_left" })
            .setStyle(ButtonStyle.Secondary)));
        await interaction.update({ components: [container] });
    }
});
createResponder({
    customId: "config/vendas/canal-select",
    types: [ResponderType.ChannelSelect],
    cache: "cached",
    async run(interaction) {
        const channelId = interaction.values[0];
        const config = await getVendasConfig(interaction.guildId);
        config.logChannelId = channelId;
        await setVendasConfig(interaction.guildId, config);
        const container = montarContainerVendasConfig(config);
        await interaction.update({ components: [container] });
    }
});
createResponder({
    customId: "config/vendas/adicionar",
    types: [ResponderType.Button],
    cache: "cached",
    async run(interaction) {
        const modal = new ModalBuilder()
            .setCustomId("config/vendas/adicionar-modal")
            .setTitle("Adicionar Produto")
            .addComponents(new ActionRowBuilder({ components: [
                new TextInputBuilder()
                    .setCustomId("produto_nome")
                    .setLabel("Nome do Produto")
                    .setPlaceholder("Ex: Arma, Droga, Veículo...")
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true),
            ] }), new ActionRowBuilder({ components: [
                new TextInputBuilder()
                    .setCustomId("produto_valor_pista")
                    .setLabel("Valor Pista (R$)")
                    .setPlaceholder("Ex: 50000")
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true),
            ] }), new ActionRowBuilder({ components: [
                new TextInputBuilder()
                    .setCustomId("produto_valor_parceria")
                    .setLabel("Valor Parceria (R$)")
                    .setPlaceholder("Ex: 75000")
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true),
            ] }), new ActionRowBuilder({ components: [
                new TextInputBuilder()
                    .setCustomId("produto_porcentagem")
                    .setLabel("Porcentagem para o painel (%)")
                    .setPlaceholder("Ex: 30")
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true)
                    .setMaxLength(3),
            ] }));
        await interaction.showModal(modal);
    }
});
createResponder({
    customId: "config/vendas/adicionar-modal",
    types: [ResponderType.ModalComponent],
    cache: "cached",
    async run(interaction) {
        const nome = interaction.fields.getTextInputValue("produto_nome").trim();
        const valorPistaStr = interaction.fields.getTextInputValue("produto_valor_pista").trim();
        const valorPista = parseInt(valorPistaStr.replace(/\./g, ""));
        const valorParceriaStr = interaction.fields.getTextInputValue("produto_valor_parceria").trim();
        const valorParceria = parseInt(valorParceriaStr.replace(/\./g, ""));
        const porcentagemStr = interaction.fields.getTextInputValue("produto_porcentagem").trim();
        const porcentagem = parseInt(porcentagemStr);
        if (!nome) {
            await interaction.reply({ flags: ["Ephemeral"], content: "❌ Nome do produto é obrigatório." });
            return;
        }
        if (isNaN(valorPista) || valorPista <= 0) {
            await interaction.reply({ flags: ["Ephemeral"], content: "❌ Valor de Pista inválido. Digite um número maior que 0." });
            return;
        }
        if (isNaN(valorParceria) || valorParceria <= 0) {
            await interaction.reply({ flags: ["Ephemeral"], content: "❌ Valor de Parceria inválido. Digite um número maior que 0." });
            return;
        }
        if (isNaN(porcentagem) || porcentagem < 0 || porcentagem > 100) {
            await interaction.reply({ flags: ["Ephemeral"], content: "❌ Porcentagem inválida. Digite um número entre 0 e 100." });
            return;
        }
        await addProduto(interaction.guildId, nome, valorPista, valorParceria, porcentagem);
        const config = await getVendasConfig(interaction.guildId);
        const container = montarContainerVendasConfig(config);
        await interaction.update({ components: [container] });
    }
});
createResponder({
    customId: "config/vendas/excluir",
    types: [ResponderType.Button],
    cache: "cached",
    async run(interaction) {
        const key = `${interaction.guildId}-${interaction.user.id}`;
        const produtoId = selectedProdutoId.get(key);
        if (!produtoId) {
            await interaction.reply({ flags: ["Ephemeral"], content: "❌ Selecione um produto primeiro." });
            return;
        }
        await deleteProduto(interaction.guildId, produtoId);
        selectedProdutoId.delete(key);
        const config = await getVendasConfig(interaction.guildId);
        const container = montarContainerVendasConfig(config);
        await interaction.update({ components: [container] });
    }
});
