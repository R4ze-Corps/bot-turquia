import { createCommand } from "#base";
import { ApplicationCommandType, PermissionFlagsBits, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } from "discord.js";

createCommand({
    name: "aviso",
    description: "Enviar um aviso para todos os membros via DM",
    type: ApplicationCommandType.ChatInput,
    defaultMemberPermissions: PermissionFlagsBits.Administrator,
    async run(interaction) {
        const modal = new ModalBuilder()
            .setCustomId("aviso/enviar-modal")
            .setTitle("📢 Enviar Aviso");

        const tituloInput = new TextInputBuilder()
            .setCustomId("aviso/titulo")
            .setLabel("Título do aviso")
            .setStyle(TextInputStyle.Short)
            .setPlaceholder("Ex: MANUTENÇÃO PROGRAMADA")
            .setMaxLength(256)
            .setRequired(true);

        const textoInput = new TextInputBuilder()
            .setCustomId("aviso/texto")
            .setLabel("Texto do aviso")
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder("Escreva o conteúdo do aviso...")
            .setMaxLength(4000)
            .setRequired(true);

        modal.addComponents(
            new ActionRowBuilder<TextInputBuilder>().addComponents(tituloInput),
            new ActionRowBuilder<TextInputBuilder>().addComponents(textoInput),
        );

        await interaction.showModal(modal);
    }
});
