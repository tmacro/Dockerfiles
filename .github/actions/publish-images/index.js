const { core, run, exec } = require('../utils');

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

async function get_git_tags() {
    core.debug('Fetching git tags');
    let tags = {};
    const options = {
        cwd: work_dir,
        listeners: {
            stdline: (line) => {
                const parts = line.split('-v');
                tags[parts[0]] = parts[1];
            },
            stderr: (buf) => core.debug(buf.toString()),
        },
    };
    const ret_code = await exec.exec('git',
        [
            'tag',
            '--points-at',
            'HEAD',
        ],
        options
    );
    if (ret_code !== 0) {
        throw Error('Failed to fetch git tags');
    }
    return tags;
}

async function get_git_ref() {
    core.debug('Fetching git ref');
    let ref = null;
    const options = {
        cwd: work_dir,
        listeners: {
            stdline: (line) => {
                ref = line;
            },
            stderr: (buf) => core.debug(buf.toString()),
        },
    };
    const ret_code = await exec.exec('git',
        [
            'show-ref',
            '--hash',
            'HEAD',
        ],
        options
    );
    if (ret_code !== 0 || ref === null) {
        throw Error('Failed to fetch git ref');
    }
    return ref;
}


async function tag_image(repo, image, tag) {
    core.debug(`Tagging ${repo}/${image} with ${tag}`);
    const ret_code = await exec.exec('docker', [
        'tag',
        `${repo}/${image}`,
        `${repo}/${image}:${tag}`,
    ]);
    if (ret_code !== 0) {
        throw Error(`Failed to tag ${repo}/${image} with ${tag}`);
    }
}

async function remove_latest_tag(repo, image) {
    core.debug(`Removing latest tag from ${repo}/${image}`);
    const ret_code = await exec.exec('docker', [
        'rmi',
        `${repo}/${image}:latest`,
    ]);
    if (ret_code !== 0) {
        throw Error(`Failed to remove tag ${repo}/${image}:latest`);
    }
}

async function push_image(repo, image, tag = null) {
    core.debug(`Pushing image ${repo}/${image}`);
    const ret_code = await exec.exec('docker', [
        'push',
        `${repo}/${image}`
    ]);
    if (ret_code !== 0) {
        throw Error(`Failed to push image ${repo}/${image}`);
    }
}

async function add_tags(repo, image, ref, tag) {
    core.debug(`Adding tags to image ${image}`);
    await tag_image(repo, image, ref);
    if (tag) {
        await tag_image(repo, image, tag);
    } else {
        await remove_latest_tag(repo, image);
    }
}

async function publish_tags(repo, image) {
    core.debug(`Publishing image ${repo}/${image}`);
    await push_image(repo, image);
}

async function main() {
    const docker_username = core.getInput('docker_username');
    const docker_token = core.getInput('docker_token');
    const to_publish = JSON.parse(core.getInput('images'));

    await docker_login(docker_username, docker_token);
    const git_tags = await get_git_tags();
    const git_ref = await get_git_ref().slice(0, 7);
    await Promise.all(to_publish.map(image => add_tags(docker_username, image, git_ref, git_tags[image])));
    await Promise.all(to_publish.map(image => publish_tags(docker_username, image)));
}

run(main);
