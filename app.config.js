const appJson = require("./app.json");

const KOTLIN_VERSION = "2.1.21";

function upsertPlugin(plugins, name, config) {
  const next = [...plugins];
  const index = next.findIndex((plugin) =>
    Array.isArray(plugin) ? plugin[0] === name : plugin === name
  );

  const value = config == null ? name : [name, config];
  if (index >= 0) next[index] = value;
  else next.push(value);
  return next;
}

module.exports = ({ config }) => {
  const base = appJson.expo || config || {};

  let plugins = Array.isArray(base.plugins) ? [...base.plugins] : [];

  plugins = upsertPlugin(plugins, "@mj-studio/react-native-naver-map", {
    client_id: process.env.EXPO_PUBLIC_NAVER_MAP_CLIENT_ID || "",
  });

  plugins = upsertPlugin(plugins, "expo-build-properties", {
    android: {
      kotlinVersion: KOTLIN_VERSION,
    },
  });

  return {
    ...base,
    android: {
      ...(base.android || {}),
      googleServicesFile: "./google-services.json",
    },
    plugins,
  };
};
