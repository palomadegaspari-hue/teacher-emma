# Teacher Emma — English Studio 3.0

Aplicação privada para **apenas duas estudantes (Paloma e Valen)**, sem formulário de cadastro. Projeto Node.js + Express, pronto para armazenar em um repositório GitHub privado. Interface responsiva em português, atividades em inglês.

## Recursos implementados

- Login com **dois perfis fixos**, senha individual, cookie HttpOnly e sessão assinada com expiração de 7 dias; bloqueio de tentativas sucessivas.
- Histórico, lições, estatísticas, flashcards e configurações armazenados **por perfil** no backend (PostgreSQL recomendado ou diretório persistente).
- 11 simulações de conversação em inglês com API OpenAI. A Emma responde com correção gramatical em português, uma sugestão de frase e vocabulário.
- Microfone com Web Speech API quando disponível; resposta falada usando síntese de voz do navegador, em turnos (não é streaming simultâneo).
- Exercício separado de repetição de frases: grava até 12 segundos, envia o áudio temporariamente à API de transcrição e mede similaridade entre **palavras transcritas** e frase-alvo. **Não mede pronúncia fonética, acento, sotaque ou entonação**.
- 8 lições / 40 perguntas offline; flashcards, acompanhamento de atividades e exportação/importação de backup JSON.
- Perfil Valen: contexto de IA com temas adequados à idade e conversas sobre estudos, música, hobbies e viagens.

## Instalação local

Requisitos: **Node.js 22+** e conexão à internet para instalar dependências e usar a IA.

```bash
npm install
cp .env.example .env
# Preencha .env com DUAS senhas diferentes de 10+ caracteres,
# SESSION_SECRET de 32+ caracteres e OPENAI_API_KEY.
npm run check
npm test
npm start
```

No Windows, copie `.env.example` para `.env` manualmente. Abra `http://localhost:3000`.

Se as credenciais não forem configuradas o login permanece bloqueado, sem senhas de demonstração. `OPENAI_API_KEY` não é necessária para as lições offline, mas é necessária para conversa/áudio.

## Deploy GitHub + Render

1. Crie repositório privado `teacher-emma`; faça upload do **conteúdo** da pasta `teacher-emma`, não do ZIP inteiro.
2. Conecte o repositório ao Render (Web Service). `render.yaml` define o servidor.
3. Crie um banco de dados **PostgreSQL durável** (Render Postgres pago, Supabase ou equivalente) e configure `DATABASE_URL` em Environment. Configure também `OPENAI_API_KEY`, `PALOMA_PASSWORD`, `VALEN_PASSWORD`. `SESSION_SECRET` é gerado pelo Blueprint do Render, ou configure um segredo aleatório longo.
4. Deploy e abra a URL HTTPS do Render. Teste login dos dois perfis, gravação do histórico, logout e novo login.

**Não use armazenamento local efêmero em produção.** O servidor exige `DATABASE_URL` ou `DATA_DIR` configurado. O Render Free perde arquivos em reinicializações; para usar `DATA_DIR`, contrate Web Service com disco persistente montado no caminho definido, por exemplo `/var/data`. Dados só sincronizam entre dispositivos quando o backend usa armazenamento durável. Um banco Render Postgres gratuito pode expirar; confira sempre a política e custos do provedor.

O banco é criado automaticamente com tabela `emma_profiles`. As linhas são isoladas pelo identificador obtido do cookie de sessão, não por um ID fornecido pelo navegador. A comunicação usa HTTPS no deploy.

## Segurança e privacidade

- Não há registro de novos usuários; somente `paloma` e `valen` são perfis permitidos.
- Senhas só existem como variáveis de ambiente no servidor, não são incluídas no repositório. Para maior segurança de produção, um gerenciador de identidade externo com MFA pode substituir a autenticação simplificada.
- Cookies HttpOnly + Secure no ambiente de produção, SameSite=Strict; API de histórico e IA exige sessão autenticada.
- Não envie documentos sigilosos, dados financeiros reais, informações privadas de terceiros ou dados sensíveis no chat. As mensagens e gravações de pronúncia são processadas pela OpenAI API; gravações **não são salvas como arquivos** por este projeto.
- Para o perfil de menor, o responsável deve supervisionar o uso da IA e observar as regras dos fornecedores e a legislação aplicável.
- Faça backups periódicos por perfil, pois não foi implementada rotina automática de backup externo.
- Quando migrar da v2, o histórico anterior permanece apenas no navegador antigo; **não é transferido automaticamente** ao perfil de nenhuma estudante. É possível exportá-lo no app v2 e importá-lo manualmente após acessar o perfil correto na v3.

## Limitações técnicas e pendências de validação

- **Não é um serviço de conversação full-duplex em tempo real:** a conversa é por turnos. Web Speech API pode depender do navegador; preferir Chrome/Edge com HTTPS.
- **Feedback de pronúncia é uma aproximação por transcrição**, não avaliação acústica real. A qualidade depende da captação, do microfone e do modelo.
- Requer chave OpenAI com créditos ativos; preços dependem do modelo e uso de áudio. Coloque limite no painel de cobrança da API.
- Não foi feito teste real no Render, nem transcrição real sem credenciais fornecidas pelo proprietário.
- Salvar dados no backend usa sincronização assíncrona com atraso curto. Evite mudar de dispositivo no instante em que termina de digitar.

## Scripts

- `npm run check` — verifica sintaxe JavaScript
- `npm test` — executa testes de lições e autenticação
- `npm start` — executa o servidor

## Estrutura

`public/` interface e exercícios • `server.js` endpoints de IA/auth/progresso • `auth.js` sessão e validação • `store.js` persistência PostgreSQL/arquivo • `tests/` testes • `render.yaml` deploy.
