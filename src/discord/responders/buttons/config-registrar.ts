import { createResponder } from "#base";
import { ResponderType } from "@constatic/base";
import { setGuildConfig, getGuildConfig, pendingConfigs } from "#database";
import { montarMenuConfig, montarContainerRegistrar } from "../../data/config.js";

createResponder({
    customId: "config/registrar/save",
    types: [ResponderType.Button],
    cache: "cached",
    async run(interaction) {
        const key = `${interaction.guildId}-${interaction.user.id}`;
        const config = pendingConfigs.get(key);

        if (!config || !config.registrationRoleId || !config.approvedRoleId) {
            await interaction.reply({
                flags: ["Ephemeral"],
                content: "Você precisa selecionar pelo menos o **Cargo de Registro** e o **Cargo Aprovado** antes de salvar."
            });
            return;
        }

        await setGuildConfig(interaction.guildId!, {
            registrationRoleId: config.registrationRoleId,
            approvedRoleId: config.approvedRoleId,
            approvedRole2Id: config.approvedRole2Id ?? null,
            logChannelId: config.logChannelId ?? null,
        });

        pendingConfigs.delete(key);

        const container = montarMenuConfig();

        await interaction.update({ components: [container] });
    }
});

createResponder({
    customId: "config/registrar/cancel",
    types: [ResponderType.Button],
    cache: "cached",
    async run(interaction) {
        const key = `${interaction.guildId}-${interaction.user.id}`;
        pendingConfigs.delete(key);

        const container = montarMenuConfig();

        await interaction.update({ components: [container] });
    }
});

createResponder({
    customId: "config/registrar/start",
    types: [ResponderType.Button],
    cache: "cached",
    async run(interaction) {
        const existing = await getGuildConfig(interaction.guildId!);

        const key = `${interaction.guildId}-${interaction.user.id}`;
        if (existing) {
            pendingConfigs.set(key, { ...existing });
        }

        const container = montarContainerRegistrar(existing);

        await interaction.update({ components: [container] });
    }
});