import { createResponder } from "#base";
import { ResponderType } from "@constatic/base";
import { ButtonBuilder, ButtonStyle, ActivityType } from "discord.js";
import { createContainer, createRow, Separator } from "@magicyan/discord";
import type { StatusRoleConfig } from "#database";

function formatUptime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const d = Math.floor(totalSeconds / 86400);
  const h = Math.floor((totalSeconds % 86400) / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  return `${d}d ${h}h ${m}m`;
}

function statusRoleLabel(config: StatusRoleConfig, presenceStatus: string, defaultLabel: string): string {
  const map: Record<string, string | null | undefined> = {
    online: config.roleOnline,
    idle: config.roleAtualizando,
    dnd: config.roleInstavel,
    invisible: config.roleOffline,
  };
  const roleId = map[presenceStatus];
  return roleId ? `<@&${roleId}>` : defaultLabel;
}

const STATUS_MAP: Record<string, { presence: "online" | "idle" | "dnd" | "invisible"; label: string }> = {
  "status/online": { presence: "online", label: "🟢 Online" },
  "status/atualizando": { presence: "idle", label: "🔄 Atualizando" },
  "status/offline": { presence: "invisible", label: "⚫ Offline" },
  "status/instavel": { presence: "dnd", label: "⚠️ Instável" },
};

createResponder({
  customId: "config/status/concluir",
  types: [ResponderType.Button],
  cache: "cached",
  async run(interaction) {
    const client = interaction.client;
    const ping = client.ws.ping;
    const uptime = client.uptime ?? 0;
    const botName = client.user?.username ?? "ONE NETWORK";
    const { getStatusConfig } = await import("#database");
    const config = await getStatusConfig(interaction.guildId!);

    const statusMap: Record<string, string> = {
      online: "🟢 Online",
      idle: "🌙 Ausente",
      dnd: "⛔ Não Perturbe",
      offline: "⚫ Offline",
    };

    const presenceStatus = client.user?.presence?.status ?? "online";
    const defaultLabel = statusMap[presenceStatus] ?? "🟢 Online";
    const statusLabel = statusRoleLabel(config, presenceStatus, defaultLabel);

    const container = createContainer(
      "#FFFFFF",
      "⚙️ Informações Gerais",
      Separator.Default,
      `**Bot:** ${botName}`,
      `**Criador:** Megan`,
      Separator.Default,
      "📡 Desempenho e Conexão",
      Separator.Default,
      `**Ping:** ${ping}ms`,
      `**Uptime:** ${formatUptime(uptime)}`,
      `**Status do Bot:** ${statusLabel}`,
      Separator.Default,
      createRow(
        new ButtonBuilder()
          .setCustomId("status/online")
          .setLabel("Online")
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId("status/atualizando")
          .setLabel("Atualizando")
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId("status/offline")
          .setLabel("Offline")
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId("status/instavel")
          .setLabel("Instável")
          .setStyle(ButtonStyle.Secondary),
      ),
    );

    await interaction.update({
      components: [container],
      flags: ["IsComponentsV2"],
    });
  },
});

createResponder({
  customId: "status/online",
  types: [ResponderType.Button],
  cache: "cached",
  async run(interaction) {
    await changeStatus(interaction, "status/online");
  },
});

createResponder({
  customId: "status/atualizando",
  types: [ResponderType.Button],
  cache: "cached",
  async run(interaction) {
    await changeStatus(interaction, "status/atualizando");
  },
});

createResponder({
  customId: "status/offline",
  types: [ResponderType.Button],
  cache: "cached",
  async run(interaction) {
    await changeStatus(interaction, "status/offline");
  },
});

createResponder({
  customId: "status/instavel",
  types: [ResponderType.Button],
  cache: "cached",
  async run(interaction) {
    await changeStatus(interaction, "status/instavel");
  },
});

const ROLE_MAP: Record<string, keyof import("#database").StatusRoleConfig> = {
  "status/online": "roleOnline",
  "status/atualizando": "roleAtualizando",
  "status/offline": "roleOffline",
  "status/instavel": "roleInstavel",
};

async function changeStatus(interaction: any, customId: string) {
  try {
    const statusInfo = STATUS_MAP[customId];
    if (!statusInfo) return;

    const client = interaction.client;
    const guild = interaction.guild;

    await client.user.setPresence({
      status: statusInfo.presence,
      activities: [{
        name: statusInfo.label,
        type: ActivityType.Custom,
      }],
    });

    const { getStatusConfig } = await import("#database");
    const config = await getStatusConfig(guild?.id ?? "");

    if (guild) {
      const roleField = ROLE_MAP[customId];
      const targetRoleId = config[roleField];

      if (targetRoleId && interaction.member?.roles) {
        const allRoleFields: (keyof import("#database").StatusRoleConfig)[] = [
          "roleOnline", "roleAtualizando", "roleOffline", "roleInstavel",
        ];
        for (const field of allRoleFields) {
          const roleId = config[field];
          if (roleId && interaction.member.roles.cache.has(roleId)) {
            await interaction.member.roles.remove(roleId).catch(() => {});
          }
        }
        await interaction.member.roles.add(targetRoleId).catch(() => {});
      }
    }

    const ping = client.ws.ping;
    const uptime = client.uptime ?? 0;
    const botName = client.user?.username ?? "ONE NETWORK";
    const statusLabel = statusRoleLabel(config, statusInfo.presence, statusInfo.label);

    const container = createContainer(
      "#FFFFFF",
      "⚙️ Informações Gerais",
      Separator.Default,
      `**Bot:** ${botName}`,
      `**Criador:** Megan`,
      Separator.Default,
      "📡 Desempenho e Conexão",
      Separator.Default,
      `**Ping:** ${ping}ms`,
      `**Uptime:** ${formatUptime(uptime)}`,
      `**Status do Bot:** ${statusLabel}`,
      Separator.Default,
      createRow(
        new ButtonBuilder()
          .setCustomId("status/online")
          .setLabel("Online")
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId("status/atualizando")
          .setLabel("Atualizando")
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId("status/offline")
          .setLabel("Offline")
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId("status/instavel")
          .setLabel("Instável")
          .setStyle(ButtonStyle.Secondary),
      ),
    );

    await interaction.update({
      components: [container],
    });
  } catch (error) {
    console.error("[Status]", error);
  }
}
