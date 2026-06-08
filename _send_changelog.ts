import { readFileSync, unlinkSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, ".env");
const envContent = readFileSync(envPath, "utf-8");
const match = envContent.match(/^DISCORD_TOKEN=(.+)$/m);
if (!match) { console.error("Token not found"); process.exit(1); }
const token = match[1];

const CHANNEL_ID = "1503221936090779708";

const changelog = [
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

const res = await fetch(`https://discord.com/api/v10/channels/${CHANNEL_ID}/messages`, {
    method: "POST",
    headers: {
        Authorization: `Bot ${token}`,
        "Content-Type": "application/json",
    },
    body: JSON.stringify({ content: changelog }),
});

const data = await res.json();
if (res.ok) {
    console.log("✅ Changelog enviado! ID:", data.id);
} else {
    console.error("❌ Erro:", data);
}

unlinkSync(resolve(__dirname, "_send_changelog.ts"));
