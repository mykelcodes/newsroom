// Learn more: https://docs.expo.dev/guides/monorepos/
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');
const srcRoot = path.resolve(projectRoot, 'src');

const config = getDefaultConfig(projectRoot);

// 1. Watch all files within the monorepo (so the shared @newsroom/backend
//    package is picked up by Metro's file watcher).
config.watchFolders = [workspaceRoot];

// 2. Resolve modules from the app's node_modules first, then the workspace root.
config.resolver.nodeModulesPaths = [
	path.resolve(projectRoot, 'node_modules'),
	path.resolve(workspaceRoot, 'node_modules')
];

const defaultResolveRequest = config.resolver.resolveRequest;

config.resolver.resolveRequest = (context, moduleName, platform) => {
	if (moduleName === '#') {
		return context.resolveRequest(context, srcRoot, platform);
	}

	if (moduleName.startsWith('#/')) {
		return context.resolveRequest(context, path.join(srcRoot, moduleName.slice(2)), platform);
	}

	if (defaultResolveRequest) {
		return defaultResolveRequest(context, moduleName, platform);
	}

	return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
