import { createResponder } from "#base";
import { ResponderType } from "@constatic/base";
import { PermissionFlagsBits } from "discord.js";
import { createContainer, Separator } from "@magicyan/discord";
import { getGuildConfig } from "#database";
import { pendingRegistrations } from "../modals/registrar.js";
createResponder({
    customId: "registrar/aprovar/:userId",
    types: [ResponderType.Button],
    cache: "cached",
    async run(interaction, { userId }) {
        const member = await interaction.guild.members.fetch(interaction.user.id);
        if (!member.permissions.has(PermissionFlagsBits.Administrator)) {
            await interaction.reply({
                flags: ["Ephemeral"],
                content: "Apenas administradores podem aprovar registros."
            });
            return;
        }
        const data = pendingRegistrations.get(userId);
        if (!data) {
            await interaction.reply({
                flags: ["Ephemeral"],
                content: "❌ Registro não encontrado ou já foi processado."
            });
            return;
        }
        const config = await getGuildConfig(data.guildId);
        if (!config) {
            await interaction.reply({
                flags: ["Ephemeral"],
                content: "❌ Configuração de registro não encontrada."
            });
            return;
        }
        try {
            const target = await interaction.guild.members.fetch(userId);
            if (config.registrationRoleId) {
                await target.roles.remove(config.registrationRoleId, "Registro aprovado - ONE NETWORK");
            }
            await target.roles.add(config.approvedRoleId, "Registro aprovado - ONE NETWORK");
            if (config.approvedRole2Id) {
                await target.roles.add(config.approvedRole2Id, "Registro aprovado - ONE NETWORK");
            }
            const nome = data.nome.length > 12 ? data.nome.slice(0, 12) : data.nome;
            await target.setNickname(`${data.id} | ${nome}`, "Registro aprovado - ONE NETWORK");
            pendingRegistrations.delete(userId);
            const container = createContainer(constants.colors.success, "**✅ Registro Aprovado**", Separator.Default, `**Candidato:** <@${userId}>`, `**Nome:** ${data.nome}`, `**ID:** ${data.id}`, `**Telefone:** ${data.telefone}`, `**Recrutador:** <@${data.recruiterId}>`, `**Aprovado por:** <@${interaction.user.id}>`, `**Data:** <t:${Math.floor(Date.now() / 1000)}:F>`);
            await interaction.update({ components: [container] });
            try {
                await target.send(`✅ **Registro aprovado!**\n\nSeu registro foi aprovado por <@${interaction.user.id}>. Bem-vindo(a) à **ONE NETWORK**!`);
            }
            catch { }
        }
        catch (error) {
            await interaction.reply({
                flags: ["Ephemeral"],
                content: "❌ Erro ao atribuir cargos. Verifique se o bot tem permissões suficientes."
            });
        }
    }
});
createResponder({
    customId: "registrar/reprovar/:userId",
    types: [ResponderType.Button],
    cache: "cached",
    async run(interaction, { userId }) {
        const member = await interaction.guild.members.fetch(interaction.user.id);
        if (!member.permissions.has(PermissionFlagsBits.Administrator)) {
            await interaction.reply({
                flags: ["Ephemeral"],
                content: "Apenas administradores podem reprovar registros."
            });
            return;
        }
        const data = pendingRegistrations.get(userId);
        if (!data) {
            await interaction.reply({
                flags: ["Ephemeral"],
                content: "❌ Registro não encontrado ou já foi processado."
            });
            return;
        }
        pendingRegistrations.delete(userId);
        const container = createContainer(constants.colors.danger, "**❌ Registro Reprovado**", Separator.Default, `**Candidato:** <@${userId}>`, `**Nome:** ${data.nome}`, `**ID:** ${data.id}`, `**Telefone:** ${data.telefone}`, `**Recrutador:** <@${data.recruiterId}>`, `**Reprovado por:** <@${interaction.user.id}>`, `**Data:** <t:${Math.floor(Date.now() / 1000)}:F>`);
        await interaction.update({ components: [container] });
        try {
            const target = await interaction.guild.members.fetch(userId);
            await target.send(`❌ **Registro reprovado.**\n\nSeu registro foi reprovado por <@${interaction.user.id}>. Entre em contato com um responsável para mais informações.`);
        }
        catch { }
    }
});
