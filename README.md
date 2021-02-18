<img src="https://magicleaphelio.com/images/Prismatic_Wordmark_RGB.svg" alt="drawing" width="150"/>

# Prismatic

Prismatic is a declarative JS library for creating 3D content for the Helio browser.
Using simple HTML tags with inline attributes and CSS styling, you can easily render 3D content that pops off of the page and you can grab and place into your environment.

## Installing

If you use npm, run `npm i @magicleap/prismatic`. Otherwise, you can [download](https://developer.magicleap.com/downloads/prismatic) the latest release from the developer portal.

To add the minified version:

```
<script src="https://unpkg.com/@magicleap/prismatic"></script>
```

The source code for Prismatic is also hosted in a repository on [GitHub](https://github.com/MagicLeap/prismatic).

See our [Prismatic documentation](https://magicleaphelio.com/docs).

For more information and guides are available on Magic Leap's [Developer Portal](https://developer.magicleap.com/learn/guides/helio).

For live samples and code snippets, highlighting the Web Platform's core features, checkout the Developer Samples website [here](https://magicleaphelio.com/devsamples).

## What's new in Release v2.0.6
- Use new event model introduced in Helio for Lumin OS 0.98.20. Prismatic library has to be updated to v2.0.6 maintain Extraction functionality.

## Features of Prismatic v2
- Faster model loading
- Model instancing
- Models scroll with page
- Models can be extracted with raycast: Users no longer have to be interacting with the parent element on the page to extract them.
- Extract 3D models from regular HTML elements.
- Add instances of a 3D node on the fly.
- **&lt;stage>** tag: Devs can specify how much space their experience will take up.
- Stage size can be updated via JS.
