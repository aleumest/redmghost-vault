# Mod per Claude Code

Due mod ispirate al video "3 ways to use Claude Code Mods".

| Mod | Cosa fa | Comando |
| --- | --- | --- |
| `agent-dashboard` | Pannello live con i tuoi agenti (in corso / finiti) e un contatore nella status line | `/dashboard` |
| `model-router` | Manda le richieste semplici (refusi, rinomina file, formattazione) a Haiku e lascia il resto sul modello principale, per risparmiare i limiti | `/router on`, `/router off`, `/router` |

## Installazione

Da una sessione di Claude Code nel terminale:

```
/plugin install agent-dashboard --marketplace aleumest/redmghost-vault
/plugin install model-router --marketplace aleumest/redmghost-vault
```

Rispondi `y` per aggiungere il marketplace, poi scegli lo scope "user": così la mod è attiva in tutte le tue sessioni.

## Note sul router

- Solo il loop principale viene instradato; i subagenti tengono il loro modello.
- Il criterio è volutamente prudente: prompt brevi (max 300 caratteri) con parole come "typo", "rename", "format", "refuso", "rinomina", e nessuna parola da lavoro pesante ("plan", "debug", "refactor", "perché"...). Nel dubbio resta sul modello principale.
- Cambiare modello a metà conversazione fa rileggere il contesto senza cache al modello piccolo: il risparmio è reale nelle conversazioni corte, minore in quelle molto lunghe.
- Le regole sono in `model-router/hooks/router.ts`: modificale per adattarle a te.

## Sviluppo

```
claude plugin validate mods/<mod>
claude plugin test mods/<mod>
```
