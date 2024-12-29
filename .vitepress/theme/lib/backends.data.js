const plugin_directory_json =
  "https://cdn.jsdelivr.net/gh/SigmaHQ/pySigma-plugin-directory@main/pySigma-plugins-v1.json";

export default {
  async load() {
    // process.env.VITE_PORT
    // return {plugins: []}
    return await (await fetch(plugin_directory_json)).json();
  },
};
