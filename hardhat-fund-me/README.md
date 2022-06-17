# FundMe with Hardhat

Based on [PatrickAlphaC/hardhat-fund-me-fcc](https://github.com/PatrickAlphaC/hardhat-fund-me-fcc).

## Instructions

Set up envs:

```sh
mv .env.example .env
```

Compile:

```sh
yarn compile
```

Deploy:

```
yarn hardhat deploy --network <network>
```

Run a script:

```sh
yarn hardhat run <script.ts> --network <network>
```

Run a task:

```sh
yarn hardhat <task>
```

Run tests:

```sh
yarn hardhat test --network <network>
```

Start the Harhat node:

```sh
yarn hardhat node
```

Start the Hardhat console:

```sh
yarn hardhat console
```

Print coverage:

```sh
yarn coverage
```

Verify a contract:

```sh
yarn hardhat --network <network> <address>
```

Debug TypeScript with VSCode