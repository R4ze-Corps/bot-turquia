import { createResponder } from "#base";
import { ResponderType } from "@constatic/base";
import { UserSelectMenuBuilder } from "discord.js";
import { createRow, createContainer, Separator } from "@magicyan/discord";
import { getGuildConfig } from "#database";
createResponder({
    customId: "registrar/preparar",
    types: [ResponderType.Button],
    cache: "cached",
    async run(interaction) {
        try {
            const config = await getGuildConfig(interaction.guildId);
            if (!config) {
                await interaction.reply({
                    flags: ["Ephemeral"],
                    content: "O sistema de registro foi desconfigurado. Contate um administrador."
                });
                return;
            }
            const container = createContainer("#FFFFFF", "**📝 Formulário de Registro**", Separator.Default, "Para fazer sua liberação, precisamos de algumas informações suas.", "Primeiro, **selecione seu recrutador** abaixo:", Separator.Default, createRow(new UserSelectMenuBuilder({
                customId: "registrar/recrutador",
                placeholder: "Selecione seu recrutador",
                maxValues: 1,
            })));
            await interaction.reply({
                flags: ["Ephemeral", "IsComponentsV2"],
                components: [container],
            });
        }
        catch (error) {
            console.error("[Registrar Preparar]", error);
            if (!interaction.replied) {
                await interaction.reply({
                    flags: ["Ephemeral"],
                    content: "❌ Erro ao preparar formulário. Tente novamente."
                }).catch(() => { });
            }
        }
    }
});
