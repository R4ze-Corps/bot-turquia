import { createResponder } from "#base";
import { ResponderType } from "@constatic/base";
import { pendingConfigs } from "#database";

createResponder({
    customId: "config/registrar/role/:field",
    types: [ResponderType.RoleSelect],
    cache: "cached",
    async run(interaction, { field }) {
        const roleId = interaction.values[0];
        const key = `${interaction.guildId}-${interaction.user.id}`;

        const current = pendingConfigs.get(key) ?? {};

        if (field === "registration") {
            current.registrationRoleId = roleId;
        } else if (field === "approved") {
            current.approvedRoleId = roleId;
        } else if (field === "approved2") {
            current.approvedRole2Id = roleId;
        }

        pendingConfigs.set(key, current);

        await interaction.deferUpdate();
    }
});

createResponder({
    customId: "config/registrar/channel/log",
    types: [ResponderType.ChannelSelect],
    cache: "cached",
    async run(interaction) {
        const channelId = interaction.values[0];
        const key = `${interaction.guildId}-${interaction.user.id}`;

        const current = pendingConfigs.get(key) ?? {};
        current.logChannelId = channelId;

        pendingConfigs.set(key, current);

        await interaction.deferUpdate();
    }
});
