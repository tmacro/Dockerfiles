const fs = require('fs');

const { core, run, yaml, load_image, hydrate_image } = require('../utils');

function _bump_version(version, part) {
    const [major, minor] = version.split('.').map(i => Number.parseInt(i, 10));
    switch (part) {
        case 'major':
            return [major + 1, 0].join('.');
        case 'minor':
            return [major, minor + 1].join('.');
        default:
            throw Error(`Unknown part ${part}`);
    }
}

async function _write_image(image) {
    // Remove internal metadata fields beginning with `_`
    const stripped = Object.keys(image)
        .filter((k) => !k.startsWith('_'))
        .reduce((i, k) => {
            i[k] = image[k];
            return i;
        }, {});
    try {
        const doc = yaml.safeDump(stripped);
        core.debug(image._src);
        fs.writeFileSync(image._self, doc);
    } catch (e) {
        return undefined;
    }
}

async function update_image(name, part) {
    const loaded = await load_image(name);
    const image = hydrate_image(loaded);
    const bumped = _bump_version(image.version, part);
    // We use loaded as we don't want to write keys not present in the original definition.
    const updated_image = {
        ...loaded,
        version: bumped,
    };
    core.info(`Bumping ${image.name} ${image.version} => ${bumped}`);
    await _write_image(updated_image);
}

async function main() {
    const changes = JSON.parse(core.getInput('changes'));
    const updates = JSON.parse(core.getInput('updates'));

    const _changes = changes.map((name) => update_image(name, 'major'));
    const _updates = updates.map((name) => update_image(name, 'minor'));

    await Promise.all([..._changes, ..._updates]);
}

run(main);
