# Third-party notices

Vantage copyright © 2026 thebuggeddev. Send email to [thebuggeddev@gmail.com](mailto:thebuggeddev@gmail.com).

Vantage loads the following libraries at runtime from public CDNs. They are not relicensed under the Vantage project license and remain subject to their own terms.

## Three.js r128

Copyright © 2010 to 2021 three.js authors.

Read the [Three.js MIT License](https://github.com/mrdoob/three.js/blob/r128/LICENSE).

Vantage uses the Three.js core plus several of its official example add-ons (post-processing: `EffectComposer`, `RenderPass`, `ShaderPass`, `UnrealBloomPass`, `SSAOPass`; shaders: `CopyShader`, `LuminosityHighPassShader`, `GammaCorrectionShader`, `FXAAShader`, `SSAOShader`; and `SimplexNoise`). All of these are part of Three.js and covered by the same MIT license.

The libraries are fetched at runtime from public CDNs:

- [Three.js r128 core, from cdnjs](https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js)
- Three.js r128 example add-ons, from jsDelivr, e.g. `https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/postprocessing/EffectComposer.js`

## Vercel Web Analytics

When Vantage is deployed on Vercel with Web Analytics enabled, it loads Vercel's analytics script (`/_vercel/insights/script.js`) at runtime. It is a Vercel service governed by [Vercel's terms](https://vercel.com/legal/privacy-policy) and is a no-op when the app is run anywhere other than a Vercel deployment.

