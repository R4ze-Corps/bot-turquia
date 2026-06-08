import { createCommand } from "#base";
import { ApplicationCommandType, ButtonBuilder, ButtonStyle, PermissionFlagsBits, } from "discord.js";
import { createContainer, createRow, Separator } from "@magicyan/discord";
import { getGuildConfig } from "#database";
createCommand({
    name: "registrar",
    description: "Sistema de registro",
    type: ApplicationCommandType.ChatInput,
    async run(interaction) {
        const guild = interaction.guild;
        if (!guild) {
            await interaction.reply({
                flags: ["Ephemeral"],
                content: "Este comando só pode ser usado em servidores.",
            });
            return;
        }
        const member = await guild.members.fetch(interaction.user.id);
        if (!member.permissions.has(PermissionFlagsBits.Administrator)) {
            await interaction.reply({
                flags: ["Ephemeral"],
                content: "Apenas administradores podem usar este comando.",
            });
            return;
        }
        const config = await getGuildConfig(guild.id);
        if (!config) {
            await interaction.reply({
                flags: ["Ephemeral"],
                content: "O sistema de registro ainda não foi configurado. Use `/config registrar` primeiro.",
            });
            return;
        }
        const container = createContainer("#FFFFFF", "# <:other_academycap:1504445361668755546> Sistema de Registro | ONE NETWORK", "Para fazer sua liberação, precisamos de algumas informações suas.", "Por favor, clique no botão abaixo para abrir o formulário e preencher seu **Nome, ID, Recrutador** e **Telefone.**", Separator.Default, createRow(new ButtonBuilder({
            customId: "registrar/preparar",
            label: "Registrar-se",
            style: ButtonStyle.Secondary,
        }).setEmoji({ id: "1504445324385714378", name: "file" })));
        await interaction.reply({
            flags: ["IsComponentsV2"],
            components: [container],
        });
    },
});
