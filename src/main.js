import { createApp } from "vue";

import App from "./App.vue";
import vuetify from "./plugins/vuetify";
import store from "./store";

const app = createApp(App);

// Install plugins
app.use(vuetify);
app.use(store);

// Mount up
app.mount("#app");
