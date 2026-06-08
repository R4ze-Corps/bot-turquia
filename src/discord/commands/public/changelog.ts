import { createCommand } from "#base";
import { ApplicationCommandType, PermissionFlagsBits, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } from "discord.js";

createCommand({
    name: "changelog",
    description: "Criar e enviar um changelog para o canal de atualizações",
    type: ApplicationCommandType.ChatInput,
    defaultMemberPermissions: PermissionFlagsBits.ModerateMembers,
    async run(interaction) {
        const modal = new ModalBuilder()
            .setCustomId("changelog/enviar")
            .setTitle("📋 Changelog");

        const titulo = new TextInputBuilder()
            .setCustomId("changelog/titulo")
            .setLabel("Título do changelog")
            .setPlaceholder("Ex: Atualização 2.0")
            .setStyle(TextInputStyle.Short)
            .setMaxLength(100)
            .setRequired(true);

        const input = new TextInputBuilder()
            .setCustomId("changelog/conteudo")
            .setLabel("Conteúdo do changelog")
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder("Descreva as mudanças realizadas...")
            .setMaxLength(4000)
            .setRequired(true);

        const footer = new TextInputBuilder()
            .setCustomId("changelog/footer")
            .setLabel("Rodapé (opcional)")
            .setPlaceholder("Ex: ONE CORE 2026")
            .setStyle(TextInputStyle.Short)
            .setMaxLength(100)
            .setRequired(false);

        modal.addComponents(
            new ActionRowBuilder<TextInputBuilder>().addComponents(titulo),
            new ActionRowBuilder<TextInputBuilder>().addComponents(input),
            new ActionRowBuilder<TextInputBuilder>().addComponents(footer),
        );

        await interaction.showModal(modal);
    }
});
