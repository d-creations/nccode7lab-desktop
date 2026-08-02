# Changelog

All notable changes to NC-Edit7 Desktop are documented in this file.

## [1.1.0] - 2026-08-02

### Added

- GitHub Release and Microsoft Store packaging workflows.
- Automatic update checks for packaged GitHub releases.
- A repeatable NCCode7Lab update, patch, compile, and copy workflow.
- Build-time validation and repair commands for Theia extension module exports.

### Changed

- Updated the desktop runtime to Theia 1.73.1 and Electron 39.8.7.
- Started the development app with an explicit workspace and local plugin directory.
- Added desktop shell customizations for the NCCode7Lab panels and menus.

### Fixed

- Production startup failures caused by frontend and Electron-main modules not default-exporting their Inversify `ContainerModule`.
- NCCode7Lab webview alignment under Theia's injected body padding.
- Native dependency preparation and Ripgrep resolution for reproducible builds.

## [1.0.0] - 2026-05-14

### Added

- Initial NC-Edit7 Desktop application based on Eclipse Theia.