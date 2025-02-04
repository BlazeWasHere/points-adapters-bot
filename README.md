# Points Adapters Bot

A discord bot for fetching and aggregating points data from various DeFi protocols.

## Join the Discord

[![Discord Banner](https://discordapp.com/api/guilds/1335654843968262196/widget.png?style=banner2)]

## Available Commands

- `/points [protocol] [address]` - Get points breakdown for a specific protocol
- `/totals [address]` - Get total points across all protocols

## Getting Started

### Requirements

- [Deno](https://deno.land/)
- Discord bot token from [Discord Developer Portal](https://discord.com/developers/applications)

### Installation

1. Clone the repository:

```sh
git clone https://github.com/blazewashere/points-adapters-bot.git
```

2. Install dependencies:

```sh
deno install
```

3. Setup env variables

```sh
# Fill in `DISCORD_TOKEN` and `CLIENT_ID` .env
cp .env.example .env
```

4. Start

```sh
deno run --allow-net --allow-env --allow-read --env-file=.env main.ts
# or, simply
deno run -A --env-file=.env main.ts
```

## Why is protocol X not added yet?

Contribute to [points-adapters](https://github.com/BlazeWasHere/points-adapters).
