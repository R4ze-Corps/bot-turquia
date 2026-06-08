import { createResponder } from "#base";
import { ResponderType } from "@constatic/base";
import { ButtonBuilder, ButtonStyle } from "discord.js";
import { createContainer, createRow, Separator } from "@magicyan/discord";
export const avisoStore = new Map();
createResponder({
    customId: "aviso/enviar-modal",
    types: [ResponderType.Modal],
    cache: "cached",
    async run(interaction) {
        try {
            const titulo = interaction.fields.getTextInputValue("aviso/titulo").trim();
            const texto = interaction.fields.getTextInputValue("aviso/texto").trim();
            if (!titulo || !texto) {
                await interaction.reply({ flags: ["Ephemeral"], content: "❌ Preencha todos os campos." });
                return;
            }
            const channelId = interaction.channelId;
            if (!channelId) {
                await interaction.reply({ flags: ["Ephemeral"], content: "❌ Canal não encontrado." });
                return;
            }
            avisoStore.set(interaction.user.id, {
                titulo,
                texto,
                channelId,
                guildName: interaction.guild?.name ?? "Servidor",
            });
            const previewContainer = createContainer("#FFFFFF", "📢 **PRÉ-VISUALIZAÇÃO DO AVISO**", Separator.Default, `**${titulo.toUpperCase()}**\n${texto}`, Separator.Default, `*Informativos ONE CORE | Servidor: ${interaction.guild?.name ?? "Servidor"}*`, createRow(new ButtonBuilder()
                .setCustomId("aviso/confirmar-envio")
                .setLabel("Enviar")
                .setEmoji("📨")
                .setStyle(ButtonStyle.Success), new ButtonBuilder()
                .setCustomId("aviso/cancelar-envio")
                .setLabel("Cancelar")
                .setStyle(ButtonStyle.Danger)));
            await interaction.reply({
                components: [previewContainer],
                flags: ["IsComponentsV2", "Ephemeral"],
            });
        }
        catch (error) {
            console.error("[Aviso Modal]", error);
            await interaction.reply({ flags: ["Ephemeral"], content: "❌ Erro ao processar o aviso." }).catch(() => { });
        }
    }
});
