const { withAndroidManifest } = require('@expo/config-plugins');

module.exports = function withAndroidQueries(config) {
  return withAndroidManifest(config, async (config) => {
    const androidManifest = config.modResults;
    const manifest = androidManifest.manifest;

    if (!manifest.queries) {
      manifest.queries = [];
    }

    manifest.queries.push({
      package: [{ $: { 'android:name': 'com.whatsapp' } }],
    });

    return config;
  });
};
