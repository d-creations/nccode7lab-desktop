# -nccode7lab-desktop
nccode7lab cnc editor desktop edition

## Developer Notes

### Theia webview alignment

Theia injects a compatibility stylesheet into extension webviews containing
`body { padding: 0 20px; }`. This can appear as a dark vertical strip or an
approximately 20 px alignment offset in the Templates sidebar and bottom
Workbench panel, even when the extension is aligned correctly in VS Code.

The desktop build patches the NC-Code7 extension with
`html, body { padding: 0 !important; }` while generating its webview HTML in:

- `plugins/nccode7lab/src/BottomViewProvider.ts`
- `plugins/nccode7lab/src/NCEditorProvider.ts`

Do not edit these files directly because `copy:ext` mirrors the dependency and
overwrites the plugin directory. To update the extension without losing the
Theia compatibility patch, run:

```powershell
npm run update:ext
```

This updates `node_modules/nccode7lab`, applies
`scripts/patch-nccode7lab.js`, compiles the extension, and copies it to the
plugin directory. The patch step fails if an upstream update changes the
expected provider structure.

### Theia extension module exports

Every module declared in a package's `theiaExtensions` array must default-export
its Inversify `ContainerModule`. For CommonJS modules, use:

```js
exports.default = new ContainerModule(bind => {
	// bindings
});
```

Do not use `module.exports = new ContainerModule(...)`. Theia's generated
frontend and Electron-main loaders read `module.default`; the wrong export
causes startup to fail with:

```text
TypeError: Cannot read properties of undefined (reading 'id')
```

The check runs automatically before `npm run build`, after `npm run update:ext`,
and in both GitHub packaging workflows. Run it manually with:

```powershell
npm run verify:theia-exports
```

If a future update introduces the known CommonJS mistake, repair and verify it
before committing the update:

```powershell
npm run fix:theia-exports
npm run verify:theia-exports
```

## Releases and updates

NC-Edit7 has two independent Windows release channels:

- GitHub releases use the NSIS installer. Packaged GitHub builds check for a
	newer GitHub release at startup, download it, and install it when the app
	exits.
- Microsoft Store releases use AppX. The in-app updater is disabled in Store
	packages and Microsoft Store installs updates instead.

Before creating a release, update the version in `package.json` and commit it.
Push a matching tag such as `v1.1.0` to run the GitHub release workflow:

```powershell
git tag v1.1.0
git push origin v1.1.0
```

For Microsoft Store packaging, copy the package identity values from Partner
Center into these GitHub repository secrets:

- `MS_STORE_IDENTITY_NAME`
- `MS_STORE_PUBLISHER`
- `MS_STORE_PUBLISHER_DISPLAY_NAME`

Run the **Microsoft Store Package** workflow manually, download its AppX
artifact, and submit it as a new package in Partner Center. The package version
must be higher than the published Store version. Partner Center signs and
distributes it; no GitHub token or Electron update server is used by Store
installations.

Local packages can be produced with `npm run build:github` or, after setting
the three Store environment variables, `npm run build:store`.
