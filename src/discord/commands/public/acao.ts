import { createCommand } from "#base";
import { ApplicationCommandType } from "discord.js";
import { getAcoesTemplates } from "#database";
import { montarContainerSelecaoAcao } from "../../data/acao.js";

createCommand({
    name: "acao",
    description: "Inicia a criação de uma nova ação",
    type: ApplicationCommandType.ChatInput,
    async run(interaction) {
        try {
            const guild = interaction.guild;
            if (!guild) {
                await interaction.reply({ flags: ["Ephemeral"], content: "Este comando só pode ser usado em servidores." });
                return;
            }

            const templates = await getAcoesTemplates(guild.id);
            if (templates.length === 0) {
                await interaction.reply({
                    flags: ["Ephemeral"],
                    content: "❌ Nenhuma ação configurada. Peça a um administrador para configurar ações em `/config`.",
                });
                return;
            }

            const container = montarContainerSelecaoAcao(templates);

            await interaction.reply({
                components: [container],
                flags: ["IsComponentsV2"],
            });
        } catch (error) {
            console.error("[Acao-Command]", error);
            if (!interaction.replied) {
                await interaction.reply({ flags: ["Ephemeral"], content: "❌ Erro ao criar ação." }).catch(() => {});
            }
        }
    }
});
