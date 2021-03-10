<script>
import { map, random } from "lodash-es";
import { mapGetters, mapActions } from "vuex";

export default {
  name: "app",
  created() {
    this.init();
  },
  data: () => ({
    // Connection to blockchain
    address: process.env.VUE_APP_GAME_ADDRESS,

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
      Sockets: false,
      Abilities: false,
      Eras: false,
      Trees: false,
      Emotions: false,
    },
  }),
  computed: {
    documents() {
      return {
        Sockets: map(this.Sockets),
        Abilities: map(this.Abilities),
        Eras: map(this.Eras),
        Trees: map(this.Trees),
        Emotions: map(this.Emotions),
      };
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
    ...mapGetters({
      options: "App/options",
      client: "App/client",
      Sockets: "App/Sockets/all",
      Abilities: "App/Abilities/all",
      Eras: "App/Eras/all",
      Trees: "App/Trees/all",
      Emotions: "App/Emotions/all",
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
      editSockets: "App/Sockets/multiple",
      editAbilities: "App/Abilities/multiple",
      editEras: "App/Eras/multiple",
      editTrees: "App/Trees/multiple",
      editEmotions: "App/Emotions/multiple",
    }),
  },
};
</script>

<template>
  <div class="w-full flex">
    <header class="w-1/5 h-144 flex-none items-top justify-between p-8">
      <div>
        <h1 class="text-5xl">EmPT.ai</h1>
        <h2 class="text-2xl">Admin panel</h2>
      </div>
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
          <button
            class="button"
            :disabled="loading.balance"
            @click="retrieveBalance"
            v-if="mnemonic && identity"
          >
            {{ balance ? "Refresh" : "Retrieve" }} balance
          </button>
        </dd>
      </dl>
    </header>
    <main
      id="main"
      class="flex flex-1 self-stretch w-4/5 h-full justify-center items-stretch"
    >
      <section class="w-full flex">
        <div class="w-1/5">
          <button
            v-for="(doc, d) in documents"
            :key="d"
            @click="open(d, doc)"
            :class="`button m-2 ${d === document ? 'button-confirm' : ''}`"
          >
            {{ d }}
          </button>
          <pre>{{ loading }}</pre>
        </div>
        <div class="w-4/5 h-screen">
          <textarea class="h-full w-full -mb-16 text-dark" v-model="field" />
          <button
            @click="saveDocument(document, field)"
            class="button button-confirm absolute right-4"
          >
            Save changes
          </button>
        </div>
      </section>
    </main>
  </div>
</template>
