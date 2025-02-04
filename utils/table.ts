import {
  ChatInputCommandInteraction,
  ButtonInteraction,
  ActionRowBuilder,
  ButtonBuilder,
  ComponentType,
  EmbedBuilder,
  MessageFlags,
  ButtonStyle,
} from "discord.js";

import { sortDataEntries } from "./sort.ts";
import { getProtocolUrl } from "./protocols.ts";

const ITEMS_PER_PAGE = 10;
const PREV_KEY = "Previous";
const NEXT_KEY = "Next";
const BACK_KEY = "Back";

const createTableComponents = (
  data: Record<string, number | string>,
  title: string,
  page: number = 0,
  showBackButton: boolean = false
) => {
  const entries = sortDataEntries(data);
  const pages = Math.ceil(entries.length / ITEMS_PER_PAGE);

  const start = page * ITEMS_PER_PAGE;
  const end = start + ITEMS_PER_PAGE;
  const currentEntries = entries.slice(start, end);

  const embed = new EmbedBuilder()
    .setTitle(title)
    .setColor(0x0099ff)
    .setTimestamp()
    .setFooter({ text: `Page ${page + 1} of ${pages}` });

  currentEntries.forEach(([key, value]) => {
    const name = key;
    value = value.toString();

    const url = getProtocolUrl(key);
    if (url) value = `[${value}](${url})`;

    embed.addFields({ name, value });
  });

  const components: ActionRowBuilder<ButtonBuilder>[] = [];
  if (pages > 1 || showBackButton) {
    const row = new ActionRowBuilder<ButtonBuilder>();

    if (showBackButton) {
      row.addComponents(
        new ButtonBuilder()
          .setCustomId(BACK_KEY)
          .setLabel(BACK_KEY)
          .setStyle(ButtonStyle.Secondary)
      );
    }

    if (pages > 1) {
      row.addComponents(
        new ButtonBuilder()
          .setCustomId(PREV_KEY)
          .setLabel(PREV_KEY)
          .setStyle(ButtonStyle.Primary)
          .setDisabled(page === 0),
        new ButtonBuilder()
          .setCustomId(NEXT_KEY)
          .setLabel(NEXT_KEY)
          .setStyle(ButtonStyle.Primary)
          .setDisabled(page === pages - 1)
      );
    }

    components.push(row);
  }

  return {
    embeds: [embed],
    components,
    pages,
    currentPage: page,
  };
};

const createPaginatedMessage = async (
  ctx: ChatInputCommandInteraction,
  data: Record<string, number | string>,
  title: string
) => {
  const components = createTableComponents(data, title, 0);

  const message = await ctx.followUp({
    embeds: components.embeds,
    components: components.components,
    flags: MessageFlags.Ephemeral,
  });

  if (components.pages <= 1) return message;

  const collector =
    message.createMessageComponentCollector<ComponentType.Button>({
      filter: (x) => x.customId === NEXT_KEY || x.customId === PREV_KEY,
      time: 60 * 5 * 1000, // 5min
    });

  let currentPage = 0;
  collector.on("collect", async (interaction: ButtonInteraction) => {
    if (interaction.customId === PREV_KEY) {
      currentPage--;
    } else if (interaction.customId === NEXT_KEY) {
      currentPage++;
    }

    const newComponents = createTableComponents(data, title, currentPage);

    await interaction.update({
      embeds: newComponents.embeds,
      components: newComponents.components,
    });
  });

  collector.on("end", async () => {
    await ctx.editReply({ components: [] });
  });

  return message;
};

export {
  BACK_KEY,
  NEXT_KEY,
  PREV_KEY,
  createTableComponents,
  createPaginatedMessage,
};
