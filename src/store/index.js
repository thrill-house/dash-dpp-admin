import { createStore } from "vuex";

import VuexDashDpp from "vuex-dash-dpp";

export default createStore({
  state() {
    return {
      identityId: process.env.VUE_APP_GAME_IDENTITY,
      mnemonic: process.env.VUE_APP_GAME_MNEMONIC,
    };
  },
  mutations: {
    identityId: (state, payload) => {
      state.identityId = payload;
    },
    mnemonic: (state, payload) => {
      state.mnemonic = payload;
    },
  },
  actions: {
    init: async ({ dispatch, state }) => {
      const { identityId, mnemonic } = state;

      if (identityId && mnemonic) {
        await dispatch("setIdentityId", identityId);
        await dispatch("setMnemonic", mnemonic);
        await dispatch("App/all");
      }
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
      network: process.env.VUE_APP_GAME_NETWORK,
      contractId: process.env.VUE_APP_GAME_CONTRACT,
      identityId: process.env.VUE_APP_GAME_IDENTITY,
      documents: ["Sockets", "Abilities", "Trees", "Eras", "Emotions"],
      namespace: "App",
      subscribeToFrom: [
        { identityId: "identityId", mnemonic: "mnemonic" },
        ["identityId", "mnemonic"],
      ],
    }),
  ],
});
