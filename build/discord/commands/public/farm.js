import { createCommand } from "#base";
import { ApplicationCommandType } from "discord.js";
import { getFarmConfig } from "#database";
import { montarContainerRegistrarFarm } from "../../data/farm.js";
createCommand({
    name: "farm",
    description: "Registrar farm",
    type: ApplicationCommandType.ChatInput,
    async run(interaction) {
        try {
            const guild = interaction.guild;
            if (!guild) {
                await interaction.reply({ flags: ["Ephemeral"], content: "Este comando só pode ser usado em servidores." });
                return;
            }
            const config = await getFarmConfig(guild.id);
            const container = montarContainerRegistrarFarm(config.imagemUrl);
            await interaction.reply({
                components: [container],
                flags: ["IsComponentsV2"],
            });
        }
        catch (error) {
            console.error("[Farm-Command]", error);
            if (!interaction.replied) {
                await interaction.reply({ flags: ["Ephemeral"], content: "❌ Erro ao abrir farm." }).catch(() => { });
            }
        }
    }
});
