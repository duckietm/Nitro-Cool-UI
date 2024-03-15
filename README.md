# Nitro React v2.1

Credits: Thanks to wassehk on discord for this release!

## Prerequisites

-   [Git](https://git-scm.com/)
-   [NodeJS](https://nodejs.org/) >= 18
    - If using NodeJS < 18 remove `--openssl-legacy-provider` from the package.json scripts
-   [Yarn](https://yarnpkg.com/) `npm i yarn -g`

## Installation

-   First you should open terminal and navigate to the folder where you want to clone Nitro
-   Clone Nitro
    -   `git clone https://github.com/duckietm/Nitro-Cool-UI.git`
-   Install the dependencies
    -   `yarn install`
    -   This may take some time, please be patient
-   Rename a few files
    -   Rename `public/renderer-config.json.example` to `public/renderer-config.json`
    -   Rename `public/ui-config.json.example` to `public/ui-config.json`
-   Set your links
    -   Open `public/renderer-config.json`
        -   Update `socket.url, asset.url, image.library.url, & hof.furni.url`
    -   Open `public/ui-config.json`
        -   Update `camera.url, thumbnails.url, url.prefix, habbopages.url`
    -   You can override any variable by passing it to `NitroConfig` in the index.html
	
-   Make the following changes
	- ExternalTesxts.json
	`"room.mute.button.text": "Hide chat",`
	`"room.unmute.button.text": "Unhide chat",`

## Usage

-   To use Nitro you need `.nitro` assets generated, see [nitro-converter](https://git.krews.org/nitro/nitro-converter) for instructions

### Development

Run Nitro in development mode when you are editing the files, this way you can see the changes in your browser instantly

```
yarn start
```

### Production

To build a production version of Nitro just run the following command

```
yarn build
```

-   A `dist` folder will be generated, these are the files that must be uploaded to your webserver
-   Consult your CMS documentation for compatibility with Nitro and how to add the production files
