import { createResponder } from "#base";
import { ResponderType } from "@constatic/base";
import { ModalSubmitInteraction, TextChannel, EmbedBuilder } from "discord.js";
import { getAusenciaConfig } from "#database";

createResponder({
    customId: "ausencia/modal",
    types: [ResponderType.Modal],
    cache: "cached",
    async run(interaction: ModalSubmitInteraction) {
        const motivo = interaction.fields.getTextInputValue("motivo");
        const dataRetorno = interaction.fields.getTextInputValue("data_retorno");

        await interaction.deferReply({ flags: ["Ephemeral"] });

        try {
            const config = await getAusenciaConfig(interaction.guildId!);

            let displayData = dataRetorno;
            const parts = dataRetorno.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
            if (parts) {
                const day = parseInt(parts[1], 10);
                const month = parseInt(parts[2], 10) - 1;
                const year = parseInt(parts[3], 10);
                const dateObj = new Date(year, month, day, 23, 59, 59);
                if (!isNaN(dateObj.getTime())) {
                    const unix = Math.floor(dateObj.getTime() / 1000);
                    displayData = `${dataRetorno} (<t:${unix}:R>)`;
                }
            }

            if (config.logChannelId) {
                const logChannel = interaction.guild!.channels.cache.get(config.logChannelId) as TextChannel;
                if (logChannel) {
                    const embed = new EmbedBuilder()
                        .setColor(0x2B2D31)
                        .setTitle("Nova Ausência Registrada")
                        .setDescription(
                            `**Membro:** <@${interaction.user.id}> (${interaction.user.tag})\n` +
                            `**Motivo:** ${motivo}\n` +
                            `**Retorno:** ${displayData}`
                        )
                        .setTimestamp();

                    await logChannel.send({ embeds: [embed] });
                }
            }

            await interaction.editReply({
                content: "✅ Sua ausência foi justificada com sucesso e enviada para a gerência!",
            });
        } catch (err) {
            console.error("[Ausencia Modal]", err);
            await interaction.editReply({
                content: "❌ Ocorreu um erro interno ao registrar sua ausência. Tente novamente mais tarde.",
            });
        }
    }
});
