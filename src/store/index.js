import { keys } from "lodash";
import { createStore } from "vuex";

import VuexDashDpp from "vuex-dash-dpp";

export default createStore({
  state() {
    return {
      contractId: process.env.VUE_APP_CONTRACT,
      identityId: process.env.VUE_APP_IDENTITY,
      mnemonic: process.env.VUE_APP_MNEMONIC,
      documents: [],
    };
  },
  mutations: {
    contractId: (state, payload) => {
      state.contractId = payload;
    },
    documents: (state, payload) => {
      state.documents = payload;
    },
    identityId: (state, payload) => {
      state.identityId = payload;
    },
    mnemonic: (state, payload) => {
      state.mnemonic = payload;
    },
  },
  actions: {
    init: async ({ dispatch, state }) => {
      const { identityId, mnemonic, contractId } = state;

      if (identityId && mnemonic && contractId) {
        await dispatch("setContractId", contractId);
        await dispatch("setIdentityId", identityId);
        await dispatch("setMnemonic", mnemonic);

        await dispatch("fetchDocuments");

        await dispatch("App/all");
      }
    },

    fetchDocuments: async ({ dispatch, state, rootGetters }) => {
      const { contractId } = state;

      if (contractId) {
        const client = rootGetters["App/client"];
        const contract = await client.platform.contracts.get(contractId);
        const documents = keys(contract.documents);

        await dispatch("setDocuments", documents);
      }
    },

    setContractId: async ({ commit }, payload) => {
      commit("contractId", payload);
    },
    setDocuments: async ({ commit }, payload) => {
      commit("documents", payload);
    },
    setIdentityId: async ({ commit }, payload) => {
      commit("identityId", payload);
    },
    setMnemonic: async ({ commit }, payload) => {
      commit("mnemonic", payload);
    },
  },
  plugins: [
    new VuexDashDpp({
      network: process.env.VUE_APP_NETWORK,
      contractId: process.env.VUE_APP_CONTRACT,
      identityId: process.env.VUE_APP_IDENTITY,
      namespace: "App",
      subscribeToFrom: [
        {
          identityId: "identityId",
          mnemonic: "mnemonic",
          documents: "documents",
        },
        ["identityId", "mnemonic", "documents"],
      ],
    }),
  ],
});
