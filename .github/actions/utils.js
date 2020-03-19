const Path = require('path');
const fs = require('fs');

const core = require('@actions/core');
const exec = require('@actions/exec');
const glob = require('@actions/glob');
const yaml = require('js-yaml');

const constants = require('./constants');

// Get the working directory
const work_dir = process.env.GITHUB_WORKSPACE;

if (!work_dir) {
    core.setFailed('Unable to locate workspace!');
}

function run(func) {
    return func()
        .then(() => core.info('Action Completed Successfully'))
        .catch((err) => {
            core.error(JSON.stringify(err.stack, null, 4));
            core.setFailed(`Error during action execution! ${err}`);
        });
}

async function load_image(name) {
    const image_path = Path.join(work_dir, name);
    const definition_path = Path.join(
        image_path,
        constants.DEFINITION_FILENAME
    );
    const metadata = {
        _name: name,
        _self: definition_path,
        _dir: image_path,
    };
    let loaded_config = {};
    try {
        core.debug(`Loading ${definition_path}`);
        loaded_config = yaml.safeLoad(fs.readFileSync(definition_path, 'utf8')) || {};
        core.debug(`Loaded ${JSON.stringify(loaded_config)}`);
    } catch (e) {
        if (e.code !== 'ENOENT') {
            core.error(`Error while loading image ${e}`);
        }
    }
    return { ...metadata, ...loaded_config };
}

function hydrate_image(image) {
    const image_defaults = {
        name: image._name,
        tag_latest: true,
        tag_version: false,
        version: '0.0',
        deps: [],
    };
    return { ...image_defaults, ...image };
}

async function load_and_hydrate_image(name) {
    const loaded = await load_image(name);
    return hydrate_image(loaded);
}

async function get_images() {
    const globber = await glob.create(`${work_dir}/*/Dockerfile`);
    const dockerfiles = await globber.glob();
    const images = [];
    for (let i = 0; i < dockerfiles.length; i++) {
        const image_name = Path.basename(Path.dirname(dockerfiles[i]));
        const image = await load_and_hydrate_image(image_name);
        core.debug(`Discovered image ${image.name}`);
        images.push(image);
    }
    return images;
}

module.exports = {
    core,
    exec,
    glob,
    yaml,
    run,
    work_dir,
    load_image,
    hydrate_image,
    load_and_hydrate_image,
    get_images,
};
