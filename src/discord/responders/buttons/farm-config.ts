import { createResponder } from "#base";
import { ResponderType } from "@constatic/base";
import { ChannelType, ButtonBuilder, ButtonStyle, ChannelSelectMenuBuilder, RoleSelectMenuBuilder, ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import { createContainer, createRow, Separator } from "@magicyan/discord";
import { getFarmConfig, setFarmConfig, setFarmCargos, addFarmProduto, updateFarmProduto, deleteFarmProduto } from "#database";
import { montarContainerFarmConfig } from "../../data/config.js";
import type { FarmProduto } from "#database";

export const selectedProdutoId = new Map<string, string>();
const editingProdutoId = new Map<string, string>();

function montarContainerFarmComSelecao(config: { produtos: FarmProduto[]; logChannelId: string | null; categoriaId: string | null; cargos: any }, selectedId: string) {
    const produto = config.produtos.find(p => p.id === selectedId)!;
    return montarContainerFarmConfig(config as any, produto);
}

createResponder({
    customId: "config/farm/selecionar",
    types: [ResponderType.StringSelect],
    cache: "cached",
    async run(interaction) {
        const selectedId = interaction.values[0];
        const key = `${interaction.guildId}-${interaction.user.id}`;
        selectedProdutoId.set(key, selectedId);

        const config = await getFarmConfig(interaction.guildId!);
        const container = montarContainerFarmComSelecao(config, selectedId);
        await interaction.update({ components: [container] });
    }
});

createResponder({
    customId: "config/farm/editar",
    types: [ResponderType.Button],
    cache: "cached",
    async run(interaction) {
        const key = `${interaction.guildId}-${interaction.user.id}`;
        const produtoId = selectedProdutoId.get(key);

        if (!produtoId) {
            await interaction.reply({ flags: ["Ephemeral"], content: "❌ Selecione um produto primeiro." });
            return;
        }

        const config = await getFarmConfig(interaction.guildId!);
        const produto = config.produtos.find(p => p.id === produtoId);
        if (!produto) {
            await interaction.reply({ flags: ["Ephemeral"], content: "❌ Produto não encontrado." });
            return;
        }

        editingProdutoId.set(key, produtoId);

        const modal = new ModalBuilder()
            .setCustomId("config/farm/editar-modal")
            .setTitle(`Editar: ${produto.nome}`)
            .addComponents(
                new ActionRowBuilder({ components: [
                    new TextInputBuilder()
                        .setCustomId("produto_nome")
                        .setLabel("Produto")
                        .setValue(produto.nome)
                        .setStyle(TextInputStyle.Short)
                        .setRequired(true),
                ] }),
                new ActionRowBuilder({ components: [
                    new TextInputBuilder()
                        .setCustomId("produto_meta")
                        .setLabel("Meta")
                        .setValue(String(produto.meta))
                        .setStyle(TextInputStyle.Short)
                        .setRequired(true),
                ] }),
            );

        await interaction.showModal(modal);
    }
});

createResponder({
    customId: "config/farm/editar-modal",
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
        const metaStr = interaction.fields.getTextInputValue("produto_meta").trim();
        const meta = parseInt(metaStr);

        if (!nome) {
            await interaction.reply({ flags: ["Ephemeral"], content: "❌ Nome do produto é obrigatório." });
            return;
        }

        if (isNaN(meta) || meta <= 0) {
            await interaction.reply({ flags: ["Ephemeral"], content: "❌ Meta inválida. Digite um número maior que 0." });
            return;
        }

        await updateFarmProduto(interaction.guildId!, produtoId, { nome, meta });
        editingProdutoId.delete(key);

        const config = await getFarmConfig(interaction.guildId!);
        const container = montarContainerFarmConfig(config);
        await interaction.update({ components: [container] });
    }
});

// Canal de Logs
createResponder({
    customId: "config/farm/canal",
    types: [ResponderType.Button],
    cache: "cached",
    async run(interaction) {
        const container = createContainer("#FFFFFF",
            "**📢 Selecione o canal de logs de farm**",
            Separator.Default,
            createRow(new ChannelSelectMenuBuilder({
                customId: "config/farm/canal-select",
                placeholder: "Selecione o canal de logs...",
                channelTypes: [ChannelType.GuildText],
                maxValues: 1,
            })),
            Separator.Default,
            createRow(
                new ButtonBuilder()
                    .setCustomId("config/menu/voltar")
                    .setLabel("Voltar")
                    .setEmoji({ id: "1504675345687773244", name: "chevron_left" })
                    .setStyle(ButtonStyle.Secondary),
            ),
        );

        await interaction.update({ components: [container] });
    }
});

