# EZ Tree integration

Source: https://github.com/dgreenheck/ez-tree
Snapshot tree: dcf309bd86bd521083d9c70f01f2de45fdc7c457
Copyright (c) 2024 Daniel Greenheck. MIT license: LICENSE.

Bundled src/lib/{tree,branch,enums,options,rng,trellis}.js with only import paths adapted for browser ES modules and pinned Three.js 0.170.0. preset.js wraps the upstream oak_medium JSON and exposes that one preset. The original generator is used to create both branches and leaves; lantern attachment points are sampled from its skeleton. Leaf alpha texture is drawn locally; no third-party image assets are bundled. The embedded noise shader notices are preserved in NOISE-LICENSE.

