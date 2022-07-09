# Raffle with Hardhat

Based on [PatrickAlphaC/hardhat-smartcontract-lottery-fcc](https://github.com/PatrickAlphaC/hardhat-smartcontract-lottery-fcc).

## Instructions

Set up envs:

```sh
mv .env.example .env
```

Compile:

```sh
yarn hardhat compile
```

Deploy:

```
yarn hardhat deploy --network <network>
```

Run a script:

```sh
yarn hardhat run <script.ts> --network <network>
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
yarn hardhat coverage
```

Debug TypeScript with VSCode