# SimpleStorage with Hardhat

Based on [PatrickAlphaC/hardhat-simple-storage-fcc](https://github.com/PatrickAlphaC/hardhat-simple-storage-fcc).

## Instructions

Set up envs:

```sh
mv .env.example .env
```

Compile:

```sh
yarn hardhat compile
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
yarn hardhat test
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

Verify a contract:

```sh
yarn hardhat --network <network> <address>
```