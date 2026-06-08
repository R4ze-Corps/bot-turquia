import { createResponder } from "#base";
import { ResponderType } from "@constatic/base";
import { ChannelType, PermissionFlagsBits } from "discord.js";
import { getFarmConfig, getFarmSala, setFarmSala, deleteFarmSala } from "#database";
import { montarContainerRegistrarFarm, montarContainerBoasVindas, montarContainerLog, montarContainerSelecaoProduto, montarContainerVerEntregas, montarContainerConfirmacaoFinalizar, montarContainerConfirmacaoFechar, montarContainerFarmFinalizado } from "../../data/farm.js";

function extrairDadosNickname(memberName: string): { id: string; nome: string } {
    const partes = memberName.split("|");
    const id = (partes[0] || "unknown").trim();
    const nomeBruto = (partes[1] || memberName).trim();
    const primeiroNome = nomeBruto.split(" ")[0];
    const nome = primeiroNome.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return { id, nome };
}

createResponder({
    customId: "farm/criar-sala",
    types: [ResponderType.Button],
    cache: "cached",
    async run(interaction) {
        try {
            const guild = interaction.guild;
            if (!guild || !interaction.member) return;

            const config = await getFarmConfig(guild.id);
            if (!config.categoriaId) {
                await interaction.reply({ flags: ["Ephemeral"], content: "❌ A categoria para criação de salas não foi configurada. Avise a administração." });
                return;
            }

            const category = guild.channels.cache.get(config.categoriaId);
            if (!category || category.type !== ChannelType.GuildCategory) {
                await interaction.reply({ flags: ["Ephemeral"], content: "❌ A categoria configurada não existe mais. Avise a administração." });
                return;
            }

            const guildMember = await guild.members.fetch(interaction.user.id);
            const memberName = guildMember.displayName;
            const { id, nome } = extrairDadosNickname(memberName);
            const channelName = `⭐・${id}-${nome}`.toLowerCase();

            const channel = await guild.channels.create({
                name: channelName,
                type: ChannelType.GuildText,
                parent: category.id,
                topic: interaction.user.id,
                permissionOverwrites: [
                    {
                        id: guild.id,
                        deny: [PermissionFlagsBits.ViewChannel],
                    },
                    {
                        id: interaction.user.id,
                        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory],
                    },
                    {
                        id: interaction.client.user!.id,
                        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.ManageChannels],
                    },
                ],
            });

            const boasVindas = montarContainerBoasVindas(interaction.user.id, config.produtos);
            const msg = await channel.send({ flags: ["IsComponentsV2"], components: [boasVindas] });

            const salaKey = `${guild.id}-${channel.id}`;
            await setFarmSala(salaKey, {
                memberId: interaction.user.id,
                memberName: memberName,
                channelId: channel.id,
                guildId: guild.id,
                messageId: msg.id,
                inicioTimestamp: null,
                ultimaTimestamp: null,
                entregas: [],
                status: "em_andamento",
            });

            await interaction.reply({
                flags: ["Ephemeral"],
                content: `✅ Sala criada: ${channel}`,
            });
        } catch (error) {
            console.error("[Farm-CriarSala]", error);
            if (!interaction.replied) {
                await interaction.reply({ flags: ["Ephemeral"], content: "❌ Erro ao criar sala de farm." }).catch(() => {});
            }
        }
    },
});

createResponder({
    customId: "farm/registrar",
    types: [ResponderType.Button],
    cache: "cached",
    async run(interaction) {
        if (!interaction.channel || !interaction.guild) return;

        const config = await getFarmConfig(interaction.guild.id);
        if (config.produtos.length === 0) {
            await interaction.reply({ flags: ["Ephemeral"], content: "❌ Nenhum produto cadastrado. Avise a administração." });
            return;
        }

        const salaKey = `${interaction.guild.id}-${interaction.channel.id}`;
        const sala = await getFarmSala(salaKey);
        if (!sala) {
            await interaction.reply({ flags: ["Ephemeral"], content: "❌ Sala não encontrada." });
            return;
        }

        // If previous week was finalized, reset for a new week
        if (sala.status === "meta_encerrada") {
            sala.status = "em_andamento";
            sala.entregas = [];
            sala.inicioTimestamp = Date.now();
            sala.ultimaTimestamp = null;
            sala.finalizedBy = undefined;
            sala.finalizedAt = undefined;
            delete sala.logMessageId;
            await setFarmSala(salaKey, sala);
        }

        if (sala.status !== "em_andamento") {
            await interaction.reply({ flags: ["Ephemeral"], content: "❌ Esta semana de farm já foi encerrada." });
            return;
        }

        const container = montarContainerSelecaoProduto(config.produtos);
        await interaction.update({ components: [container] });
    },
});

createResponder({
    customId: "farm/ver-entregas",
    types: [ResponderType.Button],
    cache: "cached",
    async run(interaction) {
        if (!interaction.channel || !interaction.guild) return;

        const salaKey = `${interaction.guild.id}-${interaction.channel.id}`;
        const sala = await getFarmSala(salaKey);
        if (!sala) {
            await interaction.reply({ flags: ["Ephemeral"], content: "❌ Sala não encontrada." });
            return;
        }

        const config = await getFarmConfig(interaction.guild.id);
        const container = montarContainerVerEntregas(config.produtos, sala.entregas);
        await interaction.reply({ flags: ["Ephemeral", "IsComponentsV2"], components: [container] });
    },
});

