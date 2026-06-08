import { createCommand } from "#base";
import { ApplicationCommandType } from "discord.js";
import { montarContainerHierarquia } from "../../data/hierarquia.js";

createCommand({
    name: "hierarquia",
    description: "Exibe a hierarquia de cargos do servidor",
    type: ApplicationCommandType.ChatInput,
    async run(interaction) {
        const guild = interaction.guild;
        if (!guild) {
            await interaction.reply({ flags: ["Ephemeral"], content: "Este comando só pode ser usado em servidores." });
            return;
        }

        const container = await montarContainerHierarquia(guild);

        await interaction.reply({
            flags: ["IsComponentsV2"],
            components: [container],
        });
    }
});