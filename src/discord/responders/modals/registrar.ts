import { createResponder } from "#base";
import { ResponderType } from "@constatic/base";
import { ButtonBuilder, ButtonStyle } from "discord.js";
import { createRow, createContainer, Separator } from "@magicyan/discord";
import { getGuildConfig } from "#database";

const DIGITS_ONLY = /^\d+$/;

export interface PendingRegistration {
    nome: string;
    id: string;
    telefone: string;
    guildId: string;
    userId: string;
    recruiterId: string;
}

export const pendingRegistrations = new Map<string, PendingRegistration>();

createResponder({
    customId: "registrar/form",
    types: [ResponderType.ModalComponent],
    cache: "cached",
    async run(interaction) {
        try {
            const nome = interaction.fields.getTextInputValue("nome").trim();
            const id = interaction.fields.getTextInputValue("id").trim();
            const telefone = interaction.fields.getTextInputValue("telefone").trim();

            const words = nome.split(/\s+/).filter(Boolean);
            if (words.length < 2 || words.length > 4) {
                await interaction.reply({
                    flags: ["Ephemeral"],
                    content: "❌ **Nome inválido.** Digite apenas seu **primeiro e último nome** (ex: ALICE FERREIRA ou ALICE DE FERREIRA)."
                });
                return;
            }
            if (!words.every(w => /^[A-Za-zÀ-ÿ]+$/.test(w))) {
                await interaction.reply({
                    flags: ["Ephemeral"],
                    content: "❌ **Nome inválido.** Utilize apenas letras."
                });
                return;
            }

            if (!DIGITS_ONLY.test(id)) {
                await interaction.reply({
                    flags: ["Ephemeral"],
                    content: "❌ **ID inválido.** Digite apenas números."
                });
                return;
            }

            if (!DIGITS_ONLY.test(telefone)) {
                await interaction.reply({
                    flags: ["Ephemeral"],
                    content: "❌ **Telefone inválido.** Digite apenas números."
                });
                return;
            }

            const pending = pendingRegistrations.get(interaction.user.id);
            if (!pending || !pending.recruiterId) {
                await interaction.reply({
                    flags: ["Ephemeral"],
                    content: "❌ Sessão expirada. Use `/registrar` novamente."
                });
                return;
            }

            const config = await getGuildConfig(interaction.guildId!);
            if (!config) {
                await interaction.reply({
                    flags: ["Ephemeral"],
                    content: "❌ O sistema de registro foi desconfigurado. Contate um administrador."
                });
                return;
            }

            pending.nome = nome;
            pending.id = id;
            pending.telefone = telefone;
            pendingRegistrations.set(interaction.user.id, pending);

            const logChannel = config.logChannelId
                ? await interaction.guild!.channels.fetch(config.logChannelId).catch(() => null)
                : null;

            if (logChannel?.isTextBased()) {
                const logContainer = createContainer("#FFFFFF",
                    "**📋 Novo Registro Pendente**",
                    Separator.Default,
                    `**Candidato:** <@${interaction.user.id}>`,
                    `**Nome:** ${nome}`,
                    `**ID:** ${id}`,
                    `**Telefone:** ${telefone}`,
                    `**Recrutador:** <@${pending.recruiterId}>`,
                    `**Data:** <t:${Math.floor(Date.now() / 1000)}:F>`,
                    Separator.Default,
                    createRow(
                        new ButtonBuilder({
                            customId: `registrar/aprovar/${interaction.user.id}`,
                            label: "Aprovar",
                            style: ButtonStyle.Secondary,
                        }),
                        new ButtonBuilder({
                            customId: `registrar/reprovar/${interaction.user.id}`,
                            label: "Reprovar",
                            style: ButtonStyle.Secondary,
                        })
                    )
                );

                await logChannel.send({ flags: ["IsComponentsV2"], components: [logContainer] });
            }

            const confirmContainer = createContainer(constants.colors.success as any,
                "**📋 Registro enviado para análise!**",
                Separator.Default,
                `**Nome:** ${nome}`,
                `**ID:** ${id}`,
                `**Telefone:** ${telefone}`,
                `**Recrutador:** <@${pending.recruiterId}>`,
                Separator.Default,
                "Aguarde a aprovação de um responsável."
            );

            await interaction.reply({
                flags: ["Ephemeral", "IsComponentsV2"],
                components: [confirmContainer],
            });
        } catch (error) {
            console.error("[Modal Registrar]", error);
            await interaction.reply({
                flags: ["Ephemeral"],
                content: "❌ Ocorreu um erro ao processar seu registro. Tente novamente."
            }).catch(() => {});
        }
    }
});