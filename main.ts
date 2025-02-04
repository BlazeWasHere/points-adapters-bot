import {
  ChatInputCommandInteraction,
  AutocompleteInteraction,
  SlashCommandBuilder,
  GatewayIntentBits,
  MessageFlags,
  Collection,
  Client,
  Events,
  Routes,
  REST,
} from "discord.js";

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const cooldowns = new Collection<string, Collection<string, number>>();
const commands = new Collection<
  string,
  {
    cooldown?: number;
    data: SlashCommandBuilder;
    execute: (ctx: ChatInputCommandInteraction) => Promise<void>;
    autocomplete: (ctx: AutocompleteInteraction) => Promise<void>;
  }
>();

for await (const x of Deno.readDir("./commands")) {
  if (x.isFile && x.name.endsWith(".ts")) {
    const command = await import(`./commands/${x.name}`);
    commands.set(command.default.data.name, command.default);
  }
}

const commandsData = Array.from(commands.values()).map((cmd) =>
  cmd.data.toJSON()
);
const rest = new REST({ version: "10" }).setToken(
  Deno.env.get("DISCORD_TOKEN")!
);

try {
  console.log("Started refreshing application (/) commands.");
  await rest.put(Routes.applicationCommands(Deno.env.get("CLIENT_ID")!), {
    body: commandsData,
  });
  console.log("Successfully reloaded application (/) commands.");
} catch (error) {
  console.error(error);
}

client.on(Events.InteractionCreate, async (ctx) => {
  const command = commands.get(
    (ctx as ChatInputCommandInteraction).commandName
  );
  if (!command) return;

  if (ctx.isAutocomplete()) {
    try {
      await command.autocomplete(ctx);
    } catch (error) {
      console.error(error);

      await ctx.respond([
        {
          name: "There was an error autocompleting",
          value: "Please try again",
        },
      ]);
    }
  } else if (ctx.isCommand()) {
    // Cooldown ref: https://github.com/discordjs/guide/blob/main/code-samples/additional-features/cooldowns/index.js

    if (!cooldowns.has(command.data.name)) {
      cooldowns.set(command.data.name, new Collection<string, number>());
    }

    const now = Date.now();
    // How can this be undefined? Please tell me TS.
    const timestamps = cooldowns.get(command.data.name) as Collection<
      string,
      number
    >;
    const defaultCooldownDuration = 3; // 3 seconds
    const cooldownAmount = (command.cooldown ?? defaultCooldownDuration) * 1000;

    if (timestamps.has(ctx.user.id)) {
      const userTimestamp = timestamps.get(ctx.user.id); // Get the timestamp
      if (userTimestamp !== undefined) {
        const expirationTime = userTimestamp + cooldownAmount;

        if (now < expirationTime) {
          const expiredTimestamp = Math.round(expirationTime / 1000);
          return ctx.reply({
            content:
              `Please wait, you are on a cooldown for \`${command.data.name}\`.` +
              `You can use it again <t:${expiredTimestamp}:R>.`,
            flags: MessageFlags.Ephemeral,
          });
        }
      }
    }

    timestamps.set(ctx.user.id, now);
    setTimeout(() => timestamps.delete(ctx.user.id), cooldownAmount);

    try {
      await command.execute(ctx as ChatInputCommandInteraction);
    } catch (error) {
      console.error(error);

      await ctx.followUp("There was an error executing this command");
    }
  }
});

client.on(Events.Error, (x) => {
  console.error(x);
});

client.once(Events.ClientReady, () => {
  console.log("Bot is ready!");
});

client.login(Deno.env.get("DISCORD_TOKEN"));
