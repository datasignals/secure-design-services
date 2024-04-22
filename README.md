# Secure Design Services

Applications and contracts that support secure design services tooling with provenance tracking. For more information, please also visit our [website](https://www.lockular.com/).

## Components

The components in detail are:

### Contract Management System (CMS):

Our revolutionary Contract Management System (CMS) built on Substrate smart contracts empowers designers to manage agreements with unparalleled security and efficiency.

### Secure Working Platform:

A VS Code-based design workspace, secure and collaborative, accessible from anywhere on the planet (and beyond).

### NFT Marketplace:

An online platform where creators showcase their designs as digital assets, providing them with ownership and credibility.

## Building

All components are deployed as Docker images and may be built with Docker. See `Building.md` for more information. We offer prebuilt images ready to use.

## Blockchain

It is a distributed database meaning that the storage devices used for the database are not all connected to a common processor. It maintains a growing decentralized digital list of ordered records, called blocks. Each block has a timestamp and a link to a previous block. By the system being decentralization it allows for complete transparency in all shared information. Contracts are built and deployed on Polkadot blockchain. To know more about this blockchain, visit [Polkadot](https://polkadot.network/).

## Installation

Requires node version 18.18.2 (lts/hydrogen).
Requires other installation and set-ups as listed below:
 - MongoDB
 - KeyCloak
 - JFrog Artifactory
 - Contract Deployment
 - Few Blockchain Accounts with Faucet
 - Kafka (optional if wants to run kafka-listener for provenance)

On set up fill in the config in below files
 - backend/config/config.json
 - frontend/src/config.json
 - helm/secrets/config.json | docker.json | frontendconfig.json | keycloak.json
 - Kafka-listener/config/config.json


### Quickstart

- Run `npx lerna run start` to run both projects.
  Before this though:
  - `cd backend`
  - `yarn install`
  - `cd ../frontend`
  - `yarn install`
  Then:
  - `cd ..`
  - `npx lerna run start`

#### Frontend - React

#### Backend - Node.js

#### KafkaListener

On a new terminal:
- `cd kafkalistener`
- `npm i`
- `npm run start`

## Security

Our Security Vulnerability Process may be found [here](link_to_security_vulnerability_process).
