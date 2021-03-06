# Change Log

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/)
and this project adheres to [Semantic Versioning](https://semver.org/).

## [1.5.1] / 2020-11-17

### Changed

- Update all dependencies and test on Node Fermium.
- License to MIT.

## [1.5.0] / 2020-06-16

### Changed

- Update dependencies.

## [1.4.0] / 2020-02-28

### Changed

- Update dependencies.

## [1.3.0] / 2019-04-11

### Changed

- Open source under the Apache License, Version 2.0!

## [1.2.0] / 2019-03-28

### Changed

- Update from rxjs v5 to v6.

## [1.1.5] / 2018-12-17

### Changed

- Update to [makenew-node-lib] v5.3.0.

## [1.1.4] / 2018-09-26

### Changed

- Update to [makenew-node-lib] v5.1.0.
- Replace default Bunyan logger with mlabs-logger.

## [1.1.3] / 2018-03-01

### Fixed

- Race condition where all checks would report as cached.

## [1.1.2] / 2018-02-28

### Fixed

- The timeout did not work with cache.

## [1.1.1] / 2018-02-28

### Fixed

- The `timeout` option ignored by health monitor.

## [1.1.0] / 2018-02-28

### Added

- New option `timeout`.
  - Health checks will error after the timeout in milliseconds.
  - The default value is set at one minute.
  - Health checks which never resolve cause unexpected behavior,
    so this is being released as a non-breaking change.

## 1.0.0 / 2017-11-21

- Initial release.

[makenew-node-lib]: https://github.com/meltwater/makenew-node-lib

[Unreleased]: https://github.com/meltwater/mlabs-health/compare/v1.5.1...HEAD
[1.5.1]: https://github.com/meltwater/mlabs-health/compare/v1.5.0...v1.5.1
[1.5.0]: https://github.com/meltwater/mlabs-health/compare/v1.4.0...v1.5.0
[1.4.0]: https://github.com/meltwater/mlabs-health/compare/v1.3.0...v1.4.0
[1.3.0]: https://github.com/meltwater/mlabs-health/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/meltwater/mlabs-health/compare/v1.1.5...v1.2.0
[1.1.5]: https://github.com/meltwater/mlabs-health/compare/v1.1.4...v1.1.5
[1.1.4]: https://github.com/meltwater/mlabs-health/compare/v1.1.3...v1.1.4
[1.1.3]: https://github.com/meltwater/mlabs-health/compare/v1.1.2...v1.1.3
[1.1.2]: https://github.com/meltwater/mlabs-health/compare/v1.1.1...v1.1.2
[1.1.1]: https://github.com/meltwater/mlabs-health/compare/v1.1.0...v1.1.1
[1.1.0]: https://github.com/meltwater/mlabs-health/compare/v1.0.0...v1.1.0
