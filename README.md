# 🍰 Cake Boss

> A Discord bot that lets users reward each other cakes for being helpful, and redeem those cakes for prizes.

![LGTM Grade](https://img.shields.io/lgtm/grade/javascript/github/dannytatom/cake-boss) ![GitHub Workflow Status](https://img.shields.io/github/workflow/status/dannytatom/cake-boss/ci) [![Discord Bots](https://discordbots.org/api/widget/status/611013950942871562.svg)](https://discordbots.org/bot/611013950942871562) [![Discord Bots](https://discordbots.org/api/widget/lib/611013950942871562.svg)](https://discordbots.org/bot/611013950942871562)

## Features

### Customizable out the wazoo

- Prefix, branding, log channel, usage, etc. Don't like cake? Give hot dogs! 🌭
- Role-based permissions for commands where it makes sense, blacklist for the rest.
- Full control over how many cakes people can give out, and how often.
- A quiet mode to make Cake Boss respond with reacts instead of messages whenever possible.

### Easy to use prizes

- Encourage helpfulness by creating prizes that can be redeemed with cake.
- Nothing more than a description and optional role.
- Can be redeemed through a reaction-based menu that's quick and easy to use.
- Any prize with a role attached will be given automatically, otherwise a redeem event will be logged to a log channel for mods to reward.

### Leaderboard

There's not a lot to say about this. Who doesn't want to shove their rank in everyone else's face?

## Get Started

Check the [docs](https://cake-boss.js.org/) for how to use it then [add Cake Boss](https://discordapp.com/oauth2/authorize?client_id=611013950942871562&scope=bot&permissions=335588416) to your Discord server.

If you have any questions, feel free to ask in the [Discord](https://discord.gg/2AG9fKt).

**Permissions Needed**: Manage Roles, Change Nickname, View Channels, Send Messages, Manage Messages, Attach Files, and Add Reactions.

## Running It Yourself

I'm too lazy to dive into this, but if you've used Node & PostgreSQL then it shouldn't take too much to get it going. Just copy `.env.sample` to `.env`, take a look at `package.json`, and go from there.

I also use this little shell script to keep it updated:

```zsh
# update-cake-boss.sh

cd cake-boss
git pull origin master
yarn install --production
yarn run typeorm migration:run
yarn build
yarn start
```

## Contributing

Contributions are welcome. Check the [guidelines](https://github.com/dannytatom/cake-boss/blob/master/CONTRIBUTING.md) and get at it!

---

If you dig the bot, feel free to upvote it on [Top.GG](https://top.gg/bot/611013950942871562).
