const Path = require('path');
const fs = require('fs');

const core = require('@actions/core');
const exec = require('@actions/exec');
const glob = require('@actions/glob');

// Get the working directory
const work_dir = process.env.GITHUB_WORKSPACE;

// Get reference for triggering commit
const git_ref = process.env.GITHUB_SHA;
const short_ref = git_ref.slice(0, 7);

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

module.exports = {
    core,
    exec,
    glob,
    run,
    work_dir,
    git_ref,
    short_ref,
    get_git_tags
};