createResponder({
    customId: "farm/finalizar",
    types: [ResponderType.Button],
    cache: "cached",
    async run(interaction) {
        if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
            await interaction.reply({ flags: ["Ephemeral"], content: "❌ Apenas administradores podem finalizar o farm." });
            return;
        }

        const container = montarContainerConfirmacaoFinalizar();
        await interaction.update({ components: [container] });
    },
});

createResponder({
    customId: "farm/finalizar/confirmar",
    types: [ResponderType.Button],
    cache: "cached",
    async run(interaction) {
        try {
            if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
                await interaction.reply({ flags: ["Ephemeral"], content: "❌ Apenas administradores podem finalizar o farm." });
                return;
            }

            if (!interaction.channel || !interaction.guild) return;

            const guild = interaction.guild;
            const salaKey = `${guild.id}-${interaction.channel.id}`;
            const sala = await getFarmSala(salaKey);
            if (!sala) {
                await interaction.reply({ flags: ["Ephemeral"], content: "❌ Sala não encontrada." });
                return;
            }

            const config = await getFarmConfig(guild.id);

            // Update sala status
            sala.status = "meta_encerrada";
            sala.finalizedBy = interaction.user.id;
            sala.finalizedAt = Date.now();
            await setFarmSala(salaKey, sala);

            // Build containers
            const salaContainer = montarContainerLog(
                config.produtos,
                [],
                sala.memberId,
                sala.inicioTimestamp,
                sala.ultimaTimestamp,
                "meta_encerrada",
                interaction.user.id,
                true,
            );

            const logContainer = montarContainerFarmFinalizado(
                config.produtos,
                sala.entregas,
                sala.memberId,
                sala.inicioTimestamp,
                sala.ultimaTimestamp,
                interaction.user.id,
                false,
            );

            // Update the sala message — keep all buttons visible
            const channel = interaction.channel;
            if (channel.isTextBased()) {
                try {
                    const msg = await channel.messages.fetch(sala.messageId);
                    await msg.edit({ components: [salaContainer] });
                } catch { /* ignore */ }
            }

            await interaction.update({ components: [salaContainer] });

            // Send/edit final log in log channel without buttons
            if (config.logChannelId) {
                const logChannel = guild.channels.cache.get(config.logChannelId);
                if (logChannel?.isTextBased()) {
                    if (sala.logMessageId) {
                        try {
                            const logMsg = await logChannel.messages.fetch(sala.logMessageId);
                            await logMsg.edit({ components: [logContainer] });
                        } catch {
                            await logChannel.send({ flags: ["IsComponentsV2"], components: [logContainer] });
                        }
                    } else {
                        await logChannel.send({ flags: ["IsComponentsV2"], components: [logContainer] });
                    }
                }
            }

            // Assign roles
            const member = await guild.members.fetch(sala.memberId).catch(() => null);
            if (member && config.cargos) {
                const todasBatidas = config.produtos.length > 0 && config.produtos.every(p => {
                    const total = sala.entregas.filter(e => e.produtoId === p.id).reduce((s, e) => s + e.quantidade, 0);
                    return total >= p.meta;
                });
                const algumaEntrega = sala.entregas.length > 0;

                let cargoId: string | null = null;
                if (todasBatidas) cargoId = config.cargos.cargoMetaConcluida;
                else if (algumaEntrega) cargoId = config.cargos.cargoMetaIncompleta;
                else cargoId = config.cargos.cargoNenhumaEntrega;

                if (cargoId) {
                    await member.roles.add(cargoId).catch(() => {});
                }
            }
        } catch (error) {
            console.error("[Farm-Finalizar]", error);
        }
    },
});

createResponder({
    customId: "farm/fechar",
    types: [ResponderType.Button],
    cache: "cached",
    async run(interaction) {
        if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
            await interaction.reply({ flags: ["Ephemeral"], content: "❌ Apenas administradores podem fechar o canal." });
            return;
        }

        const container = montarContainerConfirmacaoFechar();
        await interaction.update({ components: [container] });
    },
});

createResponder({
    customId: "farm/fechar/confirmar",
    types: [ResponderType.Button],
    cache: "cached",
    async run(interaction) {
        if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
            await interaction.reply({ flags: ["Ephemeral"], content: "❌ Apenas administradores podem fechar o canal." });
            return;
        }

        if (!interaction.channel || !interaction.guild) return;

        const guild = interaction.guild;
        const salaKey = `${guild.id}-${interaction.channel.id}`;
        await deleteFarmSala(salaKey);

        await interaction.reply({ flags: ["Ephemeral"], content: "🔒 Canal será fechado..." });

        setTimeout(async () => {
            try {
                await interaction.channel?.delete();
            } catch { /* ignore */ }
        }, 3000);
    },
});

createResponder({
    customId: "farm/voltar-painel",
    types: [ResponderType.Button],
    cache: "cached",
    async run(interaction) {
        if (!interaction.channel || !interaction.guild) return;

        // Determine context: if it's in a farm sala channel, go back to log, else go to initial
        const salaKey = `${interaction.guild.id}-${interaction.channel.id}`;
        const sala = await getFarmSala(salaKey);
        if (sala) {
            const config = await getFarmConfig(interaction.guild.id);
            const container = montarContainerLog(
                config.produtos,
                sala.entregas,
                sala.memberId,
                sala.inicioTimestamp,
                sala.ultimaTimestamp,
                sala.status,
                sala.finalizedBy,
            );
            await interaction.update({ components: [container] });
        } else {
            const container = montarContainerRegistrarFarm();
            await interaction.update({ components: [container] });
        }
    },
});
