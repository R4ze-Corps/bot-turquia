import { createCommand } from "#base";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ApplicationCommandType } from "discord.js";
import { getAusenciaConfig } from "#database";

createCommand({
    name: "ausencia",
    description: "Justifique sua ausência",
    type: ApplicationCommandType.ChatInput,
    async run(interaction) {
        const config = await getAusenciaConfig(interaction.guildId!);

        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
                .setCustomId("ausencia/abrir")
                .setLabel("Justificar Ausência")
                .setStyle(ButtonStyle.Secondary)
        );

        await interaction.reply({
            content: `## ${config.panelTitle}\n${config.panelDesc}`,
            components: [row],
            flags: ["Ephemeral"],
        });
    }
});
