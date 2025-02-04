import {
  ChatInputCommandInteraction,
  AutocompleteInteraction,
  SlashCommandBuilder,
  MessageFlags,
} from "discord.js";

import {
  INVALID_PROTOCOL_ERROR,
  invalidEVMAddressError,
  INVALID_ADDRESS_ERROR,
  invalidProtocolError,
  displayAddress,
} from "../utils/display.ts";
import { runAdapter } from "points-adapters/utils/adapter.ts";
import { isValidEVMAddress } from "../utils/validate.ts";
import { createPaginatedMessage } from "../utils/table.ts";
import adapters from "../utils/adapters.ts";

export default {
  cooldown: 60 * 2, // 1 command per 2 mins
  data: new SlashCommandBuilder()
    .setName("points")
    .setDescription("Get points for a specific protocol")
    .addStringOption((option) =>
      option
        .setName("protocol")
        .setDescription("Protocol name")
        .setRequired(true)
        .setAutocomplete(true)
    )
    .addStringOption((option) =>
      option
        .setName("address")
        .setDescription("EVM address to check")
        .setRequired(true)
    ),

  async autocomplete(ctx: AutocompleteInteraction) {
    const focusedValue = ctx.options.getFocused();
    const filtered = Object.keys(adapters).filter((choice) =>
      choice.toLowerCase().startsWith(focusedValue.toLowerCase())
    );

    await ctx.respond(
      filtered.slice(0, 25).map((choice) => ({ name: choice, value: choice }))
    );
  },

  async execute(ctx: ChatInputCommandInteraction) {
    await ctx.deferReply({ flags: MessageFlags.Ephemeral });

    const protocol = ctx.options.getString("protocol")?.toLowerCase();
    const address = ctx.options.getString("address");

    if (!protocol) return await ctx.editReply(INVALID_PROTOCOL_ERROR);
    if (!address) return await ctx.editReply(INVALID_ADDRESS_ERROR);
    if (!isValidEVMAddress(address))
      return await ctx.editReply(invalidEVMAddressError(address));

    try {
      if (!Object.keys(adapters).includes(protocol))
        return await ctx.editReply(invalidProtocolError(protocol));

      await ctx.editReply("Running adapter..");
      const res = await runAdapter(adapters[protocol], address);

      await createPaginatedMessage(
        ctx,
        res.points,
        `${protocol} points for ${displayAddress(address)}`
      );
    } catch (err) {
      await ctx.editReply(
        `An error occurred while fetching points for ${protocol}.`
      );
      console.error(err);
    }
  },
};
