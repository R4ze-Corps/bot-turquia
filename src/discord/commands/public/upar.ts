import { createCommand } from "#base";
import { ApplicationCommandType, PermissionFlagsBits } from "discord.js";
import { createContainer, createRow, Separator } from "@magicyan/discord";
import { ButtonBuilder, ButtonStyle } from "discord.js";

createCommand({
    name: "upar",
    description: "Promover ou rebaixar um membro",
    type: ApplicationCommandType.ChatInput,
    defaultMemberPermissions: PermissionFlagsBits.ModerateMembers,
    async run(interaction) {
        const container = createContainer("#FFFFFF",
            "**GESTÃO DE MEMBROS**",
            Separator.Default,
            "Selecione uma das opções abaixo para gerenciar a hierarquia de um membro.",
            Separator.Default,
            createRow(
                new ButtonBuilder()
                    .setCustomId("upar/promover")
                    .setLabel("Promover")
                    .setEmoji("📈")
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId("upar/rebaixar")
                    .setLabel("Rebaixar")
                    .setEmoji("📉")
                    .setStyle(ButtonStyle.Secondary),
            ),
        );

        await interaction.reply({
            components: [container],
            flags: ["IsComponentsV2"],
        });
    }
});