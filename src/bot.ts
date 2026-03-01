import { Telegraf, Markup } from "telegraf";
import { registerClient, sendChatMessage } from "./api";

export const bot = new Telegraf(process.env.BOT_TOKEN!);

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

// Photo handler
bot.on("photo", async (ctx) => {
  if (!ctx.from) return;
  try {
    const photo = ctx.message.photo[ctx.message.photo.length - 1];
    const fileLink = await ctx.telegram.getFileLink(photo.file_id);
    await sendChatMessage({
      telegramId: ctx.from.id,
      text: ctx.message.caption || "",
      imageUrl: fileLink.toString(),
    });
    await ctx.reply("✅ Фото получено и передано оператору.");
  } catch (error) {
    console.error("Failed to send photo message:", error);
    await ctx.reply("❌ Не удалось отправить фото. Попробуйте ещё раз.");
  }
});

// Text handler
bot.on("message", async (ctx) => {
  if (!ctx.from || !("text" in ctx.message)) return;
  try {
    await sendChatMessage({
      telegramId: ctx.from.id,
      text: ctx.message.text,
    });
    await ctx.reply("✅ Ваше сообщение передано оператору.");
  } catch (error) {
    console.error("Failed to send text message:", error);
    await ctx.reply("❌ Не удалось отправить сообщение. Попробуйте ещё раз.");
  }
});
