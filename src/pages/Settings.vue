<script>
import { mapState, mapGetters, mapActions } from "vuex";
import { map, random } from "lodash-es";
import Ajv from "ajv";

export default {
  name: "settings",
  data: () => ({
    // Connection to blockchain
    address: null,

    // Wallet balances
    balance: null,
    credit: null,
  }),
  computed: {
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
  <q-page padding>
    <q-select
      v-model="network"
      label="Network"
      :options="[
        { label: 'Testnet', value: 'testnet' },
        { label: 'Livenet', value: 'livenet' },
      ]"
    />

    <q-input v-model="contractId" label="Contract ID" />

    <q-input v-model="mnemonic" label="Mnemonic" />
    <button v-if="!mnemonic" class="button" @click="createWallet">
      Create
    </button>

    <q-input v-model="address" label="Address" />
    <button v-if="!address" class="button" @click="retrieveAddress">
      Retrieve
    </button>

    <q-input v-model="identityId" label="Identity ID" />
    <!-- <button
      class="button"
      :disabled="loading.identity"
      @click="retrieveIdentity"
      v-if="mnemonic && !identityId"
    >
      Retrieve
    </button> -->
    <!-- <button
      class="button"
      :disabled="loading.identity"
      @click="registerIdentity"
      v-if="mnemonic && !identityId"
    >
      Register
    </button> -->

    <span v-if="credit">
      <output class="text-xl">{{ credit }}</output> Credits |
    </span>
    <span v-if="balance" class="mr-4">
      <output class="text-xl">{{ balance }}</output> Dash
    </span>
    <q-btn
      class="button"
      :disabled="loading.balance"
      @click="retrieveBalance"
      v-if="mnemonic && identity"
    >
      {{ balance ? "Refresh" : "Retrieve" }} balance
    </q-btn>
  </q-page>
</template>