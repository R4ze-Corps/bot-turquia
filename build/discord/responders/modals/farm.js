import { createResponder } from "#base";
import { ResponderType } from "@constatic/base";
import { getFarmConfig, getFarmSala, addFarmEntrega, setFarmSala } from "#database";
import { montarContainerLog } from "../../data/farm.js";
import { selectedProdutoFarm } from "../selects/farm.js";
createResponder({
    customId: "farm/quantidade-modal",
    types: [ResponderType.ModalComponent],
    cache: "cached",
    async run(interaction) {
        try {
            if (!interaction.channel || !interaction.guild)
                return;
            const key = `${interaction.guildId}-${interaction.user.id}`;
            const produtoId = selectedProdutoFarm.get(key);
            if (!produtoId) {
                await interaction.reply({ flags: ["Ephemeral"], content: "❌ Sessão expirada. Use /farm novamente." });
                return;
            }
            const qtdStr = interaction.fields.getTextInputValue("farm_quantidade").trim();
            const quantidade = parseInt(qtdStr.replace(/\./g, ""));
            if (isNaN(quantidade) || quantidade <= 0) {
                await interaction.reply({ flags: ["Ephemeral"], content: "❌ Quantidade inválida. Digite um número válido." });
                return;
            }
            const config = await getFarmConfig(interaction.guild.id);
            const produto = config.produtos.find(p => p.id === produtoId);
            if (!produto) {
                await interaction.reply({ flags: ["Ephemeral"], content: "❌ Produto não encontrado." });
                return;
            }
            const salaKey = `${interaction.guild.id}-${interaction.channel.id}`;
            const sala = await getFarmSala(salaKey);
            if (!sala) {
                await interaction.reply({ flags: ["Ephemeral"], content: "❌ Sala não encontrada." });
                return;
            }
            if (sala.status !== "em_andamento") {
                await interaction.reply({ flags: ["Ephemeral"], content: "❌ Esta semana de farm já foi encerrada." });
                return;
            }
            const entrega = {
                produtoId,
                quantidade,
                autorId: interaction.user.id,
                timestamp: Date.now(),
            };
            const salaAtualizada = await addFarmEntrega(salaKey, entrega);
            // On first delivery of the week, remove any previously assigned farm roles
            if (salaAtualizada.entregas.length === 1 && config.cargos) {
                const member = await interaction.guild.members.fetch(salaAtualizada.memberId).catch(() => null);
                if (member) {
                    const roleIds = [config.cargos.cargoMetaConcluida, config.cargos.cargoMetaIncompleta, config.cargos.cargoNenhumaEntrega].filter(Boolean);
                    await member.roles.remove(roleIds).catch(() => { });
                }
            }
            // Build updated log containers
            const logContainer = montarContainerLog(config.produtos, salaAtualizada.entregas, salaAtualizada.memberId, salaAtualizada.inicioTimestamp, salaAtualizada.ultimaTimestamp, salaAtualizada.status, salaAtualizada.finalizedBy, true);
            const logContainerSimples = montarContainerLog(config.produtos, salaAtualizada.entregas, salaAtualizada.memberId, salaAtualizada.inicioTimestamp, salaAtualizada.ultimaTimestamp, salaAtualizada.status, salaAtualizada.finalizedBy, false);
            // Edit the main sala message
            const channel = interaction.channel;
            if (channel.isTextBased()) {
                try {
                    const msg = await channel.messages.fetch(sala.messageId);
                    await msg.edit({ components: [logContainer] });
                }
                catch { /* ignore */ }
            }
            // Send/edit log in log channel without buttons
            if (config.logChannelId) {
                const logChannel = interaction.guild.channels.cache.get(config.logChannelId);
                if (logChannel?.isTextBased()) {
                    if (salaAtualizada.logMessageId) {
                        try {
                            const logMsg = await logChannel.messages.fetch(salaAtualizada.logMessageId);
                            await logMsg.edit({ components: [logContainerSimples] });
                        }
                        catch {
                            const logMsg = await logChannel.send({ flags: ["IsComponentsV2"], components: [logContainerSimples] });
                            salaAtualizada.logMessageId = logMsg.id;
                            await setFarmSala(salaKey, salaAtualizada);
                        }
                    }
                    else {
                        const logMsg = await logChannel.send({ flags: ["IsComponentsV2"], components: [logContainerSimples] });
                        salaAtualizada.logMessageId = logMsg.id;
                        await setFarmSala(salaKey, salaAtualizada);
                    }
                }
            }
            // Update the current message too
            await interaction.update({ components: [logContainer] });
            selectedProdutoFarm.delete(key);
        }
        catch (error) {
            console.error("[Farm-QuantidadeModal]", error);
            if (!interaction.replied) {
                await interaction.reply({ flags: ["Ephemeral"], content: "❌ Erro ao registrar entrega." }).catch(() => { });
            }
        }
    }
});
