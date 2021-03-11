<script>
import { ref } from "vue";
import { mapState, mapGetters, mapActions } from "vuex";
import { map, random, zipObject } from "lodash-es";
import Ajv from "ajv";

export default {
  name: "app",
  created() {
    this.init();
  },
  setup() {
    const leftDrawerOpen = ref(false);

    return {
      leftDrawerOpen,
      toggleLeftDrawer() {
        leftDrawerOpen.value = !leftDrawerOpen.value;
      },
    };
  },
  data: () => ({
    // Connection to blockchain
    address: null,

    // Wallet balances
    balance: null,
    credit: null,

    // Editing
    document: "",
    field: "",

    // Loading states
    loading: {
      address: false,
      identity: false,
      balance: false,
    },
  }),
  computed: {
    contractDocuments() {
      return zipObject(
        this.documents,
        map(this.documents, (document) => {
          return map(this.$store.getters[`App/${document}/all`]);
        })
      );
    },

    network() {
      return this.options.network;
    },
    contract() {
      return this.options.contractId;
    },
    identity() {
      return this.options.identityId;
    },
    mnemonic() {
      return this.options.mnemonic;
    },
    ...mapState({
      documents: "documents",
      contract: "contract",
    }),
    ...mapGetters({
      options: "App/options",
      client: "App/client",
      App: "App",
      schemas: "schemas",
      validators: "validators",
    }),
  },
  methods: {
    // Retrieve address
    createWallet() {
      this.loading.address = true;

      const createWallet = async () => {
        await this.client.getWalletAccount();
        const mnemonic = this.client.wallet.exportWallet();

        this.mnemonic = mnemonic;
      };

      createWallet()
        .catch((e) => console.error("Something went wrong:\n", e))
        .finally(() => {
          this.loading.address = false;
        });
    },

    // Retrieve address
    retrieveAddress() {
      this.loading.address = true;

      const retrieveIdentity = async () => {
        const account = await this.client.wallet.getAccount();
        await account.isReady();

        this.address = account.getUnusedAddress().address;
      };

      retrieveIdentity()
        .catch((e) => console.error("Something went wrong:\n", e))
        .finally(() => {
          this.loading.address = false;
        });
    },

    // Register identity
    registerIdentity() {
      this.loading.identity = true;

      const createIdentity = async () => {
        return this.client.platform.identities.register();
      };

      createIdentity()
        .then((d) => {
          this.identity = d.toJSON().id;
        })
        .catch((e) => console.error("Something went wrong:\n", e))
        .finally(() => {
          this.loading.identity = false;
        });
    },

    // Retrieve an identity
    retrieveIdentity() {
      this.loading.identity = true;

      const retrieveIdentity = async () => {
        const account = await this.client.wallet.getAccount();
        await account.isReady();
        return account.getIdentityIds();
      };

      retrieveIdentity()
        .then((d) => {
          this.identity = d[0];
        })
        .catch((e) => console.error("Something went wrong:\n", e))
        .finally(() => {
          this.loading.identity = false;
        });
    },

    // Retrieve an identity
    retrieveBalance() {
      this.loading.balance = true;

      const retrieveBalance = async () => {
        const account = await this.client.wallet.getAccount();
        await account.isReady();
        this.balance = account.getTotalBalance(false);
        const identity = await this.client.platform.identities.get(
          this.identity
        );
        return identity;
      };

      retrieveBalance()
        .then((d) => {
          this.credit = d.toJSON().balance;
        })
        .catch((e) => console.error("Something went wrong:\n", e))
        .finally(() => {
          this.loading.balance = false;
        });
    },

    // Add a new message
    async saveDocument(document, content) {
      if (document && content) {
        this.loading[document] = true;
        const jsonContent = JSON.parse(content);

        try {
          const result = await this[`edit${document}`](jsonContent);
          console.log(result);
        } catch (e) {
          console.log({ "Editing did not complete": e });
        }

        this.loading[document] = false;
      }
    },

    validateDocument(document, content) {
      const schemas = this.schemas;

      if (schemas?.[document]) {
        const ajv = new Ajv({ strict: false });
        const validate = ajv.compile(schemas[document]);

        const result = validate(content);

        return { result, errors: validate.errors };
      }

      return null;
    },

    open(document, data) {
      this.document = document;
      this.field = JSON.stringify(data);
    },

    reset() {
      this.document = "";
      this.field = "";
      this.id = "";
    },

    clipboard(data) {
      navigator.clipboard.writeText(data);
    },

    map,
    random,
    ...mapActions({
      init: "init",
    }),
  },
};
</script>