createResponder({
    customId: "config/farm/canal-select",
    types: [ResponderType.ChannelSelect],
    cache: "cached",
    async run(interaction) {
        const channelId = interaction.values[0];
        const config = await getFarmConfig(interaction.guildId!);
        config.logChannelId = channelId;
        await setFarmConfig(interaction.guildId!, config);
        const container = montarContainerFarmConfig(config);
        await interaction.update({ components: [container] });
    }
});

// Categoria
createResponder({
    customId: "config/farm/categoria",
    types: [ResponderType.Button],
    cache: "cached",
    async run(interaction) {
        const container = createContainer("#FFFFFF",
            "**📁 Selecione a categoria para as salas de farm**",
            Separator.Default,
            createRow(new ChannelSelectMenuBuilder({
                customId: "config/farm/categoria-select",
                placeholder: "Selecione a categoria...",
                channelTypes: [ChannelType.GuildCategory],
                maxValues: 1,
            })),
            Separator.Default,
            createRow(
                new ButtonBuilder()
                    .setCustomId("config/menu/voltar")
                    .setLabel("Voltar")
                    .setEmoji({ id: "1504675345687773244", name: "chevron_left" })
                    .setStyle(ButtonStyle.Secondary),
            ),
        );

        await interaction.update({ components: [container] });
    }
});

createResponder({
    customId: "config/farm/categoria-select",
    types: [ResponderType.ChannelSelect],
    cache: "cached",
    async run(interaction) {
        const channelId = interaction.values[0];
        const config = await getFarmConfig(interaction.guildId!);
        config.categoriaId = channelId;
        await setFarmConfig(interaction.guildId!, config);
        const container = montarContainerFarmConfig(config);
        await interaction.update({ components: [container] });
    }
});

// Cargos
createResponder({
    customId: "config/farm/cargos",
    types: [ResponderType.Button],
    cache: "cached",
    async run(interaction) {
        const config = await getFarmConfig(interaction.guildId!);
        const cargos = config.cargos || { cargoMetaConcluida: null, cargoMetaIncompleta: null, cargoNenhumaEntrega: null };

        const container = createContainer("#FFFFFF",
            "**🎭 Configurar Cargos de Farm**",
            Separator.Default,
            "**✅ Meta Concluída**",
            createRow(new RoleSelectMenuBuilder({
                customId: "config/farm/cargo/meta-concluida",
                placeholder: cargos.cargoMetaConcluida ? "<cargo selecionado>" : "Selecione o cargo...",
                maxValues: 1,
            })),
            Separator.Default,
            "**❌ Meta Incompleta**",
            createRow(new RoleSelectMenuBuilder({
                customId: "config/farm/cargo/meta-incompleta",
                placeholder: cargos.cargoMetaIncompleta ? "<cargo selecionado>" : "Selecione o cargo...",
                maxValues: 1,
            })),
            Separator.Default,
            "**🚫 Nenhuma Entrega**",
            createRow(new RoleSelectMenuBuilder({
                customId: "config/farm/cargo/nenhuma-entrega",
                placeholder: cargos.cargoNenhumaEntrega ? "<cargo selecionado>" : "Selecione o cargo...",
                maxValues: 1,
            })),
            Separator.Default,
            createRow(
                new ButtonBuilder()
                    .setCustomId("config/menu/voltar")
                    .setLabel("Voltar")
                    .setEmoji({ id: "1504675345687773244", name: "chevron_left" })
                    .setStyle(ButtonStyle.Secondary),
            ),
        );

        await interaction.update({ components: [container] });
    }
});

createResponder({
    customId: "config/farm/cargo/meta-concluida",
    types: [ResponderType.RoleSelect],
    cache: "cached",
    async run(interaction) {
        const config = await getFarmConfig(interaction.guildId!);
        const cargos = config.cargos || { cargoMetaConcluida: null, cargoMetaIncompleta: null, cargoNenhumaEntrega: null };
        cargos.cargoMetaConcluida = interaction.values[0];
        await setFarmCargos(interaction.guildId!, cargos);
        const container = montarContainerFarmConfig(await getFarmConfig(interaction.guildId!));
        await interaction.update({ components: [container] });
    }
});

createResponder({
    customId: "config/farm/cargo/meta-incompleta",
    types: [ResponderType.RoleSelect],
    cache: "cached",
    async run(interaction) {
        const config = await getFarmConfig(interaction.guildId!);
        const cargos = config.cargos || { cargoMetaConcluida: null, cargoMetaIncompleta: null, cargoNenhumaEntrega: null };
        cargos.cargoMetaIncompleta = interaction.values[0];
        await setFarmCargos(interaction.guildId!, cargos);
        const container = montarContainerFarmConfig(await getFarmConfig(interaction.guildId!));
        await interaction.update({ components: [container] });
    }
});

