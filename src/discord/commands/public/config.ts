import { createCommand } from "#base";
import { ApplicationCommandType } from "discord.js";
import { montarMenuConfig } from "../../data/config.js";

createCommand({
    name: "config",
    description: "Painel de configuração do servidor",
    type: ApplicationCommandType.ChatInput,
    async run(interaction) {
        const guild = interaction.guild;
        if (!guild) {
            await interaction.reply({ flags: ["Ephemeral"], content: "Este comando só pode ser usado em servidores." });
            return;
        }

        const container = montarMenuConfig();

        await interaction.reply({
            flags: ["Ephemeral", "IsComponentsV2"],
            components: [container],
        });
    }
});