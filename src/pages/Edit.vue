<script>
import { mapState } from "vuex";

export default {
  name: "edit",
  computed: {
    document() {
      // this.documents
      return this.documents[this.$route.id];
    },
    ...mapState({
      documents: "documents",
    }),
  },
};
</script>

<template>
  <q-page>
    <textarea class="h-full w-full -mb-16 text-dark" v-model="document" />
    <!-- <button
      @click="saveDocument(document, field)"
      class="button button-confirm absolute right-4"
    >
      Save changes
    </button> -->
  </q-page>
</template>