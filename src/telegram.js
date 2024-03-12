require("dotenv").config();

const { Telegraf } = require("telegraf");
const { exec } = require("child_process");
const campera = require("./camera");

// Token del bot Telegram fornito da BotFather
const token = process.env.TELEGRAM_TOKEN;
const chatEnabled = (process.env.TELEGRAM_CHATS || "").split(",");
const bot = new Telegraf(token);

let isStarted = false;

// Ascolta il comando /start dal bot Telegram
bot.start(async (ctx) => {
  try {
    await ctx.reply("😱");

    const { id } = await ctx.getChat();
    console.log(`new client ${id}`);
  } catch (e) {
    console.error(e);
  }
});

const isAuthorized = async (ctx, next) => {
  try {
    const { id } = await ctx.getChat();

    if (!chatEnabled.includes(String(id))) {
      await ctx.reply("not authorized");
    } else {
      next();
    }
  } catch (e) {
    console.error(e);
  }
};

// Ascolta i comandi
bot.use(isAuthorized);

bot.command("billy", async (ctx) => {
  // Invia la foto al chatId del mittente
  try {
    const source = await campera.picture();

    await ctx.replyWithPhoto({ source });
    await campera.delete(source);

    console.log("Picture required");
  } catch (e) {
    console.error(e);
  }
});

bot.command("motion_on", async (ctx) => {
  try {
    campera.start({
      onMovement: async (source) => {
        try {
          // Invia la foto alla chat abilitata
          await bot.telegram.sendPhoto(chatEnabled[0], { source });
          await campera.delete(source);

          console.log("Motion detected");
        } catch (e) {
          console.error(e);
        }
      },
    });

    await ctx.reply("Motion sensor ON");

    console.log("Motion sensor ON");
  } catch (e) {
    console.error(e);
  }
});

bot.command("motion_off", async (ctx) => {
  try {
    campera.stop();

    await ctx.reply("Motion sensor OFF");

    console.log("Motion sensor OFF");
  } catch (e) {
    console.error(e);
  }
});

bot.command("reboot", async (ctx) => {
  try {
    await ctx.reply("System reboot");

    setTimeout(() => exec("sudo reboot"), 3000);

    console.log("System reboot");
  } catch (e) {
    console.error(e);
  }
});

bot.command("poweroff", async (ctx) => {
  try {
    await ctx.reply("System power off");

    setTimeout(() => exec("sudo poweroff"), 3000);

    console.log("System poweroff");
  } catch (e) {
    console.error(e);
  }
});

module.exports = {
  start: () => {
    if (!isStarted) bot.launch();
    isStarted = true;
  },

  stop: campera.stop,
};
