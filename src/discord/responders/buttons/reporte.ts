import { createResponder } from "#base";
import { ResponderType } from "@constatic/base";
import { ButtonBuilder, ButtonStyle, ChannelType, PermissionFlagsBits } from "discord.js";
import { createContainer, createRow, Separator } from "@magicyan/discord";
import { getReporteConfig } from "#database";

createResponder({
  customId: "reporte/abrir",
  types: [ResponderType.Button],
  cache: "cached",
  async run(interaction) {
    try {
      const guild = interaction.guild;
      if (!guild) return;

      const config = await getReporteConfig(guild.id);
      if (!config.categoriaId) {
        await interaction.reply({
          flags: ["Ephemeral"],
          content: "O sistema de reportes não foi configurado. Avise a administração.",
        });
        return;
      }

      const category = guild.channels.cache.get(config.categoriaId);
      if (!category || category.type !== ChannelType.GuildCategory) {
        await interaction.reply({
          flags: ["Ephemeral"],
          content: "A categoria configurada não existe mais. Avise a administração.",
        });
        return;
      }

      const channelName = `reporte-${interaction.user.username.toLowerCase().replace(/[^a-z0-9]/g, "")}`;

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

      const ticketContainer = createContainer("#FFFFFF",
        "**# Atendimento Técnico Iniciado**",
        Separator.Default,
        `**Reporte por:** <@${interaction.user.id}>`,
        Separator.Default,
        "- Seu reporte de bug foi registrado e já está na fila de análise.\n- Por favor, envie evidências (fotos/vídeos) do erro neste canal.\n- O chamado será encerrado assim que o problema for corrigido\n\n *Aguarde o retorno do desenvolvedor.*",
        Separator.Default,
        "**SELECIONE A PRIORIDADE DO PROBLEMA**",
        createRow(
          new ButtonBuilder()
            .setCustomId("reporte/prioridade/alta")
            .setLabel("ALTA")
            .setEmoji("🔴")
            .setStyle(ButtonStyle.Danger),
          new ButtonBuilder()
            .setCustomId("reporte/prioridade/media")
            .setLabel("MÉDIA")
            .setEmoji("🔵")
            .setStyle(ButtonStyle.Secondary),
          new ButtonBuilder()
            .setCustomId("reporte/prioridade/baixa")
            .setLabel("BAIXA")
            .setEmoji("🟢")
            .setStyle(ButtonStyle.Success),
        ),
        Separator.Default,
        createRow(
          new ButtonBuilder()
            .setCustomId("reporte/iniciar-atendimento")
            .setLabel("Iniciar Atendimento")
            .setEmoji("🔧")
            .setStyle(ButtonStyle.Secondary),
          new ButtonBuilder()
            .setCustomId("reporte/fechar")
            .setLabel("Fechar")
            .setEmoji("🔒")
            .setStyle(ButtonStyle.Secondary),
        ),
      );

      await channel.send({ flags: ["IsComponentsV2"], components: [ticketContainer] });

      await interaction.reply({
        flags: ["Ephemeral"],
        content: `✅ Canal criado: ${channel}`,
      });
    } catch (error) {
      console.error("[Reporte-Abrir]", error);
      await interaction.reply({
        flags: ["Ephemeral"],
        content: "Erro ao criar o canal de reporte.",
      }).catch(() => {});
    }
  },
});

createResponder({
  customId: "reporte/iniciar-atendimento",
  types: [ResponderType.Button],
  cache: "cached",
  async run(interaction) {
    try {
      const container = createContainer("#FFFFFF",
        "**🔧 Atendimento em Andamento**",
        Separator.Default,
        `**Atendente:** <@${interaction.user.id}>`,
        Separator.Default,
        "O desenvolvedor está analisando o problema.\n\nAcompanhe este canal para atualizações.",
        Separator.Default,
        createRow(
          new ButtonBuilder()
            .setCustomId("reporte/fechar")
            .setLabel("Fechar")
            .setEmoji("🔒")
            .setStyle(ButtonStyle.Secondary),
        ),
      );

      await interaction.update({ components: [container] });
    } catch (error) {
      console.error("[Reporte-IniciarAtendimento]", error);
    }
  },
});

createResponder({
  customId: "reporte/fechar",
  types: [ResponderType.Button],
  cache: "cached",
  async run(interaction) {
    try {
      if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
        await interaction.reply({
          flags: ["Ephemeral"],
          content: "❌ Apenas administradores podem fechar o chamado.",
        });
        return;
      }

      const container = createContainer("#FFFFFF",
        "**🔒 Confirmar Fechamento**",
        Separator.Default,
        "Tem certeza que deseja fechar este chamado?",
        Separator.Default,
        createRow(
          new ButtonBuilder()
            .setCustomId("reporte/fechar/confirmar")
            .setLabel("Sim, fechar")
            .setEmoji("🔒")
            .setStyle(ButtonStyle.Danger),
          new ButtonBuilder()
            .setCustomId("reporte/fechar/cancelar")
            .setLabel("Cancelar")
            .setEmoji("❌")
            .setStyle(ButtonStyle.Secondary),
        ),
      );

      await interaction.update({ components: [container] });
    } catch (error) {
      console.error("[Reporte-Fechar]", error);
    }
  },
});

