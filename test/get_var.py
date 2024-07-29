#!/usr/bin/env python3

import argparse
import subprocess
import os

parser = argparse.ArgumentParser(
                    prog='get_var',
                    description='gets a variable from op or environment')

parser.add_argument('op_loc')
parser.add_argument('var_name')
parser.add_argument('var_append', nargs='?')

args = parser.parse_args()

envCp = os.environ.copy()

result = ""
out = ""
try:
  result = subprocess.Popen(["op", "read", args.op_loc], stdout = subprocess.PIPE, env=envCp)
except Exception:
  pass


if result:
  out, err = result.communicate()
  if out:
    print(out.strip().decode())

if not(result) or not(out):
  if args.var_append:
    print(os.environ[args.var_name] + args.var_append)
  else:
    print(os.environ[args.var_name])