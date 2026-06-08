import { Client, GatewayIntentBits } from "discord.js";
import { createContainer, Separator } from "@magicyan/discord";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envContent = readFileSync(resolve(__dirname, ".env"), "utf-8");
const token = envContent.match(/^BOT_TOKEN=(.+)$/m)?.[1];
if (!token) { console.error("Token not found"); process.exit(1); }

const CHANNEL_ID = "1503221936090779708";

const content = [
    "**📋 CHANGELOG — ATUALIZAÇÃO**",
    "",
    "**1. Sincronizado /upar com painel Update**",
    "• Adicionados botões Cargos Promoção, Cargos Rebaixamento e Cargos Gerência no /config > Update",
    "• Cada um abre um RoleSelectMenu para configurar os cargos manualmente",
    "• Agora tudo que o /upar usa é configurável pelo painel",
    "",
    "**2. Config padrão agora vazia**",
    "• DEFAULT_UPDATE_CONFIG iniciado com arrays vazios e sem IDs",
    "• Usuário precisa configurar manualmente (não vem mais preenchido)",
    "",
    "**3. Botão Resetar**",
    "• Adicionado no painel Update (ao lado de Voltar)",
    "• Reseta todas as configurações de update para o padrão vazio",
    "",
    "**4. /upar reformulado**",
    "• Fluxo invertido: seleciona MEMBRO primeiro, depois o CARGO",
    "• Usa UserSelectMenu com avatar/foto de perfil do membro",
    "• Validação: rejeita bots e membros sem o cargo de filtro",
    "• Containers formatados com V2",
    "",
    "**5. Limpeza**",
    "• Counter e ping removidos (source + build)",
    "• Exibição segura de configurações vazias (mostra \"*Não configurado*\")",
    "",
    "**6. Correções**",
    "• Botão Resetar consertado (usava deferUpdate incorreto, agora usa update direto)",
    "• Cargo Geral agora opcional (só adiciona se configurado)",
    "• Canal de Destino agora opcional (só envia log se configurado)",
].join("\n");

const container = createContainer("#FFFFFF", content, Separator.Default);

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
await client.login(token);

const channel = await client.channels.fetch(CHANNEL_ID);
if (channel?.isTextBased()) {
    await channel.send({ components: [container], flags: ["IsComponentsV2"] });
    console.log("Changelog enviado!");
} else {
    console.error("Canal não encontrado ou não é texto");
}

await client.destroy();
