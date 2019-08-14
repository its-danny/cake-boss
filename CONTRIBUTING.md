# Contributing to Cake Boss

Always down for input from anyone using Cake Boss. Bonus points for:

- Reporting a bug
- Submitting a fix
- Proposing new features
- General code review

Since this is was originally built for a specific server with a specific need, I'm down to hear any ideas you might have to extend this to a more general-purpose reward system.

If you plan on making a new feature yourself, hope in the [Discord](https://discord.gg/2AG9fKt) first and let's discuss it there.

## Bug Reporting

Report issues through [GitHub Issues](https://github.com/dannytatom/cake-boss/issues). Try to include all of the following and try to be specific:

- A quick summary of what went wrong
- Steps to reproduce
- What you expected to happen
- What actually happened

## Git Flow

It's a [quick read](https://guides.github.com/introduction/flow/index.html) and will help keep your PRs tidy. The gist of it is:

- Fork the repo
- Create a feature branch off `master`
- Write your code, add tests if it makes sense
- Make sure tests pass (`npm test`)
- Run linter & prettier (`npm run lint` & `npm run pretty`)
- Open a pull request

## Consistent Coding Style

Just let `npm run lint` & `npm run pretty` do all the work.

## License

As with the rest of the project, any of your code that gets merged in will be under the same [MIT license](https://github.com/dannytatom/cake-boss/blob/master/LICENSE).
