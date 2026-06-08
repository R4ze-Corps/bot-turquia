import { ButtonBuilder, ButtonStyle, ChannelType, RoleSelectMenuBuilder, ChannelSelectMenuBuilder, StringSelectMenuBuilder } from "discord.js";
import { createContainer, createRow, Separator } from "@magicyan/discord";
export function montarMenuConfig() {
    const registrarBtn = new ButtonBuilder()
        .setCustomId("config/menu/registrar")
        .setLabel("Registrar")
        .setEmoji("📋")
        .setStyle(ButtonStyle.Secondary);
    const hierarquiaBtn = new ButtonBuilder()
        .setCustomId("config/menu/hierarquia")
        .setLabel("Hierarquia")
        .setEmoji("🏆")
        .setStyle(ButtonStyle.Secondary);
    const acoesBtn = new ButtonBuilder()
        .setCustomId("config/menu/acoes")
        .setLabel("Ações")
        .setEmoji("🎯")
        .setStyle(ButtonStyle.Secondary);
    const punicoesBtn = new ButtonBuilder()
        .setCustomId("config/menu/punicoes")
        .setLabel("Punições")
        .setEmoji("⛔")
        .setStyle(ButtonStyle.Secondary);
    const farmBtn = new ButtonBuilder()
        .setCustomId("config/menu/farm")
        .setLabel("Farm")
        .setEmoji("🌾")
        .setStyle(ButtonStyle.Secondary);
    const updateBtn = new ButtonBuilder()
        .setCustomId("config/menu/update")
        .setLabel("Update")
        .setEmoji("🔄")
        .setStyle(ButtonStyle.Secondary);
    const vendasBtn = new ButtonBuilder()
        .setCustomId("config/menu/vendas")
        .setLabel("Vendas")
        .setEmoji("💵")
        .setStyle(ButtonStyle.Secondary);
    const statusBtn = new ButtonBuilder()
        .setCustomId("config/menu/status")
        .setLabel("Status")
        .setEmoji("📡")
        .setStyle(ButtonStyle.Secondary);
    const reporteBtn = new ButtonBuilder()
        .setCustomId("config/menu/reporte")
        .setLabel("Reporte")
        .setEmoji("🐛")
        .setStyle(ButtonStyle.Secondary);
    const ausenciaBtn = new ButtonBuilder()
        .setCustomId("config/menu/ausencia")
        .setLabel("Ausência")
        .setEmoji("📅")
        .setStyle(ButtonStyle.Secondary);
    const redefinirBtn = new ButtonBuilder()
        .setCustomId("config/redefinir")
        .setLabel("Redefinir")
        .setEmoji("🗑️")
        .setStyle(ButtonStyle.Secondary);
    return createContainer("#FFFFFF", "**⚙️ Painel de Configuração**", Separator.Default, "Selecione uma opção para configurar:", Separator.Default, createRow(registrarBtn, hierarquiaBtn, acoesBtn), createRow(punicoesBtn, farmBtn, updateBtn), createRow(vendasBtn, statusBtn, reporteBtn, ausenciaBtn), Separator.Default, createRow(redefinirBtn));
}
export function montarContainerRegistrar(existing) {
    return createContainer("#FFFFFF", "**Cargo de Registro**\nCargo necessário para usar /registrar", createRow(new RoleSelectMenuBuilder({
        customId: "config/registrar/role/registration",
        placeholder: existing?.registrationRoleId ? "<cargo selecionado>" : "Selecione o cargo de registro",
        maxValues: 1,
    })), Separator.Default, "**Cargo Aprovado**\nCargo atribuído após a aprovação", createRow(new RoleSelectMenuBuilder({
        customId: "config/registrar/role/approved",
        placeholder: existing?.approvedRoleId ? "<cargo selecionado>" : "Selecione o cargo aprovado",
        maxValues: 1,
    })), Separator.Default, "**Cargo Aprovado 2**\nSegundo cargo opcional (ou nenhum)", createRow(new RoleSelectMenuBuilder({
        customId: "config/registrar/role/approved2",
        placeholder: existing?.approvedRole2Id ? "<cargo selecionado>" : "Selecione o cargo aprovado 2 (ou nenhum)",
        maxValues: 1,
    })), Separator.Default, "**Canal de Log**\nCanal onde os registros serão enviados para aprovação", createRow(new ChannelSelectMenuBuilder({
        customId: "config/registrar/channel/log",
        placeholder: existing?.logChannelId ? "<canal selecionado>" : "Selecione o canal de log",
        channelTypes: [ChannelType.GuildText],
        maxValues: 1,
    })), Separator.Default, createRow(new ButtonBuilder({
        customId: "config/registrar/save",
        label: "Salvar Configuração",
        style: ButtonStyle.Secondary,
    }), new ButtonBuilder({
        customId: "config/registrar/cancel",
        label: "Cancelar",
        style: ButtonStyle.Secondary,
    }), new ButtonBuilder({
        customId: "config/menu/voltar",
        label: "Voltar",
        style: ButtonStyle.Secondary,
    })));
}
function textoHierarquiaPreview(cargos) {
    if (cargos.length === 0)
        return "Nenhum cargo selecionado.";
    const lines = cargos.map(c => `• ${c.nome} (<@&${c.id}>)`);
    return lines.join("\n");
}
export function montarContainerHierarquiaConfig(cargos) {
    const lista = cargos ?? [];
    const preview = textoHierarquiaPreview(lista);
    const components = [];
    if (lista.length > 0) {
        components.push(new ButtonBuilder({
            customId: "config/hierarquia/editar-nomes",
            label: "Editar Nomes",
            style: ButtonStyle.Secondary,
        }));
    }
    components.push(new ButtonBuilder({
        customId: "config/hierarquia/salvar",
        label: "Salvar Hierarquia",
        style: ButtonStyle.Secondary,
    }), new ButtonBuilder({
        customId: "config/menu/voltar",
        label: "Voltar",
        style: ButtonStyle.Secondary,
    }));
    return createContainer("#FFFFFF", "**🏆 Configuração de Hierarquia**", Separator.Default, "**Cargos da Hierarquia** (do maior para o menor)", Separator.Default, preview, Separator.Default, "Selecione os cargos abaixo:", createRow(new RoleSelectMenuBuilder({
        customId: "config/hierarquia/role",
        placeholder: "Selecione os cargos da hierarquia",
        maxValues: 25,
    })), Separator.Default, createRow(...components));
}
export function montarContainerHierarquiaEditado(cargos) {
    return montarContainerHierarquiaConfig(cargos);
}
export function montarContainerAcoesConfig(templates) {
    const componentes = [
        "**🎯 Configuração de Ações**",
        Separator.Default,
        createRow(new ButtonBuilder()
            .setCustomId("config/acoes/adicionar")
            .setLabel("Adicionar Ação")
            .setEmoji({ id: "1504675349722693673", name: "pencil_line" })
            .setStyle(ButtonStyle.Secondary), new ButtonBuilder()
            .setCustomId("config/acoes/importar")
            .setLabel("Importar JSON")
            .setEmoji({ id: "1504675347931857019", name: "file_plus" })
            .setStyle(ButtonStyle.Secondary), new ButtonBuilder()
            .setCustomId("config/acoes/regras")
            .setLabel("Regras")
            .setEmoji({ id: "1504675344198799390", name: "book_marked" })
            .setStyle(ButtonStyle.Secondary), new ButtonBuilder()
            .setCustomId("config/menu/voltar")
            .setLabel("Voltar")
            .setEmoji({ id: "1504675345687773244", name: "chevron_left" })
            .setStyle(ButtonStyle.Secondary)),
    ];
    if (templates.length > 0) {
        componentes.push(Separator.Default, "**Selecione uma ação para editar:**", createRow(new StringSelectMenuBuilder()
            .setCustomId("config/acoes/selecionar")
            .setPlaceholder("Selecione uma ação...")
            .addOptions(templates.map(t => ({
            label: t.nome,
            description: `${t.armamento} — ${t.vagasMin}-${t.vagasMax} vagas`,
            value: t.id,
        })))));
    }
    return createContainer("#FFFFFF", ...componentes);
}
export function montarContainerUpdateConfig(config) {
    const statusLines = [
        `**🔄 Configuração de Update**`,
        ``,
        `👤 Cargo Geral: ${config.geraisRoleId ? `<@&${config.geraisRoleId}>` : "*Não configurado*"}`,
        `🔒 Cargo Filtro: ${config.filterRoleId ? `<@&${config.filterRoleId}>` : "*Não configurado*"}`,
        `📢 Canal de Logs: ${config.canalDestinoId ? `<#${config.canalDestinoId}>` : "*Não configurado*"}`,
        ``,
        `**📈 Cargos de Promoção (${config.cargosPromocao.length})**`,
        config.cargosPromocao.length > 0 ? config.cargosPromocao.map(c => `• <@&${c.id}> — ${c.nome}`).join("\n") : "*Nenhum*",
        ``,
        `**📉 Cargos de Rebaixamento (${config.cargosRebaixamento.length})**`,
        config.cargosRebaixamento.length > 0 ? config.cargosRebaixamento.map(c => `• <@&${c.id}> — ${c.nome}`).join("\n") : "*Nenhum*",
        ``,
        `**👥 Cargos de Gerência (${config.gerenciaRoleIds.length})**`,
        config.gerenciaRoleIds.length > 0 ? config.gerenciaRoleIds.map(id => `• <@&${id}>`).join("\n") : "*Nenhum*",
    ].join("\n");
    return createContainer("#FFFFFF", statusLines, Separator.Default, createRow(new ButtonBuilder()
        .setCustomId("config/update/gerais")
        .setLabel("Cargo Geral")
        .setStyle(ButtonStyle.Secondary), new ButtonBuilder()
        .setCustomId("config/update/filter")
        .setLabel("Cargo Filtro")
        .setStyle(ButtonStyle.Secondary), new ButtonBuilder()
        .setCustomId("config/update/canal")
        .setLabel("Canal de Logs")
        .setStyle(ButtonStyle.Secondary)), createRow(new ButtonBuilder()
        .setCustomId("config/update/promocao")
        .setLabel("Cargos Promoção")
        .setStyle(ButtonStyle.Secondary), new ButtonBuilder()
        .setCustomId("config/update/rebaixamento")
        .setLabel("Cargos Rebaixamento")
        .setStyle(ButtonStyle.Secondary), new ButtonBuilder()
        .setCustomId("config/update/gerencia")
        .setLabel("Cargos Gerência")
        .setStyle(ButtonStyle.Secondary)), createRow(new ButtonBuilder()
        .setCustomId("config/menu/voltar")
        .setLabel("Voltar")
        .setEmoji({ id: "1504675345687773244", name: "chevron_left" })
        .setStyle(ButtonStyle.Secondary), new ButtonBuilder()
        .setCustomId("config/update/resetar")
        .setLabel("Resetar")
        .setEmoji("🔄")
        .setStyle(ButtonStyle.Secondary)));
}
export function montarContainerPunicoesConfig(config) {
    const statusLines = [
        `**📋 Canais**`,
        `📝 Log: ${config.logChannelId ? `<#${config.logChannelId}>` : "*Não configurado*"}`,
        ``,
        `**🎭 Cargos de Advertência**`,
        `1ª: ${config.advertencia1 ? `<@&${config.advertencia1}>` : "*Não configurado*"}`,
        `2ª: ${config.advertencia2 ? `<@&${config.advertencia2}>` : "*Não configurado*"}`,
        `3ª: ${config.advertencia3 ? `<@&${config.advertencia3}>` : "*Não configurado*"}`,
        ``,
        `**⚙️ Limites**`,
        `Max advertências antes de ban: **${config.maxWarnsBeforeBan}**`,
    ].join("\n");
    return createContainer("#FFFFFF", "**⛔ Configuração de Punições**", Separator.Default, statusLines, Separator.Default, createRow(new ButtonBuilder()
        .setCustomId("config/punicoes/canais")
        .setLabel("Canais")
        .setStyle(ButtonStyle.Secondary), new ButtonBuilder()
        .setCustomId("config/punicoes/cargos")
        .setLabel("Cargos")
        .setStyle(ButtonStyle.Secondary), new ButtonBuilder()
        .setCustomId("config/punicoes/limites")
        .setLabel("Limites")
        .setStyle(ButtonStyle.Secondary), new ButtonBuilder()
        .setCustomId("config/menu/voltar")
        .setLabel("Voltar")
        .setEmoji({ id: "1504675345687773244", name: "chevron_left" })
        .setStyle(ButtonStyle.Secondary)));
}
export function montarContainerVendasConfig(config, selectedProduto) {
    const produtosList = config.produtos.length > 0
        ? config.produtos.map(p => `• **${p.nome}** — 🤝 R$ ${p.valorParceria.toLocaleString("pt-BR")} / 🏪 R$ ${p.valorPista.toLocaleString("pt-BR")} — ${p.porcentagemPainel}%`).join("\n")
        : "*Nenhum produto cadastrado*";
    const statusLines = [
        `**💵 Configuração de Vendas**`,
        ``,
        `📢 Canal de Logs: ${config.logChannelId ? `<#${config.logChannelId}>` : "*Não configurado*"}`,
        ``,
        `**📦 Produtos (${config.produtos.length})**`,
        produtosList,
    ].join("\n");
    const components = [
        statusLines,
        Separator.Default,
    ];
    if (config.produtos.length > 0) {
        components.push("**Selecione um produto para editar/excluir:**", createRow(new StringSelectMenuBuilder()
            .setCustomId("config/vendas/selecionar")
            .setPlaceholder("Selecione um produto...")
            .addOptions(config.produtos.map(p => ({
            label: p.nome,
            description: `🤝 R$ ${p.valorParceria.toLocaleString("pt-BR")} | 🏪 R$ ${p.valorPista.toLocaleString("pt-BR")} | ${p.porcentagemPainel}%`,
            value: p.id,
        })))), Separator.Default);
    }
    if (selectedProduto) {
        components.push(`**Produto selecionado:** ${selectedProduto.nome}\n🤝 Parceria: R$ ${selectedProduto.valorParceria.toLocaleString("pt-BR")}\n🏪 Pista: R$ ${selectedProduto.valorPista.toLocaleString("pt-BR")}\n📊 Painel: ${selectedProduto.porcentagemPainel}%`, Separator.Default, createRow(new ButtonBuilder()
            .setCustomId("config/vendas/editar")
            .setLabel("Editar")
            .setStyle(ButtonStyle.Secondary), new ButtonBuilder()
            .setCustomId("config/vendas/excluir")
            .setLabel("Excluir")
            .setStyle(ButtonStyle.Secondary)), Separator.Default);
    }
    components.push(createRow(new ButtonBuilder()
        .setCustomId("config/vendas/canal")
        .setLabel("Canal de Logs")
        .setStyle(ButtonStyle.Secondary), new ButtonBuilder()
        .setCustomId("config/vendas/adicionar")
        .setLabel("Adicionar Produto")
        .setStyle(ButtonStyle.Secondary)), createRow(new ButtonBuilder()
        .setCustomId("config/menu/voltar")
        .setLabel("Voltar")
        .setEmoji({ id: "1504675345687773244", name: "chevron_left" })
        .setStyle(ButtonStyle.Secondary)));
    return createContainer("#FFFFFF", ...components);
}
export function montarContainerStatusConfig(config) {
    return createContainer("#FFFFFF", "**📡 Configuração de Status**", Separator.Default, `🟢 Online: ${config.roleOnline ? `<@&${config.roleOnline}>` : "*Não configurado*"}`, `🔄 Atualizando: ${config.roleAtualizando ? `<@&${config.roleAtualizando}>` : "*Não configurado*"}`, `⚫ Offline: ${config.roleOffline ? `<@&${config.roleOffline}>` : "*Não configurado*"}`, `⚠️ Instável: ${config.roleInstavel ? `<@&${config.roleInstavel}>` : "*Não configurado*"}`, Separator.Default, "**Selecione o cargo para cada status:**", Separator.Default, createRow(new RoleSelectMenuBuilder()
        .setCustomId("config/status/role/online")
        .setPlaceholder("🟢 Online")
        .setMaxValues(1)), createRow(new RoleSelectMenuBuilder()
        .setCustomId("config/status/role/atualizando")
        .setPlaceholder("🔄 Atualizando")
        .setMaxValues(1)), createRow(new RoleSelectMenuBuilder()
        .setCustomId("config/status/role/offline")
        .setPlaceholder("⚫ Offline")
        .setMaxValues(1)), createRow(new RoleSelectMenuBuilder()
        .setCustomId("config/status/role/instavel")
        .setPlaceholder("⚠️ Instável")
        .setMaxValues(1)), Separator.Default, createRow(new ButtonBuilder()
        .setCustomId("config/menu/voltar")
        .setLabel("Voltar")
        .setEmoji({ id: "1504675345687773244", name: "chevron_left" })
        .setStyle(ButtonStyle.Secondary)));
}
export function montarContainerReporteConfig(config) {
    return createContainer("#FFFFFF", "**🐛 Configuração de Reporte**", Separator.Default, `**Categoria de Tickets:** ${config.categoriaId ? `<#${config.categoriaId}>` : "*Não configurada*"}`, Separator.Default, createRow(new ChannelSelectMenuBuilder()
        .setCustomId("config/reporte/categoria")
        .setPlaceholder("Selecione a categoria")
        .setChannelTypes(ChannelType.GuildCategory)
        .setMaxValues(1)), Separator.Default, createRow(new ButtonBuilder()
        .setCustomId("config/menu/voltar")
        .setLabel("Voltar")
        .setEmoji({ id: "1504675345687773244", name: "chevron_left" })
        .setStyle(ButtonStyle.Secondary)));
}
export function montarContainerFarmConfig(config, selectedProduto) {
    const cargos = config.cargos || { cargoMetaConcluida: null, cargoMetaIncompleta: null, cargoNenhumaEntrega: null };
    const produtos = config.produtos ?? [];
    const produtosList = produtos.length > 0
        ? produtos.map(p => `• **${p.nome}** — Meta: ${p.meta}`).join("\n")
        : "*Nenhum produto cadastrado*";
    const statusLines = [
        `**🌾 Configuração de Farm**`,
        ``,
        `📢 Canal de Logs: ${config.logChannelId ? `<#${config.logChannelId}>` : "*Não configurado*"}`,
        `📁 Categoria das Salas: ${config.categoriaId ? `<#${config.categoriaId}>` : "*Não configurada*"}`,
        `🖼️ Imagem: ${config.imagemUrl ? "✅ Configurada" : "*Não configurada*"}`,
        ``,
        `**🎭 Cargos:**`,
        `✅ Meta Concluída: ${cargos.cargoMetaConcluida ? `<@&${cargos.cargoMetaConcluida}>` : "*Não configurado*"}`,
        `❌ Meta Incompleta: ${cargos.cargoMetaIncompleta ? `<@&${cargos.cargoMetaIncompleta}>` : "*Não configurado*"}`,
        `🚫 Nenhuma Entrega: ${cargos.cargoNenhumaEntrega ? `<@&${cargos.cargoNenhumaEntrega}>` : "*Não configurado*"}`,
        ``,
        `**📦 Produtos (${produtos.length})**`,
        produtosList,
    ].join("\n");
    const components = [
        statusLines,
        Separator.Default,
    ];
    if (produtos.length > 0) {
        components.push("**Selecione um produto para editar/excluir:**", createRow(new StringSelectMenuBuilder()
            .setCustomId("config/farm/selecionar")
            .setPlaceholder("Selecione um produto...")
            .addOptions(produtos.map(p => ({
            label: p.nome,
            description: `Meta: ${p.meta}`,
            value: p.id,
        })))), Separator.Default);
    }
    if (selectedProduto) {
        components.push(`**Produto selecionado:** ${selectedProduto.nome}\n🎯 Meta: ${selectedProduto.meta}`, Separator.Default, createRow(new ButtonBuilder()
            .setCustomId("config/farm/editar")
            .setLabel("Editar")
            .setStyle(ButtonStyle.Secondary), new ButtonBuilder()
            .setCustomId("config/farm/excluir")
            .setLabel("Excluir")
            .setStyle(ButtonStyle.Secondary)), Separator.Default);
    }
    components.push(createRow(new ButtonBuilder()
        .setCustomId("config/farm/canal")
        .setLabel("Canal de Logs")
        .setStyle(ButtonStyle.Secondary), new ButtonBuilder()
        .setCustomId("config/farm/categoria")
        .setLabel("Categoria")
        .setStyle(ButtonStyle.Secondary), new ButtonBuilder()
        .setCustomId("config/farm/cargos")
        .setLabel("Cargos")
        .setStyle(ButtonStyle.Secondary), new ButtonBuilder()
        .setCustomId("config/farm/imagem")
        .setLabel("Imagem")
        .setStyle(ButtonStyle.Secondary), new ButtonBuilder()
        .setCustomId("config/farm/cadastrar")
        .setLabel("Cadastrar Produtos")
        .setStyle(ButtonStyle.Secondary)), createRow(new ButtonBuilder()
        .setCustomId("config/menu/voltar")
        .setLabel("Voltar")
        .setEmoji({ id: "1504675345687773244", name: "chevron_left" })
        .setStyle(ButtonStyle.Secondary)));
    return createContainer("#FFFFFF", ...components);
}
export function montarContainerAusenciaConfig(config) {
    return createContainer("#FFFFFF", "**📅 Configuração de Ausência**", Separator.Default, `📢 Canal de Logs: ${config.logChannelId ? `<#${config.logChannelId}>` : "*Não configurado*"}`, `📝 Título do Painel: ${config.panelTitle}`, `📄 Descrição: ${config.panelDesc.length > 100 ? config.panelDesc.slice(0, 100) + "..." : config.panelDesc}`, Separator.Default, "**Selecione o canal de logs:**", createRow(new ChannelSelectMenuBuilder()
        .setCustomId("config/ausencia/logs")
        .setPlaceholder("Selecione o canal de logs")
        .setChannelTypes(ChannelType.GuildText)
        .setMaxValues(1)), Separator.Default, createRow(new ButtonBuilder()
        .setCustomId("config/ausencia/painel-setup")
        .setLabel("Configurar Painel")
        .setStyle(ButtonStyle.Secondary), new ButtonBuilder()
        .setCustomId("config/ausencia/enviar-painel")
        .setLabel("Enviar Painel")
        .setStyle(ButtonStyle.Secondary)), createRow(new ButtonBuilder()
        .setCustomId("config/menu/voltar")
        .setLabel("Voltar")
        .setEmoji({ id: "1504675345687773244", name: "chevron_left" })
        .setStyle(ButtonStyle.Secondary)));
}
