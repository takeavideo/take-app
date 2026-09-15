# Configuração Supabase do TAKE

## Variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto com:

```bash
EXPO_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sua-chave-publicavel
```

Use apenas a chave publicável no aplicativo. Nunca coloque `service_role` no app mobile.

## Banco de dados

No painel do Supabase, abra SQL Editor e execute:

```text
supabase/schema.sql
```

Esse script cria as tabelas iniciais, enums, bucket `portfolio`, triggers de `updated_at` e políticas de Row Level Security.

## Autenticação

Em Authentication, mantenha Email/Password habilitado. A arquitetura já separa o serviço de autenticação para adicionar futuramente Google, Apple e telefone sem reescrever as telas principais.

## Storage

O bucket público `portfolio` é criado pelo SQL. Arquivos são organizados por pasta com o `user_id`, e as policies permitem que cada usuário gerencie apenas seus próprios uploads.
