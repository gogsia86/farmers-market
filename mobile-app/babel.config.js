module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      [
        "module-resolver",
        {
          root: ["./"],
          extensions: [".ios.js", ".android.js", ".js", ".ts", ".tsx", ".json"],
          alias: {
            "@": "./src",
            "@components": "./src/components",
            "@screens": "./src/screens",
            "@navigation": "./src/navigation",
            "@services": "./src/services",
            "@hooks": "./src/hooks",
            "@utils": "./src/utils",
            "@stores": "./src/stores",
            "@types": "./src/types",
            "@constants": "./src/constants",
            "@config": "./src/config",
            "@providers": "./src/providers",
            "@assets": "./assets",
            "@theme": "./src/theme",
          },
        },
      ],
      // React Native Reanimated plugin must be listed last
      "react-native-reanimated/plugin",
    ],
  };
};
