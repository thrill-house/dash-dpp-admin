<script>
import { mapGetters } from "vuex";
import { map, pickBy, startsWith } from "lodash-es";
import numeral from "numeral";
import Ajv from "ajv";

export default {
  name: "edit",
  data: () => ({
    content: "",
  }),
  created() {
    this.content = this.filteredDocument;
  },
  computed: {
    id() {
      return this.$route.params?.id;
    },
    document() {
      return this.$route.params.document;
    },
    getDocument() {
      return this.$store.getters[`App/${this.document}/one`] !== undefined
        ? this.$store.getters[`App/${this.document}/one`]
        : null;
    },
    loadedDocument() {
      if (this.getDocument) {
        const document = this.getDocument(this.id);

        return document;
      }

      return null;
    },
    filteredDocument() {
      if (this.loadedDocument) {
        const filtered = pickBy(
          this.loadedDocument,
          (item, key) => !startsWith(key, "$")
        );
        const documentJson = JSON.stringify(filtered, null, 2);

        return documentJson;
      }

      return null;
    },
    contentSize() {
      const encoded = new TextEncoder().encode(this.content);
      return numeral(encoded.length).format("0.[00] b");
    },
    contentJson() {
      try {
        const result = JSON.parse(this.content);

        return { result, errors: [] };
      } catch (e) {
        return {
          result: false,
          errors: ["Content provided is not valid JSON."],
        };
      }
    },
    contentValid() {
      const result = this.validateDocument(
        this.document,
        this.contentJson.result
      );

      return result;
    },
    contentError() {
      let errors = [];

      if (!this.contentJson.result) {
        errors = [...errors, ...this.contentJson.errors];
      }

      if (!this.contentValid.result) {
        console.log(this.contentValid.errors);
        errors = [
          ...errors,
          ...map(this.contentValid.errors, (error) => JSON.stringify(error)),
        ];
      }

      return errors.join(", ");
    },
    ...mapGetters({
      schemas: "schemas",
    }),
  },
  methods: {
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
  },
  watch: {
    filteredDocument(newDocument) {
      this.content = newDocument;
    },
    content(newContent, oldContent) {
      console.log({ newContent, oldContent });
    },
  },
};
</script>

<template>
  <q-page padding>
    <q-table grid hide-pagination :rows="[loadedDocument]" row-key="$id" />
    <q-input
      v-model="content"
      autogrow
      filled
      counter
      clearable
      label="Document"
      spellcheck="false"
      type="textarea"
      :error="!!contentError"
      :error-message="contentError"
      :input-style="{ fontFamily: `monospace` }"
    >
      <template v-slot:counter>
        {{ contentSize }}
      </template>
    </q-input>
    <!-- <button
      @click="saveDocument(document, field)"
      class="button button-confirm absolute right-4"
    >
      Save changes
    </button> -->
  </q-page>
</template>