createResponder({
    customId: "config/farm/cargo/nenhuma-entrega",
    types: [ResponderType.RoleSelect],
    cache: "cached",
    async run(interaction) {
        const config = await getFarmConfig(interaction.guildId!);
        const cargos = config.cargos || { cargoMetaConcluida: null, cargoMetaIncompleta: null, cargoNenhumaEntrega: null };
        cargos.cargoNenhumaEntrega = interaction.values[0];
        await setFarmCargos(interaction.guildId!, cargos);
        const container = montarContainerFarmConfig(await getFarmConfig(interaction.guildId!));
        await interaction.update({ components: [container] });
    }
});

// Imagem
createResponder({
    customId: "config/farm/imagem",
    types: [ResponderType.Button],
    cache: "cached",
    async run(interaction) {
        const config = await getFarmConfig(interaction.guildId!);

        const modal = new ModalBuilder()
            .setCustomId("config/farm/imagem-modal")
            .setTitle("Imagem do Container")
            .addComponents(
                new ActionRowBuilder({ components: [
                    new TextInputBuilder()
                        .setCustomId("imagem_url")
                        .setLabel("URL da Imagem")
                        .setPlaceholder("https://exemplo.com/imagem.png")
                        .setValue(config.imagemUrl ?? "")
                        .setStyle(TextInputStyle.Short)
                        .setRequired(false),
                ] }),
            );

        await interaction.showModal(modal);
    }
});

createResponder({
    customId: "config/farm/imagem-modal",
    types: [ResponderType.ModalComponent],
    cache: "cached",
    async run(interaction) {
        const url = interaction.fields.getTextInputValue("imagem_url").trim() || null;

        const config = await getFarmConfig(interaction.guildId!);
        config.imagemUrl = url;
        await setFarmConfig(interaction.guildId!, config);

        const container = montarContainerFarmConfig(config);
        await interaction.update({ components: [container] });
    }
});

// Cadastrar Produto
createResponder({
    customId: "config/farm/cadastrar",
    types: [ResponderType.Button],
    cache: "cached",
    async run(interaction) {
        const modal = new ModalBuilder()
            .setCustomId("config/farm/cadastrar-modal")
            .setTitle("Cadastrar Produto")
            .addComponents(
                new ActionRowBuilder({ components: [
                    new TextInputBuilder()
                        .setCustomId("produto_nome")
                        .setLabel("Produto")
                        .setPlaceholder("Ex: Erva, Cocaína, Metanfetamina...")
                        .setStyle(TextInputStyle.Short)
                        .setRequired(true),
                ] }),
                new ActionRowBuilder({ components: [
                    new TextInputBuilder()
                        .setCustomId("produto_meta")
                        .setLabel("Meta")
                        .setPlaceholder("Ex: 50")
                        .setStyle(TextInputStyle.Short)
                        .setRequired(true),
                ] }),
            );

        await interaction.showModal(modal);
    }
});

createResponder({
    customId: "config/farm/cadastrar-modal",
    types: [ResponderType.ModalComponent],
    cache: "cached",
    async run(interaction) {
        const nome = interaction.fields.getTextInputValue("produto_nome").trim();
        const metaStr = interaction.fields.getTextInputValue("produto_meta").trim();
        const meta = parseInt(metaStr);

        if (!nome) {
            await interaction.reply({ flags: ["Ephemeral"], content: "❌ Nome do produto é obrigatório." });
            return;
        }

        if (isNaN(meta) || meta <= 0) {
            await interaction.reply({ flags: ["Ephemeral"], content: "❌ Meta inválida. Digite um número maior que 0." });
            return;
        }

        await addFarmProduto(interaction.guildId!, nome, meta);

        const config = await getFarmConfig(interaction.guildId!);
        const container = montarContainerFarmConfig(config);
        await interaction.update({ components: [container] });
    }
});

// Excluir Produto
createResponder({
    customId: "config/farm/excluir",
    types: [ResponderType.Button],
    cache: "cached",
    async run(interaction) {
        const key = `${interaction.guildId}-${interaction.user.id}`;
        const produtoId = selectedProdutoId.get(key);

        if (!produtoId) {
            await interaction.reply({ flags: ["Ephemeral"], content: "❌ Selecione um produto primeiro." });
            return;
        }

        await deleteFarmProduto(interaction.guildId!, produtoId);
        selectedProdutoId.delete(key);

        const config = await getFarmConfig(interaction.guildId!);
        const container = montarContainerFarmConfig(config);
        await interaction.update({ components: [container] });
    }
});