createResponder({
  customId: "reporte/fechar/confirmar",
  types: [ResponderType.Button],
  cache: "cached",
  async run(interaction) {
    try {
      if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
        await interaction.reply({
          flags: ["Ephemeral"],
          content: "❌ Apenas administradores podem fechar o chamado.",
        });
        return;
      }

      const container = createContainer("#FFFFFF",
        "**🔒 Atendimento Encerrado**",
        Separator.Default,
        `**Encerrado por:** <@${interaction.user.id}>`,
        Separator.Default,
        "Este chamado foi encerrado.\n\nO canal será fechado em instantes...",
      );

      await interaction.update({ components: [container] });

      setTimeout(async () => {
        try {
          await interaction.channel?.delete();
        } catch {
          // ignore
        }
      }, 3000);
    } catch (error) {
      console.error("[Reporte-Fechar-Confirmar]", error);
    }
  },
});

createResponder({
  customId: "reporte/fechar/cancelar",
  types: [ResponderType.Button],
  cache: "cached",
  async run(interaction) {
    try {
      const channel = interaction.channel;
      const reporterId = channel && "topic" in channel ? (channel as any).topic ?? interaction.user.id : interaction.user.id;

      const container = createContainer("#FFFFFF",
        "**# Atendimento Técnico Iniciado**",
        Separator.Default,
        `**Reporte por:** <@${reporterId}>`,
        Separator.Default,
        "- Seu reporte de bug foi registrado e já está na fila de análise.\n- Por favor, envie evidências (fotos/vídeos) do erro neste canal.\n- O chamado será encerrado assim que o problema for corrigido\n\n *Aguarde o retorno do desenvolvedor.*",
        Separator.Default,
        "**SELECIONE A PRIORIDADE DO PROBLEMA**",
        createRow(
          new ButtonBuilder()
            .setCustomId("reporte/prioridade/alta")
            .setLabel("ALTA")
            .setEmoji("🔴")
            .setStyle(ButtonStyle.Danger),
          new ButtonBuilder()
            .setCustomId("reporte/prioridade/media")
            .setLabel("MÉDIA")
            .setEmoji("🔵")
            .setStyle(ButtonStyle.Secondary),
          new ButtonBuilder()
            .setCustomId("reporte/prioridade/baixa")
            .setLabel("BAIXA")
            .setEmoji("🟢")
            .setStyle(ButtonStyle.Success),
        ),
        Separator.Default,
        createRow(
          new ButtonBuilder()
            .setCustomId("reporte/iniciar-atendimento")
            .setLabel("Iniciar Atendimento")
            .setEmoji("🔧")
            .setStyle(ButtonStyle.Secondary),
          new ButtonBuilder()
            .setCustomId("reporte/fechar")
            .setLabel("Fechar")
            .setEmoji("🔒")
            .setStyle(ButtonStyle.Secondary),
        ),
      );

      await interaction.update({ components: [container] });
    } catch (error) {
      console.error("[Reporte-Fechar-Cancelar]", error);
    }
  },
});

const prioridadeMap: Record<string, { label: string; emoji: string }> = {
  "reporte/prioridade/alta": { label: "ALTA", emoji: "🔴" },
  "reporte/prioridade/media": { label: "MÉDIA", emoji: "🔵" },
  "reporte/prioridade/baixa": { label: "BAIXA", emoji: "🟢" },
};

for (const [customId, data] of Object.entries(prioridadeMap)) {
  createResponder({
    customId,
    types: [ResponderType.Button],
    cache: "cached",
    async run(interaction) {
      try {
        const ch = interaction.channel;
        if (!ch?.isTextBased()) return;

        const reporterId = ch && "topic" in ch ? (ch as any).topic ?? interaction.user.id : interaction.user.id;

        await ch.setName(`${data.emoji}・${data.label.toLocaleLowerCase()}`);

        await interaction.update({
          components: [
            createContainer("#FFFFFF",
              "**# Atendimento Técnico Iniciado**",
              Separator.Default,
              `**Reporte por:** <@${reporterId}>`,
              Separator.Default,
              "- Seu reporte de bug foi registrado e já está na fila de análise.\n- Por favor, envie evidências (fotos/vídeos) do erro neste canal.\n- O chamado será encerrado assim que o problema for corrigido\n\n *Aguarde o retorno do desenvolvedor.*",
              Separator.Default,
              `**PRIORIDADE DEFINIDA:** ${data.emoji} ${data.label}`,
              Separator.Default,
              createRow(
                new ButtonBuilder()
                  .setCustomId("reporte/iniciar-atendimento")
                  .setLabel("Iniciar Atendimento")
                  .setEmoji("🔧")
                  .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                  .setCustomId("reporte/fechar")
                  .setLabel("Fechar")
                  .setEmoji("🔒")
                  .setStyle(ButtonStyle.Secondary),
              ),
            ),
          ],
        });
      } catch (error) {
        console.error(`[Reporte-${data.label}]`, error);
      }
    },
  });
}
