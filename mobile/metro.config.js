const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Allow importing from shared/ directory (outside mobile/)
config.watchFolders = [path.resolve(__dirname, "../shared")];

module.exports = withNativeWind(config, { input: "./global.css" });
