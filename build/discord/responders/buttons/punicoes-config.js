import { createResponder } from "#base";
import { ResponderType } from "@constatic/base";
import { ChannelType, ButtonBuilder, ButtonStyle, ChannelSelectMenuBuilder, RoleSelectMenuBuilder, ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import { createContainer, createRow, Separator } from "@magicyan/discord";
import { getPunishmentConfig, setPunishmentConfig } from "#database";
import { montarContainerPunicoesConfig } from "../../data/config.js";
createResponder({
    customId: "config/punicoes/canais",
    types: [ResponderType.Button],
    cache: "cached",
    async run(interaction) {
        const config = await getPunishmentConfig(interaction.guildId);
        const container = createContainer("#FFFFFF", "**📋 Configurar Canais**", Separator.Default, `📝 Log: ${config.logChannelId ? `<#${config.logChannelId}>` : "*Não configurado*"}`, Separator.Default, "**Selecione o canal para configurar:**", createRow(new ButtonBuilder()
            .setCustomId("config/punicoes/canais/log")
            .setLabel("Log de Punição")
            .setStyle(ButtonStyle.Secondary), new ButtonBuilder()
            .setCustomId("config/menu/voltar")
            .setLabel("Voltar")
            .setEmoji({ id: "1504675345687773244", name: "chevron_left" })
            .setStyle(ButtonStyle.Secondary)));
        await interaction.update({ components: [container] });
    }
});
createResponder({
    customId: "config/punicoes/canais/log",
    types: [ResponderType.Button],
    cache: "cached",
    async run(interaction) {
        const container = createContainer("#FFFFFF", "**📝 Selecione o canal de log**", Separator.Default, createRow(new ChannelSelectMenuBuilder({
            customId: "config/punicoes/canais/log-select",
            placeholder: "Selecione o canal de log...",
            channelTypes: [ChannelType.GuildText],
            maxValues: 1,
        })), Separator.Default, createRow(new ButtonBuilder()
            .setCustomId("config/punicoes/canais")
            .setLabel("Voltar")
            .setEmoji({ id: "1504675345687773244", name: "chevron_left" })
            .setStyle(ButtonStyle.Secondary)));
        await interaction.update({ components: [container] });
    }
});
// Channel select responder
createResponder({
    customId: "config/punicoes/canais/log-select",
    types: [ResponderType.ChannelSelect],
    cache: "cached",
    async run(interaction) {
        const channelId = interaction.values[0];
        const config = await getPunishmentConfig(interaction.guildId);
        config.logChannelId = channelId;
        await setPunishmentConfig(interaction.guildId, config);
        const container = montarContainerPunicoesConfig(config);
        await interaction.update({ components: [container] });
    }
});
// Cargos
createResponder({
    customId: "config/punicoes/cargos",
    types: [ResponderType.Button],
    cache: "cached",
    async run(interaction) {
        const container = createContainer("#FFFFFF", "**🎭 Configurar Cargos de Advertência**", Separator.Default, "Selecione os cargos para cada nível de advertência:", Separator.Default, createRow(new RoleSelectMenuBuilder({
            customId: "config/punicoes/cargos/1",
            placeholder: "1ª Advertência",
            maxValues: 1,
        })), Separator.Default, createRow(new RoleSelectMenuBuilder({
            customId: "config/punicoes/cargos/2",
            placeholder: "2ª Advertência",
            maxValues: 1,
        })), Separator.Default, createRow(new RoleSelectMenuBuilder({
            customId: "config/punicoes/cargos/3",
            placeholder: "3ª Advertência",
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
    customId: "config/punicoes/cargos/1",
    types: [ResponderType.RoleSelect],
    cache: "cached",
    async run(interaction) {
        const roleId = interaction.values[0];
        const config = await getPunishmentConfig(interaction.guildId);
        config.advertencia1 = roleId;
        await setPunishmentConfig(interaction.guildId, config);
        const container = montarContainerPunicoesConfig(config);
        await interaction.update({ components: [container] });
    }
});
createResponder({
    customId: "config/punicoes/cargos/2",
    types: [ResponderType.RoleSelect],
    cache: "cached",
    async run(interaction) {
        const roleId = interaction.values[0];
        const config = await getPunishmentConfig(interaction.guildId);
        config.advertencia2 = roleId;
        await setPunishmentConfig(interaction.guildId, config);
        const container = montarContainerPunicoesConfig(config);
        await interaction.update({ components: [container] });
    }
});
createResponder({
    customId: "config/punicoes/cargos/3",
    types: [ResponderType.RoleSelect],
    cache: "cached",
    async run(interaction) {
        const roleId = interaction.values[0];
        const config = await getPunishmentConfig(interaction.guildId);
        config.advertencia3 = roleId;
        await setPunishmentConfig(interaction.guildId, config);
        const container = montarContainerPunicoesConfig(config);
        await interaction.update({ components: [container] });
    }
});
// Limites
createResponder({
    customId: "config/punicoes/limites",
    types: [ResponderType.Button],
    cache: "cached",
    async run(interaction) {
        const config = await getPunishmentConfig(interaction.guildId);
        const modal = new ModalBuilder()
            .setCustomId("config/punicoes/limites-modal")
            .setTitle("Limite de Advertências")
            .addComponents(new ActionRowBuilder({ components: [
                new TextInputBuilder()
                    .setCustomId("limite_max")
                    .setLabel("Max advertências antes do ban")
                    .setValue(String(config.maxWarnsBeforeBan))
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true)
                    .setMaxLength(2),
            ] }));
        await interaction.showModal(modal);
    }
});
createResponder({
    customId: "config/punicoes/limites-modal",
    types: [ResponderType.ModalComponent],
    cache: "cached",
    async run(interaction) {
        const value = parseInt(interaction.fields.getTextInputValue("limite_max"));
        if (isNaN(value) || value < 1 || value > 20) {
            await interaction.reply({ flags: ["Ephemeral"], content: "❌ Valor inválido. Digite um número entre 1 e 20." });
            return;
        }
        const config = await getPunishmentConfig(interaction.guildId);
        config.maxWarnsBeforeBan = value;
        await setPunishmentConfig(interaction.guildId, config);
        const container = montarContainerPunicoesConfig(config);
        await interaction.update({ components: [container] });
    }
});
