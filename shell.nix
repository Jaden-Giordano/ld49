{ pkgs ? import <nixpkgs> { } }:

with pkgs;

mkShell {
  name = "js";
  buildInputs = [ nodejs-16_x (yarn.override { nodejs = nodejs-16_x; }) ];
}
