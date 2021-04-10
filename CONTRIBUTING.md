# Contributing

Thanks for being willing to contribute!

## Ways you can help

### Contributing code

Pull requests are encouraged! If you have a fix or a new linting rule to contribute:

1. [Fork](https://docs.github.com/en/github/getting-started-with-github/fork-a-repo) and [clone](https://docs.github.com/en/github/creating-cloning-and-archiving-repositories/cloning-a-repository) the [repository](https://github.com/rlaffers/eslint-plugin-xstate)
2. Run `npm install` to install dependencies.
3. Create a branch for your PR with `git checkout -b pr/your-branch-name`.
   > Tip: Keep your `master` branch pointing at the original repository and make
   > pull requests from branches on your fork. To do this, run:
   >
   > ```
   > git remote add upstream https://github.com/rlaffers/eslint-plugin-xstate
   > git fetch upstream
   > git branch --set-upstream-to=upstream/master master
   > ```
   >
   > This will add the original repository as a "remote" called "upstream," Then
   > fetch the git information from that remote, then set your local `master`
   > branch to use the upstream master branch whenever you run `git pull`. Then you
   > can make all of your pull request branches based on this `master` branch.
   > Whenever you want to update your version of `master`, do a regular `git pull`.
4. Make your changes. Ensure that your code is formatted by [Prettier](https://prettier.io) and passes [ESLint](https://eslint.org) checks.
5. Run `npm test`.
6. Push you branch and open a PR. :tada:

### Suggesting improvements

Before suggesting a new linting rule, [search the open issues](https://github.com/rlaffers/eslint-plugin-xstate/issues). If you don't see it, feel free to open a new issue. Please provide a code snippet documenting a problematic usage of XState.

### Giving feedback on issues

We're always looking for more opinions on discussions in the issue tracker. Either contribute clarification/justification for an issue or simply add a :thumbsup: or :heart: to the top post.

### Spreading the word

Feel free to star the repository. Increasing the visibility of the project will help attracting more contributors to eslint-plugin-xstate.

## Coding guidelines

### Prettier

We use [Prettier](https://prettier.io/) to format the source code. You can either [integrate Prettier into your editor](integrate Prettier into your editor), or run it from the command line:

```
npm run format
```

### ESLint

We use [ESLint](https://eslint.org/) to enforce good and consistent coding style. For convenience, [integrate ESLint into your editor](https://eslint.org/docs/user-guide/integrations) or check your code with:

```
npm run lint
```

### Tests

When adding or changing linting rules [please write unit tests](tests/lib/rules/). Execute all tests before comitting:

```
npm test
```
