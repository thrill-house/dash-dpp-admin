import { clone, filter, keys, map, startsWith, zipObject } from "lodash-es";
import { createStore } from "vuex";

import VuexDashDpp from "vuex-dash-dpp";

export default createStore({
  state() {
    return {
      contract: null,
      contractId: process.env.VUE_APP_CONTRACT,
      documents: [],
      identityId: process.env.VUE_APP_IDENTITY,
      mnemonic: process.env.VUE_APP_MNEMONIC,
      network: process.env.VUE_APP_NETWORK,
    };
  },
  getters: {
    schemas: (state) => {
      const contract = state.contract;

      if (contract) {
        return zipObject(
          keys(contract.documents),
          map(contract.documents, (document) => {
            const adjustedDocument = clone(document);

            if (adjustedDocument.required) {
              adjustedDocument.required = filter(
                adjustedDocument.required,
                (required) => !startsWith(required, "$")
              );
            }

            return {
              ...adjustedDocument,
              definitions: { ...contract.definitions },
            };
          })
        );
      }

      return null;
    },
  },
  mutations: {
    contract: (state, payload) => {
      state.contract = payload;
    },
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
    network: (state, payload) => {
      state.network = payload;
    },
  },
  actions: {
    init: async ({ dispatch, state }) => {
      const { contractId, identityId, mnemonic, network } = state;

      if (identityId && mnemonic && contractId && network) {
        await dispatch("setContractId", contractId);
        await dispatch("setIdentityId", identityId);
        await dispatch("setMnemonic", mnemonic);
        await dispatch("setNetwork", network);

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

        await dispatch("setContract", contract);
        await dispatch("setDocuments", documents);
      }
    },

    setContract: async ({ commit }, payload) => {
      commit("contract", payload);
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
    setNetwork: async ({ commit }, payload) => {
      commit("network", payload);
    },
  },
  plugins: [
    new VuexDashDpp({
      namespace: "App",
      subscribeToFrom: [
        {
          contractId: "contractId",
          documents: "documents",
          identityId: "identityId",
          mnemonic: "mnemonic",
          network: "network",
        },
        ["contractId", "documents", "identityId", "mnemonic", "network"],
      ],
    }),
  ],
});
