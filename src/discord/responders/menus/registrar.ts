import { createResponder } from "#base";
import { ResponderType } from "@constatic/base";
import { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import { getGuildConfig } from "#database";
import { pendingRegistrations } from "../modals/registrar.js";

createResponder({
    customId: "registrar/recrutador",
    types: [ResponderType.UserSelect],
    cache: "cached",
    async run(interaction) {
        try {
            const recruiterId = interaction.values[0];

            const config = await getGuildConfig(interaction.guildId!);
            if (!config) {
                await interaction.reply({
                    flags: ["Ephemeral"],
                    content: "❌ A configuração de registro foi removida. Contate um administrador."
                });
                return;
            }

            pendingRegistrations.set(interaction.user.id, {
                nome: "",
                id: "",
                telefone: "",
                guildId: interaction.guildId!,
                userId: interaction.user.id,
                recruiterId,
            });

            const nomeInput = new TextInputBuilder()
                .setCustomId("nome")
                .setLabel("Nome")
                .setStyle(TextInputStyle.Short)
                .setPlaceholder("Ex: ALICE FERREIRA")
                .setMaxLength(60)
                .setRequired(true);

            const idInput = new TextInputBuilder()
                .setCustomId("id")
                .setLabel("ID")
                .setStyle(TextInputStyle.Short)
                .setPlaceholder("Apenas números")
                .setMaxLength(20)
                .setRequired(true);

            const telefoneInput = new TextInputBuilder()
                .setCustomId("telefone")
                .setLabel("Telefone")
                .setStyle(TextInputStyle.Short)
                .setPlaceholder("Apenas números")
                .setMaxLength(15)
                .setRequired(true);

            const modal = new ModalBuilder()
                .setCustomId("registrar/form")
                .setTitle("Registro - ONE NETWORK")
                .addComponents(
                    new ActionRowBuilder<TextInputBuilder>({ components: [nomeInput] }),
                    new ActionRowBuilder<TextInputBuilder>({ components: [idInput] }),
                    new ActionRowBuilder<TextInputBuilder>({ components: [telefoneInput] })
                );

            await interaction.showModal(modal);
        } catch (error) {
            console.error("[Registrar-Recrutador]", error);
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({
                    flags: ["Ephemeral"],
                    content: "❌ Erro ao processar seleção. Tente novamente."
                }).catch(() => {});
            }
        }
    }
});