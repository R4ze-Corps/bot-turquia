import { createResponder } from "#base";
import { ResponderType } from "@constatic/base";
import { getStatusConfig, setStatusConfig } from "#database";
import { montarContainerStatusConfig } from "../../data/config.js";

const ROLE_FIELDS: Record<string, keyof import("#database").StatusRoleConfig> = {
    "config/status/role/online": "roleOnline",
    "config/status/role/atualizando": "roleAtualizando",
    "config/status/role/offline": "roleOffline",
    "config/status/role/instavel": "roleInstavel",
};

for (const [customId, field] of Object.entries(ROLE_FIELDS)) {
    createResponder({
        customId,
        types: [ResponderType.RoleSelect],
        cache: "cached",
        async run(interaction) {
            const config = await getStatusConfig(interaction.guildId!);
            config[field] = interaction.values[0];
            await setStatusConfig(interaction.guildId!, config);
            const container = montarContainerStatusConfig(config);
            await interaction.update({ components: [container] });
        }
    });
}
