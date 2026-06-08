import { createResponder } from "#base";
import { ResponderType } from "@constatic/base";
import { pendingHierarquia } from "#database";
import { montarContainerHierarquiaEditado } from "../../data/config.js";

createResponder({
    customId: "config/hierarquia/role",
    types: [ResponderType.RoleSelect],
    cache: "cached",
    async run(interaction) {
        const selectedIds = interaction.values;
        const key = `${interaction.guildId}-${interaction.user.id}`;

        const current = pendingHierarquia.get(key) ?? [];

        const cargosAtuais = current.filter(c => selectedIds.includes(c.id));

        for (const id of selectedIds) {
            if (!cargosAtuais.some(c => c.id === id)) {
                const role = interaction.guild?.roles.cache.get(id);
                cargosAtuais.push({ id, nome: role?.name ?? "Cargo" });
            }
        }

        pendingHierarquia.set(key, cargosAtuais);

        const container = montarContainerHierarquiaEditado(cargosAtuais);

        await interaction.update({ components: [container] });
    }
});