import { createResponder } from "#base";
import { ResponderType } from "@constatic/base";
import { UserSelectMenuBuilder } from "discord.js";
import { createContainer, createRow, Separator } from "@magicyan/discord";
import { getUpdateConfig } from "#database";
const sessoesUpar = new Map();
export { sessoesUpar };
createResponder({
    customId: "upar/promover",
    types: [ResponderType.Button],
    cache: "cached",
    async run(interaction) {
        try {
            const config = await getUpdateConfig(interaction.guildId);
            sessoesUpar.set(interaction.user.id, { tipo: "PROMOÇÃO" });
            if (!config.filterRoleId) {
                await interaction.reply({ flags: ["Ephemeral"], content: "❌ Cargo de filtro não configurado. Configure em /config > Update." });
                return;
            }
            const select = new UserSelectMenuBuilder()
                .setCustomId("upar/select_member")
                .setPlaceholder("Selecione o membro...")
                .setMaxValues(1);
            const container = createContainer("#FFFFFF", "**📈 Promover**", Separator.Default, "**Membro**", `Apenas membros com <@&${config.filterRoleId}> podem ser selecionados.`, createRow(select));
            await interaction.reply({
                components: [container],
                flags: ["Ephemeral", "IsComponentsV2"],
            });
        }
        catch (error) {
            console.error("[Upar-Promover]", error);
        }
    }
});
createResponder({
    customId: "upar/rebaixar",
    types: [ResponderType.Button],
    cache: "cached",
    async run(interaction) {
        try {
            const config = await getUpdateConfig(interaction.guildId);
            sessoesUpar.set(interaction.user.id, { tipo: "REBAIXAMENTO" });
            if (!config.filterRoleId) {
                await interaction.reply({ flags: ["Ephemeral"], content: "❌ Cargo de filtro não configurado. Configure em /config > Update." });
                return;
            }
            const select = new UserSelectMenuBuilder()
                .setCustomId("upar/select_member")
                .setPlaceholder("Selecione o membro...")
                .setMaxValues(1);
            const container = createContainer("#FFFFFF", "**📉 Rebaixar**", Separator.Default, "**Membro**", `Apenas membros com <@&${config.filterRoleId}> podem ser selecionados.`, createRow(select));
            await interaction.reply({
                components: [container],
                flags: ["Ephemeral", "IsComponentsV2"],
            });
        }
        catch (error) {
            console.error("[Upar-Rebaixar]", error);
        }
    }
});
