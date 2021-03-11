import { createApp } from "vue";

import App from "./App.vue";
import store from "./store";
import { Quasar } from "quasar";
import quasarUserOptions from "./quasar-user-options";

const app = createApp(App);

// Install plugins
app.use(Quasar, quasarUserOptions);
app.use(store);

// Mount up
app.mount("#app");
