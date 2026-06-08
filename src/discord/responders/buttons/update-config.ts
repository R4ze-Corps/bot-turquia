import { createResponder } from "#base";
import { ResponderType } from "@constatic/base";
import { ChannelType, ButtonBuilder, ButtonStyle, RoleSelectMenuBuilder, ChannelSelectMenuBuilder } from "discord.js";
import { createContainer, createRow, Separator } from "@magicyan/discord";
import { getUpdateConfig, setUpdateConfig, resetUpdateConfig } from "#database";
import { montarContainerUpdateConfig } from "../../data/config.js";

createResponder({
    customId: "config/update/gerais",
    types: [ResponderType.Button],
    cache: "cached",
    async run(interaction) {
        const container = createContainer("#FFFFFF",
            "**👤 Selecione o cargo de Gerência Geral**",
            Separator.Default,
            createRow(new RoleSelectMenuBuilder({
                customId: "config/update/gerais-select",
                placeholder: "Selecione o cargo de Gerência Geral...",
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
    customId: "config/update/gerais-select",
    types: [ResponderType.RoleSelect],
    cache: "cached",
    async run(interaction) {
        const config = await getUpdateConfig(interaction.guildId!);
        config.geraisRoleId = interaction.values[0];
        await setUpdateConfig(interaction.guildId!, config);
        const container = montarContainerUpdateConfig(config);
        await interaction.update({ components: [container] });
    }
});

createResponder({
    customId: "config/update/filter",
    types: [ResponderType.Button],
    cache: "cached",
    async run(interaction) {
        const container = createContainer("#FFFFFF",
            "**🔒 Selecione o cargo de filtro**",
            Separator.Default,
            createRow(new RoleSelectMenuBuilder({
                customId: "config/update/filter-select",
                placeholder: "Selecione o cargo de filtro...",
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
    customId: "config/update/filter-select",
    types: [ResponderType.RoleSelect],
    cache: "cached",
    async run(interaction) {
        const config = await getUpdateConfig(interaction.guildId!);
        config.filterRoleId = interaction.values[0];
        await setUpdateConfig(interaction.guildId!, config);
        const container = montarContainerUpdateConfig(config);
        await interaction.update({ components: [container] });
    }
});

createResponder({
    customId: "config/update/canal",
    types: [ResponderType.Button],
    cache: "cached",
    async run(interaction) {
        const container = createContainer("#FFFFFF",
            "**📢 Selecione o canal de logs**",
            Separator.Default,
            createRow(new ChannelSelectMenuBuilder({
                customId: "config/update/canal-select",
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
    customId: "config/update/canal-select",
    types: [ResponderType.ChannelSelect],
    cache: "cached",
    async run(interaction) {
        const config = await getUpdateConfig(interaction.guildId!);
        config.canalDestinoId = interaction.values[0];
        await setUpdateConfig(interaction.guildId!, config);
        const container = montarContainerUpdateConfig(config);
        await interaction.update({ components: [container] });
    }
});

createResponder({
    customId: "config/update/promocao",
    types: [ResponderType.Button],
    cache: "cached",
    async run(interaction) {
        const container = createContainer("#FFFFFF",
            "**📈 Selecione os cargos de Promoção**",
            Separator.Default,
            "Selecione os cargos que serão usados como opções de promoção no /upar.",
            Separator.Default,
            createRow(new RoleSelectMenuBuilder({
                customId: "config/update/promocao-select",
                placeholder: "Selecione os cargos de promoção...",
                maxValues: 25,
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
    customId: "config/update/promocao-select",
    types: [ResponderType.RoleSelect],
    cache: "cached",
    async run(interaction) {
        const config = await getUpdateConfig(interaction.guildId!);
        config.cargosPromocao = interaction.values.map(id => {
            const role = interaction.guild!.roles.cache.get(id);
            return { id, nome: role?.name ?? id };
        });
        await setUpdateConfig(interaction.guildId!, config);
        const container = montarContainerUpdateConfig(config);
        await interaction.update({ components: [container] });
    }
});

createResponder({
    customId: "config/update/rebaixamento",
    types: [ResponderType.Button],
    cache: "cached",
    async run(interaction) {
        const container = createContainer("#FFFFFF",
            "**📉 Selecione os cargos de Rebaixamento**",
            Separator.Default,
            "Selecione os cargos que serão usados como opções de rebaixamento no /upar.",
            Separator.Default,
            createRow(new RoleSelectMenuBuilder({
                customId: "config/update/rebaixamento-select",
                placeholder: "Selecione os cargos de rebaixamento...",
                maxValues: 25,
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
    customId: "config/update/rebaixamento-select",
    types: [ResponderType.RoleSelect],
    cache: "cached",
    async run(interaction) {
        const config = await getUpdateConfig(interaction.guildId!);
        config.cargosRebaixamento = interaction.values.map(id => {
            const role = interaction.guild!.roles.cache.get(id);
            return { id, nome: role?.name ?? id };
        });
        await setUpdateConfig(interaction.guildId!, config);
        const container = montarContainerUpdateConfig(config);
        await interaction.update({ components: [container] });
    }
});

createResponder({
    customId: "config/update/gerencia",
    types: [ResponderType.Button],
    cache: "cached",
    async run(interaction) {
        const container = createContainer("#FFFFFF",
            "**👥 Selecione os cargos de Gerência**",
            Separator.Default,
            "Selecione os cargos que receberão o cargo geral automaticamente ao serem promovidos.",
            Separator.Default,
            createRow(new RoleSelectMenuBuilder({
                customId: "config/update/gerencia-select",
                placeholder: "Selecione os cargos de gerência...",
                maxValues: 25,
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
    customId: "config/update/gerencia-select",
    types: [ResponderType.RoleSelect],
    cache: "cached",
    async run(interaction) {
        const config = await getUpdateConfig(interaction.guildId!);
        config.gerenciaRoleIds = interaction.values;
        await setUpdateConfig(interaction.guildId!, config);
        const container = montarContainerUpdateConfig(config);
        await interaction.update({ components: [container] });
    }
});

createResponder({
    customId: "config/update/resetar",
    types: [ResponderType.Button],
    cache: "cached",
    async run(interaction) {
        const config = await resetUpdateConfig(interaction.guildId!);
        const container = montarContainerUpdateConfig(config);
        await interaction.update({ components: [container] });
    }
});