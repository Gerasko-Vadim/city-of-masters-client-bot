// src/bot.ts
import { Telegraf, Markup } from "telegraf";
import { registerClient } from "./api";

export const bot = new Telegraf(process.env.BOT_TOKEN!);

bot.telegram.setMyCommands([
  { command: "start", description: "Запустить бота 🚀" },
]);

bot.start(async (ctx) => {
  if (!ctx.from) return;

  await registerClient({
    telegramId: ctx.from.id,
    name: ctx.from.first_name,
    username: ctx.from.username,
  });

  const welcomeMessage = `
👋 <b>Добро пожаловать в Город Мастеров!</b>

Здесь вы можете быстро найти мастера для любых задач: от сантехники до ремонта электроники.

👇 <i>Чтобы создать новый заказ, нажмите кнопку ниже:</i>`;

  await ctx.replyWithHTML(
    welcomeMessage,
    Markup.inlineKeyboard([
      [Markup.button.webApp("🚀 Открыть приложение", process.env.CLIENT_MINI_APP_URL || "")]
    ])
  );

  // Also send a message with a reply keyboard for persistent access
  await ctx.reply("Воспользуйтесь кнопкой ниже для быстрого доступа:", 
    Markup.keyboard([
      [Markup.button.webApp("🛠 Создать заказ", process.env.CLIENT_MINI_APP_URL || "")]
    ]).resize()
  );

  // Set the menu button for the user
  try {
    await ctx.setChatMenuButton({
      type: 'web_app',
      text: 'Открыть App',
      web_app: { url: process.env.CLIENT_MINI_APP_URL || "" }
    });
  } catch (error) {
    console.error('Failed to set chat menu button:', error);
  }
});
