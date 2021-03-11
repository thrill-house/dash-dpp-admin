import { createApp } from "vue";

import App from "./App.vue";
import store from "./store";

const app = createApp(App);

// Install plugins
app.use(store);

// Mount up
app.mount("#app");
