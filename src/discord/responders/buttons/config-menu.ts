import { createResponder } from "#base";
import { ResponderType } from "@constatic/base";
import { ButtonBuilder, ButtonStyle, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import { createContainer, createRow, Separator } from "@magicyan/discord";
import { getGuildConfig, getHierarquiaConfig, getAcoesTemplates, getPunishmentConfig, getUpdateConfig, getVendasConfig, getStatusConfig, getReporteConfig, setReporteConfig, getFarmConfig, getAusenciaConfig, setAusenciaConfig, resetAllGuildConfig, pendingConfigs, pendingHierarquia } from "#database";
import { montarMenuConfig, montarContainerRegistrar, montarContainerHierarquiaConfig, montarContainerAcoesConfig, montarContainerPunicoesConfig, montarContainerUpdateConfig, montarContainerVendasConfig, montarContainerStatusConfig, montarContainerReporteConfig, montarContainerFarmConfig, montarContainerAusenciaConfig } from "../../data/config.js";

createResponder({
    customId: "config/menu/registrar",
    types: [ResponderType.Button],
    cache: "cached",
    async run(interaction) {
        const key = `${interaction.guildId}-${interaction.user.id}`;

        const existing = await getGuildConfig(interaction.guildId!);
        if (existing) {
            pendingConfigs.set(key, { ...existing });
        }

        const container = montarContainerRegistrar(existing);

        await interaction.update({ components: [container] });
    }
});

createResponder({
    customId: "config/menu/hierarquia",
    types: [ResponderType.Button],
    cache: "cached",
    async run(interaction) {
        const key = `${interaction.guildId}-${interaction.user.id}`;

        const existing = await getHierarquiaConfig(interaction.guildId!);
        if (existing) {
            pendingHierarquia.set(key, existing);
        }

        const container = montarContainerHierarquiaConfig(existing ?? undefined);

        await interaction.update({ components: [container] });
    }
});

createResponder({
    customId: "config/menu/acoes",
    types: [ResponderType.Button],
    cache: "cached",
    async run(interaction) {
        const templates = await getAcoesTemplates(interaction.guildId!);
        const container = montarContainerAcoesConfig(templates);
        await interaction.update({ components: [container] });
    }
});

createResponder({
    customId: "config/menu/punicoes",
    types: [ResponderType.Button],
    cache: "cached",
    async run(interaction) {
        const config = await getPunishmentConfig(interaction.guildId!);
        const container = montarContainerPunicoesConfig(config);
        await interaction.update({ components: [container] });
    }
});

createResponder({
    customId: "config/menu/farm",
    types: [ResponderType.Button],
    cache: "cached",
    async run(interaction) {
        const config = await getFarmConfig(interaction.guildId!);
        const container = montarContainerFarmConfig(config);
        await interaction.update({ components: [container] });
    }
});

createResponder({
    customId: "config/menu/update",
    types: [ResponderType.Button],
    cache: "cached",
    async run(interaction) {
        const config = await getUpdateConfig(interaction.guildId!);
        const container = montarContainerUpdateConfig(config);
        await interaction.update({ components: [container] });
    }
});

createResponder({
    customId: "config/menu/vendas",
    types: [ResponderType.Button],
    cache: "cached",
    async run(interaction) {
        const config = await getVendasConfig(interaction.guildId!);
        const container = montarContainerVendasConfig(config);
        await interaction.update({ components: [container] });
    }
});

createResponder({
    customId: "config/menu/status",
    types: [ResponderType.Button],
    cache: "cached",
    async run(interaction) {
        const config = await getStatusConfig(interaction.guildId!);
        const container = montarContainerStatusConfig(config);
        await interaction.update({ components: [container] });
    }
});

createResponder({
    customId: "config/menu/reporte",
    types: [ResponderType.Button],
    cache: "cached",
    async run(interaction) {
        const config = await getReporteConfig(interaction.guildId!);
        const container = montarContainerReporteConfig(config);
        await interaction.update({ components: [container] });
    }
});

createResponder({
    customId: "config/reporte/categoria",
    types: [ResponderType.ChannelSelect],
    cache: "cached",
    async run(interaction) {
        const config = await getReporteConfig(interaction.guildId!);
        config.categoriaId = interaction.values[0];
        await setReporteConfig(interaction.guildId!, config);
        const container = montarContainerReporteConfig(config);
        await interaction.update({ components: [container] });
    }
});

createResponder({
    customId: "config/menu/ausencia",
    types: [ResponderType.Button],
    cache: "cached",
    async run(interaction) {
        const config = await getAusenciaConfig(interaction.guildId!);
        const container = montarContainerAusenciaConfig(config);
        await interaction.update({ components: [container] });
    }
});

createResponder({
    customId: "config/redefinir",
    types: [ResponderType.Button],
    cache: "cached",
    async run(interaction) {
        const container = createContainer("#FFFFFF",
            "**🗑️ Redefinir Todas as Configurações**",
            Separator.Default,
            "Tem certeza que deseja redefinir **todas** as configurações deste servidor?",
            Separator.Default,
            "Isso irá apagar:",
            "- 📋 Configurações de registro",
            "- 🏆 Cargos de hierarquia",
            "- 🎯 Templates de ações",
            "- ⛔ Configurações de punições",
            "- 🔄 Configurações de update",
            "- 💵 Catálogo de vendas",
            "- 📡 Cargos de status",
            Separator.Default,
            "**Esta ação não pode ser desfeita.**",
            Separator.Default,
            createRow(
                new ButtonBuilder()
                    .setCustomId("config/redefinir/confirmar")
                    .setLabel("Sim, Redefinir Tudo")
                    .setStyle(ButtonStyle.Danger),
                new ButtonBuilder()
                    .setCustomId("config/menu/voltar")
                    .setLabel("Cancelar")
                    .setStyle(ButtonStyle.Secondary),
            ),
        );
        await interaction.update({ components: [container] });
    }
});

createResponder({
    customId: "config/redefinir/confirmar",
    types: [ResponderType.Button],
    cache: "cached",
    async run(interaction) {
        await resetAllGuildConfig(interaction.guildId!);
        const container = createContainer("#FFFFFF",
            "**🗑️ Configurações Redefinidas**",
            Separator.Default,
            "Todas as configurações deste servidor foram redefinidas com sucesso.",
            Separator.Default,
            "Use `/config` novamente para configurar do zero.",
            Separator.Default,
            createRow(
                new ButtonBuilder()
                    .setCustomId("config/menu/voltar")
                    .setLabel("Voltar")
                    .setEmoji({ id: "1504675345687773244", name: "chevron_left" })
                    .setStyle(ButtonStyle.Secondary),
            ),
        );
        pendingConfigs.delete(`${interaction.guildId}-${interaction.user.id}`);
        pendingHierarquia.delete(`${interaction.guildId}-${interaction.user.id}`);
        await interaction.update({ components: [container] });
    }
});

createResponder({
    customId: "config/menu/voltar",
    types: [ResponderType.Button],
    cache: "cached",
    async run(interaction) {
        const key = `${interaction.guildId}-${interaction.user.id}`;
        pendingHierarquia.delete(key);

        const container = montarMenuConfig();

        await interaction.update({ components: [container] });
    }
});

createResponder({
    customId: "config/ausencia/logs",
    types: [ResponderType.ChannelSelect],
    cache: "cached",
    async run(interaction) {
        const channelId = interaction.values[0];
        const config = await getAusenciaConfig(interaction.guildId!);
        config.logChannelId = channelId;
        await setAusenciaConfig(interaction.guildId!, config);
        const container = montarContainerAusenciaConfig(config);
        await interaction.update({ components: [container] });
    }
});

createResponder({
    customId: "config/ausencia/painel-setup",
    types: [ResponderType.Button],
    cache: "cached",
    async run(interaction) {
        const config = await getAusenciaConfig(interaction.guildId!);

        const modal = new ModalBuilder()
            .setCustomId("ausencia/config-painel")
            .setTitle("Configurar Painel de Ausência")
            .addComponents(
                new ActionRowBuilder<TextInputBuilder>().addComponents(
                    new TextInputBuilder()
                        .setCustomId("titulo")
                        .setLabel("Título do Painel")
                        .setValue(config.panelTitle)
                        .setStyle(TextInputStyle.Short)
                        .setRequired(true),
                ),
                new ActionRowBuilder<TextInputBuilder>().addComponents(
                    new TextInputBuilder()
                        .setCustomId("descricao")
                        .setLabel("Descrição do Painel")
                        .setValue(config.panelDesc)
                        .setStyle(TextInputStyle.Paragraph)
                        .setRequired(true),
                ),
            );

        await interaction.showModal(modal);
    }
});

createResponder({
    customId: "config/ausencia/enviar-painel",
    types: [ResponderType.Button],
    cache: "cached",
    async run(interaction) {
        const config = await getAusenciaConfig(interaction.guildId!);

        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
                .setCustomId("ausencia/abrir")
                .setLabel("Justificar Ausência")
                .setStyle(ButtonStyle.Secondary),
        );

        await interaction.channel!.send({
            content: `## ${config.panelTitle}\n${config.panelDesc}`,
            components: [row],
        });

        await interaction.reply({
            content: "✅ Painel enviado com sucesso!",
            flags: ["Ephemeral"],
        });
    }
});