<template>
  <q-layout view="lHr lpR lFr">
    <q-header class="bg-primary text-white" height-hint="98">
      <q-toolbar>
        <q-btn dense flat round icon="menu" @click="toggleLeftDrawer" />

        <q-toolbar-title>
          <q-avatar>
            <img src="https://cdn.quasar.dev/logo/svg/quasar-logo.svg" />
          </q-avatar>
          Title
        </q-toolbar-title>
      </q-toolbar>

      <q-tabs align="left">
        <q-route-tab to="/page1" label="Page One" />
        <q-route-tab to="/page2" label="Page Two" />
        <q-route-tab to="/page3" label="Page Three" />
      </q-tabs>
    </q-header>

    <q-drawer show-if-above v-model="leftDrawerOpen" side="left" bordered>
      <!-- drawer content -->
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
  <v-app>
    <v-navigation-drawer app>
      <dl class="flex flex-wrap items-center max-w-3xl">
        <dt class="text-xl w-1/4 border-b border-gray-200">Network</dt>
        <dd class="w-3/4 p-1">
          <select v-model="network" class="input">
            <option value="evonet">Evonet</option>
            <option value="testnet">Testnet</option>
          </select>
        </dd>
        <dt class="text-xl w-1/4 border-b border-gray-200">Contract</dt>
        <dd class="w-3/4 p-1">
          <input type="text" v-model="contract" class="input" />
        </dd>
        <dt class="text-xl w-1/4 border-b border-gray-200">Mnemonic</dt>
        <dd class="flex w-3/4 p-1">
          <input type="text" v-model="mnemonic" class="input" />
          <button v-if="!mnemonic" class="button" @click="createWallet">
            Create
          </button>
        </dd>
        <dt class="text-xl w-1/4 border-b border-gray-200">Address</dt>
        <dd class="flex w-3/4 p-1">
          <input type="text" v-model="address" class="input" />
          <button v-if="!address" class="button" @click="retrieveAddress">
            Retrieve
          </button>
        </dd>
        <dt class="text-xl w-1/4 border-b border-gray-200">Identity</dt>
        <dd class="flex w-3/4 p-1">
          <input type="text" v-model="identity" class="input" />
          <button
            class="button"
            :disabled="loading.identity"
            @click="retrieveIdentity"
            v-if="mnemonic && !identity"
          >
            Retrieve
          </button>
          <button
            class="button"
            :disabled="loading.identity"
            @click="registerIdentity"
            v-if="mnemonic && !identity"
          >
            Register
          </button>
        </dd>
        <dt class="text-xl w-1/4 border-b border-gray-200">Balance</dt>
        <dd class="flex w-3/4 p-1">
          <span v-if="credit">
            <output class="text-xl">{{ credit }}</output> Credits |
          </span>
          <span v-if="balance" class="mr-4">
            <output class="text-xl">{{ balance }}</output> Dash
          </span>
          <v-btn
            class="button"
            :disabled="loading.balance"
            @click="retrieveBalance"
            v-if="mnemonic && identity"
          >
            {{ balance ? "Refresh" : "Retrieve" }} balance
          </v-btn>
        </dd>
      </dl>
    </v-navigation-drawer>
    <v-app-bar>
      <v-app-bar-nav-icon></v-app-bar-nav-icon>
      <v-toolbar-title>Title</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn
        v-for="(doc, d) in contractDocuments"
        :key="d"
        @click="open(d, doc)"
      >
        <v-icon>mdi-heart</v-icon>
        {{ d }}
      </v-btn>
    </v-app-bar>
    <v-main>
      <v-container fluid>
        <pre>{{ loading }}</pre>
        <v-textarea class="h-full w-full -mb-16 text-dark" v-model="field" />
        <button
          @click="saveDocument(document, field)"
          class="button button-confirm absolute right-4"
        >
          Save changes
        </button>
      </v-container>
    </v-main>
  </v-app>
</template>
