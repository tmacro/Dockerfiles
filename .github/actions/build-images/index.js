const { core, run, exec, load_and_hydrate_image } = require('../utils');

class Node {
    constructor(name) {
        this.name = name;
        this._deps = [];
    }

    get rank() {
        if (this._deps.length > 0) {
            return Math.max(...this._deps.map((d) => d.rank)) + 1;
        }
        return 0;
    }

    add_dep(dep) {
        if (!this._deps.includes(dep)) {
            this._deps.push(dep);
            core.debug(`Adding dependency ${dep.name} to ${this.name}`);
        }
    }
}

class Graph {
    constructor() {
        this._constraints = {};
    }

    /**
     * Checks recursively if a node currently has the child as a constraint
     * @param {string} parent
     * @param {string} child
     * @param {string} _root
     * @returns {boolean}
     */
    _has_constraint(parent, child) {
        const _parent = this._get_node(parent);
        // if parent is child
        if (parent === child) return true;
        // If parent has no constraints
        if (!!!_parent.length) return false;
        // If parent has child as a direct constraint
        if (_parent.includes(child)) return true;
        // Check every to every constraint of parent
        return _parent.every((c) => !this._has_constraint(c, child));
    }

    _get_node(id) {
        return this._constraints[id] || [];
    }

    _add_constraint(parent, child) {
        if (this._has_constraint[parent] === undefined) {
            this._constraints[parent] = [];
        }
        if (this._has_constraint[child] === undefined) {
            this._constraints[child] = [];
        }
        this._constraints[parent].push(child);
    }

    add_node(id) {
        this._constraints[id] = [];
    }

    add_constraint(parent, child = null) {
        if (this._has_constraint(child, parent)) {
            throw Error(
                `Circular Dependency: ${child} can not be a dependency of ${parent}!`
            );
        }
        if (this._has_constraint(parent, child)) {
            core.debug(`Constraint ${child} already present for ${parent}`);
            return false;
        }
        core.debug(`Adding constraint ${parent} -> ${child}`);
        this._add_constraint(parent, child);
        return true;
    }

    get stages() {
        const nodes = Object.keys(this._constraints).reduce((ns, n) => {
            ns[n] = new Node(n);
            return ns;
        }, {});
        Object.keys(nodes).forEach((n) => {
            this._constraints[n].forEach((d) => {
                nodes[n].add_dep(nodes[d]);
            });
        });
        const layers = Object.values(nodes).reduce((ls, n) => {
            if (!ls[n.rank]) {
                ls[n.rank] = [n.name];
            } else {
                ls[n.rank].push(n.name);
            }
            return ls;
        }, {});
        return Object.keys(layers)
            .sort((a, b) => a > b)
            .reduce((stages, layer) => {
                stages.push(layers[layer]);
                return stages;
            }, []);
    }
}

async function build_image(image, repo) {
    core.debug(`Building image ${repo}/${image.name}`);
    const ret_code = await exec.exec('docker', [
        'build',
        '--tag',
        `${repo}/${image.name}`,
        image._dir,
    ]);
    if (ret_code !== 0) {
        throw Error(`Failed to build image ${image.name}`);
    }
}

async function main() {
    const docker_username = core.getInput('docker_username');
    const changes = JSON.parse(core.getInput('changes'));
    const updates = JSON.parse(core.getInput('updates'));
    const to_build = [...changes, ...updates];
    // const to_build = ['base', 'lego', 'base-python'];
    const _images = await Promise.all(to_build.map(load_and_hydrate_image));
    const images = _images.reduce((imgs, i) => {
        imgs[i.name] = i;
        return imgs;
    }, {});

    const graph = new Graph();
    Object.values(images).forEach((i) => {
        graph.add_node(i.name);
        i.deps.forEach((d) => {
            console.log(d);
            graph.add_constraint(i.name, d);
        });
    });

    for (const stage of graph.stages) {
        const stage_images = stage.filter(i => to_build.includes(i))
        core.info(`Building images: ${stage_images.join(', ')}`);
        await Promise.all(
            stage_images.map((i) => build_image(images[i], docker_username))
        );
    }
}

run(main);
