import { createCommand } from "#base";
import { ApplicationCommandType } from "discord.js";
import { clearDatabaseCache, cleanupPendingMaps } from "#database";
import { createContainer, Separator } from "@magicyan/discord";
createCommand({
    name: "cache",
    description: "Limpa o cache do bot para otimizar",
    type: ApplicationCommandType.ChatInput,
    async run(interaction) {
        try {
            const guild = interaction.guild;
            if (!guild) {
                await interaction.reply({ flags: ["Ephemeral"], content: "Este comando só pode ser usado em servidores." });
                return;
            }
            const cleared = [];
            const dbSizeBefore = process.memoryUsage().heapUsed;
            clearDatabaseCache();
            cleared.push("Cache do banco de dados");
            cleanupPendingMaps();
            cleared.push("Sessões pendentes");
            const usersSizeBefore = guild.client.users.cache.size;
            guild.client.users.cache.clear();
            cleared.push(`Cache de usuários (${usersSizeBefore})`);
            const membersSizeBefore = guild.members.cache.size;
            guild.members.cache.clear();
            cleared.push(`Cache de membros (${membersSizeBefore})`);
            const emojisSizeBefore = guild.client.emojis.cache.size;
            guild.client.emojis.cache.clear();
            cleared.push(`Cache de emojis (${emojisSizeBefore})`);
            const { acoesEmAndamento } = await import("../../responders/modals/acao.js");
            const acoesSizeBefore = acoesEmAndamento.size;
            for (const [msgId, acao] of acoesEmAndamento) {
                if (acao.pingMsgId === "iniciada" || acao.participantes.length > 0)
                    continue;
                acoesEmAndamento.delete(msgId);
            }
            const acoesRemoved = acoesSizeBefore - acoesEmAndamento.size;
            if (acoesRemoved > 0)
                cleared.push(`Ações abandonadas (${acoesRemoved})`);
            const afterMem = process.memoryUsage().heapUsed;
            const freed = Math.round((dbSizeBefore - afterMem) / 1024 / 1024 * 100) / 100;
            const container = createContainer("#22c55e", "**🧹 Cache Limpo**", Separator.Default, cleared.map(c => `✅ ${c}`).join("\n"), Separator.Default, freed > 0 ? `💾 **Memória liberada:** ~${freed} MB` : "💾 **Memória:** sem alteração significativa");
            await interaction.reply({
                flags: ["Ephemeral", "IsComponentsV2"],
                components: [container],
            });
        }
        catch (error) {
            console.error("[Cache-Command]", error);
            if (!interaction.replied) {
                await interaction.reply({ flags: ["Ephemeral"], content: "❌ Erro ao limpar cache." }).catch(() => { });
            }
        }
    }
});
