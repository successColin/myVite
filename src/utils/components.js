import { defineAsyncComponent } from "vue";
export function registerGlobalComponents(app) {
  const components = import.meta.glob("../components/*/*");
  for (const [path, resolve] of Object.entries(components)) {
    console.log(components, path, resolve);
    const componentName = path.replace("./", "").split("/")[1];
    app.component(componentName, defineAsyncComponent(resolve));
  }
}
