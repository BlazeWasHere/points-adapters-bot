import {
  ChatInputCommandInteraction,
  StringSelectMenuBuilder,
  SlashCommandBuilder,
  ActionRowBuilder,
  MessageFlags,
} from "discord.js";

import {
  invalidEVMAddressError,
  INVALID_ADDRESS_ERROR,
  displayAddress,
} from "../utils/display.ts";
import {
  createTableComponents,
  BACK_KEY,
  PREV_KEY,
  NEXT_KEY,
} from "../utils/table.ts";
import { runAdapter } from "points-adapters/utils/adapter.ts";
import { isValidEVMAddress } from "../utils/validate.ts";
import adapters from "../utils/adapters.ts";

const PROTOCOL_SELECT_KEY = "ProtocolSelect";

export default {
  cooldown: 60 * 60, // 1 command per hour
  data: new SlashCommandBuilder()
    .setName("totals")
    .setDescription("Get total points across all protocols")
    .addStringOption((option) =>
      option
        .setName("address")
        .setDescription("EVM address to check")
        .setRequired(true)
    ),

  async execute(ctx: ChatInputCommandInteraction) {
    await ctx.deferReply({ flags: MessageFlags.Ephemeral });

    const address = ctx.options.getString("address");

    if (!address) return await ctx.editReply(INVALID_ADDRESS_ERROR);
    if (!isValidEVMAddress(address))
      return await ctx.editReply(invalidEVMAddressError(address));

    await ctx.editReply("Running adapters..");

    try {
      const results = await Promise.allSettled(
        Object.entries(adapters).map(async ([name, adapter]) => {
          try {
            const res = await runAdapter(adapter, address);
            return { name, total: res.total };
          } catch (err) {
            console.error(`Error running ${name} adapter: ${err}`);
            return { name, total: "error" };
          }
        })
      );

      const successResults = results.filter((x) => x.status === "fulfilled");

      const normalTotals: Record<string, number | string> = {};
      const breakdownTotals: Record<
        string,
        Record<string, string | number>
      > = {};

      successResults.forEach((result) => {
        const { name, total } = result.value;

        if (typeof total === "object") {
          breakdownTotals[name] = total;
          normalTotals[name] = Object.values(total)[0];
        } else {
          normalTotals[name] = total;
        }
      });

      const tableComponents = createTableComponents(
        normalTotals,
        `Protocol Points for ${address.slice(0, 6)}...${address.slice(-4)}`,
        0
      );

      let protocolSelectRow: ActionRowBuilder<StringSelectMenuBuilder> | null =
        null;
      if (Object.keys(breakdownTotals).length > 0) {
        const protocolSelect = new StringSelectMenuBuilder()
          .setCustomId(PROTOCOL_SELECT_KEY)
          .setPlaceholder("Select protocol to view detailed totals")
          .addOptions(
            Object.keys(breakdownTotals).map((name) => ({
              label: name,
              value: name,
            }))
          );

        protocolSelectRow =
          new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
            protocolSelect
          );
      }

      const message = await ctx.editReply({
        embeds: tableComponents.embeds,
        components: protocolSelectRow
          ? [...tableComponents.components, protocolSelectRow]
          : tableComponents.components,
      });

      const collector = message.createMessageComponentCollector({
        time: 60 * 5 * 1000, // 5min
      });

      // Listeners
      let currentPage = 0;
      let currentView: "main" | "protocol" = "main";
      let currentTotals = normalTotals;
      let currentTitle = `Protocol Points for ${displayAddress(address)}`;

      collector.on("collect", async (interaction) => {
        await interaction.deferUpdate();

        if (interaction.isStringSelectMenu()) {
          const selectedProtocol = interaction.values[0];
          currentTotals = breakdownTotals[selectedProtocol];
          currentTitle = `${selectedProtocol} aggregate points for ${displayAddress(
            address
          )}`;
          currentView = "protocol";

          const view = createTableComponents(
            currentTotals,
            currentTitle,
            0,
            true
          );

          await interaction.editReply({
            embeds: view.embeds,
            components: protocolSelectRow
              ? [...view.components, protocolSelectRow]
              : view.components,
          });
        } else if (interaction.isButton()) {
          if (interaction.customId === PREV_KEY) {
            currentPage--;
          } else if (interaction.customId === NEXT_KEY) {
            currentPage++;
          } else if (
            interaction.customId === BACK_KEY &&
            currentView === "protocol"
          ) {
            currentView = "main";
            currentTotals = normalTotals;
            currentTitle = `Protocol Points for ${displayAddress(address)}`;
            currentPage = 0;
          }

          const newComponents = createTableComponents(
            currentTotals,
            currentTitle,
            currentPage
          );

          await interaction.editReply({
            embeds: newComponents.embeds,
            components: protocolSelectRow
              ? [...newComponents.components, protocolSelectRow]
              : newComponents.components,
          });
        }
      });

      collector.on("end", async () => {
        await ctx.editReply({ components: [] });
      });
    } catch (error) {
      console.error("Error in totals command:", error);
      await ctx.editReply("An error occurred while fetching totals.");
    }
  },
};
