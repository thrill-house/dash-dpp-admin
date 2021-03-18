import { createApp } from "vue";

import App from "./App.vue";
import store from "./store";
import { createRouter, createWebHistory } from "vue-router";
import { Quasar } from "quasar";
import quasarUserOptions from "./quasar-user-options";
import routes from "./router/routes";

const router = createRouter({
  // 4. Provide the history implementation to use. We are using the hash history for simplicity here.
  history: createWebHistory(),
  routes, // short for `routes: routes`
});

const app = createApp(App);

// Install plugins
app.use(Quasar, quasarUserOptions);
app.use(router);
app.use(store);

// Mount up
app.mount("#app");
