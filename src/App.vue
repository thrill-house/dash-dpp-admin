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
    contractId() {
      return this.options.contractId;
    },
    identityId() {
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
    <q-header class="bg-primary text-white">
      <q-toolbar>
        <q-btn dense flat round icon="menu" @click="toggleLeftDrawer" />
        <q-toolbar-title> Dash Platform Admin </q-toolbar-title>
      </q-toolbar>
    </q-header>
    <q-drawer show-if-above v-model="leftDrawerOpen" side="left" bordered>
      <q-scroll-area class="fit">
        <q-list>
          <template v-for="document in documents" :key="document">
            <q-item
              :to="`/contract/${contractId}/${document}`"
              clickable
              v-ripple
            >
              <q-item-section avatar top>
                <q-icon name="folder" />
              </q-item-section>
              <q-item-section>
                <q-item-label> {{ document }} </q-item-label>
              </q-item-section>
            </q-item>
          </template>
          <q-separator />
          <q-item :to="`/settings`" clickable v-ripple>
            <q-item-section avatar>
              <q-icon name="settings" />
            </q-item-section>
            <q-item-section> Settings </q-item-section>
          </q-item>
        </q-list>
      </q-scroll-area>
    </q-drawer>
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>
