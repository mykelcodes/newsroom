const {
	withGradleProperties,
	withAppBuildGradle,
	withDangerousMod,
} = require("@expo/config-plugins");
const fs = require("fs");
const os = require("os");
const path = require("path");

/**
 * Config plugin that wires up the Android release signing config for local
 * production builds (`pnpm prebuild:prod`, which sets NODE_ENV=production).
 *
 * It performs three things during prebuild:
 *   1. Copies the release keystore from ~/Documents into android/app.
 *   2. Writes the MYAPP_RELEASE_* signing values into android/gradle.properties.
 *   3. Adds a `release` signingConfig to android/app/build.gradle and points the
 *      release build type at it.
 *
 * Signing values are read from the environment. Expo loads the matching .env
 * file into process.env before resolving the config (e.g. .env.production /
 * .env.production.local for `prebuild:prod`), so keep the secrets there:
 *
 *   MYAPP_RELEASE_STORE_FILE      -> keystore file name, e.g. newsroom.keystore
 *   MYAPP_RELEASE_STORE_PASSWORD  -> keystore password
 *   MYAPP_RELEASE_KEY_ALIAS       -> key alias
 *   MYAPP_RELEASE_KEY_PASSWORD    -> key password
 *   MYAPP_RELEASE_STORE_SOURCE    -> (optional) absolute path to the source
 *                                    keystore; defaults to
 *                                    ~/Documents/<MYAPP_RELEASE_STORE_FILE>
 *
 * The plugin is a no-op unless NODE_ENV === "production", so a plain
 * `expo prebuild` for development is unaffected.
 */

const TAG = "[withAndroidReleaseSigning]";

// Injected inside the `signingConfigs { ... }` block of android/app/build.gradle.
const RELEASE_SIGNING_CONFIG = `        release {
            if (project.hasProperty('MYAPP_RELEASE_STORE_FILE')) {
                storeFile file(MYAPP_RELEASE_STORE_FILE)
                storePassword MYAPP_RELEASE_STORE_PASSWORD
                keyAlias MYAPP_RELEASE_KEY_ALIAS
                keyPassword MYAPP_RELEASE_KEY_PASSWORD
            }
        }`;

function getSigningEnv() {
	return {
		storeFile: process.env.MYAPP_RELEASE_STORE_FILE,
		storePassword: process.env.MYAPP_RELEASE_STORE_PASSWORD,
		keyAlias: process.env.MYAPP_RELEASE_KEY_ALIAS,
		keyPassword: process.env.MYAPP_RELEASE_KEY_PASSWORD,
		storeSource: process.env.MYAPP_RELEASE_STORE_SOURCE,
	};
}

function assertSigningEnv(env) {
	const missing = Object.entries({
		MYAPP_RELEASE_STORE_FILE: env.storeFile,
		MYAPP_RELEASE_STORE_PASSWORD: env.storePassword,
		MYAPP_RELEASE_KEY_ALIAS: env.keyAlias,
		MYAPP_RELEASE_KEY_PASSWORD: env.keyPassword,
	})
		.filter(([, value]) => !value)
		.map(([key]) => key);

	if (missing.length > 0) {
		throw new Error(
			`${TAG} Missing required env variable(s): ${missing.join(", ")}. ` +
				"Add them to .env.production (or .env.production.local).",
		);
	}
}

function setGradleProperty(items, key, value) {
	const existing = items.find(
		(item) => item.type === "property" && item.key === key,
	);
	if (existing) {
		existing.value = value;
	} else {
		items.push({ type: "property", key, value });
	}
}

const withAndroidReleaseSigning = (config) => {
	// Only touch signing for production builds (prebuild:prod sets NODE_ENV).
	if (process.env.NODE_ENV !== "production") {
		return config;
	}

	assertSigningEnv(getSigningEnv());

	// 1. Copy the keystore into android/app.
	config = withDangerousMod(config, [
		"android",
		(cfg) => {
			const env = getSigningEnv();
			const fileName = path.basename(env.storeFile);
			const source =
				env.storeSource ||
				path.join(os.homedir(), "Documents", fileName);
			const destDir = path.join(cfg.modRequest.platformProjectRoot, "app");
			const dest = path.join(destDir, fileName);

			if (!fs.existsSync(source)) {
				throw new Error(`${TAG} Keystore not found at ${source}`);
			}

			fs.mkdirSync(destDir, { recursive: true });
			fs.copyFileSync(source, dest);
			return cfg;
		},
	]);

	// 2. Write MYAPP_RELEASE_* into android/gradle.properties.
	config = withGradleProperties(config, (cfg) => {
		const env = getSigningEnv();
		setGradleProperty(
			cfg.modResults,
			"MYAPP_RELEASE_STORE_FILE",
			path.basename(env.storeFile),
		);
		setGradleProperty(
			cfg.modResults,
			"MYAPP_RELEASE_STORE_PASSWORD",
			env.storePassword,
		);
		setGradleProperty(
			cfg.modResults,
			"MYAPP_RELEASE_KEY_ALIAS",
			env.keyAlias,
		);
		setGradleProperty(
			cfg.modResults,
			"MYAPP_RELEASE_KEY_PASSWORD",
			env.keyPassword,
		);
		return cfg;
	});

	// 3. Add the release signingConfig and point the release build type at it.
	config = withAppBuildGradle(config, (cfg) => {
		let contents = cfg.modResults.contents;

		if (!contents.includes("MYAPP_RELEASE_STORE_FILE")) {
			contents = contents.replace(
				/signingConfigs\s*\{/,
				(match) => `${match}\n${RELEASE_SIGNING_CONFIG}`,
			);
		}

		// The release build type is the only one followed by
		// `def enableShrinkResources`, so this targets it precisely.
		contents = contents.replace(
			/signingConfig signingConfigs\.debug(\s*\n\s*def enableShrinkResources)/,
			"signingConfig signingConfigs.release$1",
		);

		cfg.modResults.contents = contents;
		return cfg;
	});

	return config;
};

module.exports = withAndroidReleaseSigning;
