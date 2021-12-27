import {Bot, BotError, Context, NextFunction, session, SessionFlavor, webhookCallback} from "https://deno.land/x/grammy/mod.ts";
import { escapeHtml } from "https://deno.land/x/escape/mod.ts";
import { Application } from "https://deno.land/x/oak/mod.ts";
import { bold, yellow } from "https://deno.land/std@0.118.0/fmt/colors.ts";

const app = new Application(); // or whatever you're using

// Make sure to specify the framework you use.
interface SessionData {
  pizzaCount: number;
}


type MyContext = Context & SessionFlavor<SessionData>

const bot = new Bot<MyContext>(Deno.env.get("TOKEN") || ""); // <-- place your token inside this string

function initial(): SessionData {
  return { pizzaCount: 0 };
}
bot.use(session({ initial }));
bot.command("pizza", async (ctx) => {
  await ctx.reply(ctx.session.pizzaCount.toString());
});

bot.command("addPizza", async (ctx) => {
  ctx.session.pizzaCount += 1;
  await ctx.reply(ctx.session.pizzaCount.toString());
});

bot.command("removePizza", async (ctx) => {
  ctx.session.pizzaCount -= 1;
  await ctx.reply(ctx.session.pizzaCount.toString());
});

bot.on("msg", async (ctx) => {
  const raw_text = escapeHtml(JSON.stringify(ctx.update, null, 3) );
  if (ctx.message?.forward_from) {
    await ctx.reply(
      "<b>Telegram ID's:</b>\nForwarded User ID: <code>" +
        ctx.message.forward_from.id +
        "</code>\nOwn User ID:\n<code>" +
        ctx.from.id +
        "</code>\n\n" +
        "<b>Raw Update Data:</b>\n<code>" +
        raw_text + "</code>",
      { parse_mode: "HTML" }
    );
  } else {
    await ctx.reply(
      "<b>Own User ID:</b> <code>" +
        ctx.from?.id +
        "</code>\n\n" +
        "<b>Raw Update Data:</b>\n<code>" +
        raw_text+ "</code>",
      { parse_mode: "HTML" }
    );
  }
});
app.use(webhookCallback(bot, "oak"));
bot.catch(errorHandler);

function errorHandler(err: BotError) {
  console.error((err));
}
app.addEventListener("listen", ({ hostname, port, serverType }) => {
  console.log(
    bold("Start listening on ") + yellow(`${hostname}:${port}`),
  );
  console.log(bold("  using HTTP server: " + yellow(serverType)));
});

await app.listen({ hostname: "grammy-raw-bot.deno.dev", port: 8000 });
console.log(bold("Finished."));
await app.listen({ port: 8080 });