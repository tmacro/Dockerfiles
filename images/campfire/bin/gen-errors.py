#!/bin/sh

import argparse
import json
import os
import sys
import pathlib

import jinja2


def resolve_path(path):
    return pathlib.Path(os.path.expanduser(path)).resolve()

def get_args():
    parser = argparse.ArgumentParser(
        prog=os.path.basename(sys.argv[0]),
        description='Generate static error files from a template',
        formatter_class=argparse.ArgumentDefaultsHelpFormatter)

    parser.add_argument('--input', type=resolve_path, metavar='PATH', required=True, help='Error definitions')
    parser.add_argument('--output', type=resolve_path, metavar='PATH', required=True, help='Output directory')
    parser.add_argument('--template', type=resolve_path, metavar='PATH', required=True, help='Error template')
    return parser.parse_args()

def main():
    args = get_args()
    print(args)

    template = jinja2.Template(open(args.template).read())
    with open(args.input) as f:
        errors = json.load(f)

    if not args.output.is_dir():
        args.output.mkdir()

    for code, data in errors.items():
        rendered = template.render(
            error_code=code,
            error_message=data['code'],
            error_desc=data['description'],
        )

        output_path = args.output / f'{code}.html'
        with open(output_path, 'w') as f:
            f.write(rendered)

if __name__ == '__main__':
    main()

