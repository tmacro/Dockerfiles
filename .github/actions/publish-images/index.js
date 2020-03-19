const { core, run, exec, load_and_hydrate_image } = require('../utils');

async function docker_login(user, token) {
    core.debug(`Authoring docker user ${user}`);
    const ret_code = await exec.exec('docker', [
        'login',
        '--username',
        user,
        '--password',
        token
    ]);
    if (ret_code !== 0) {
        throw Error(`Failed authorize user ${user}`);
    }
}

async function tag_image(repo, image, tag) {
    core.debug(`Tagging image ${repo}/${image} with ${tag}`);
    const ret_code = await exec.exec('docker', [
        'tag',
        `${repo}/${image}`,
        `${repo}/${image}:${tag}`,
    ]);
    if (ret_code !== 0) {
        throw Error(`Failed to tag image ${repo}/${image} with ${tag}`);
    }
}


async function push_image(repo, image, tag = null) {
    const _tag = !!tag ? `:${tag}` : '';
    core.debug(`Pushing image ${repo}/${image}${_tag}`);
    const ret_code = await exec.exec('docker', [
        'push',
        `${repo}/${image}${_tag}`
    ]);
    if (ret_code !== 0) {
        throw Error(`Failed to push image ${repo}/${image}${_tag}`);
    }
}

async function add_tags(repo, image) {
    core.debug(`Adding tags to image ${image.name}`);
    if (image.tag_version) {
        await tag_image(repo, image.name, image.version);
    }
}

async function publish_tags(repo, image) {
    core.debug(`Pushing image ${image.name}`);
    const tag = image.tag_latest ? null : image.version;
    await push_image(repo, image.name, tag);
}

async function main() {
    const docker_username = core.getInput('docker_username');
    const docker_token = core.getInput('docker_token');
    const changes = JSON.parse(core.getInput('changes'));
    const updates = JSON.parse(core.getInput('updates'));

    const to_publish = [...changes, ...updates];
    const images = await Promise.all(to_publish.map(load_and_hydrate_image));

    await docker_login(docker_username, docker_token);
    await Promise.all(images.map(image => add_tags(docker_username, image)));
    await Promise.all(images.map(image => publish_tags(docker_username, image)));

}

run(main);
