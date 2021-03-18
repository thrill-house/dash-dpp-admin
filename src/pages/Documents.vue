<script>
import { capitalize, filter, head, keys, map, startsWith } from "lodash-es";

export default {
  name: "documents",
  computed: {
    contractId() {
      return this.$route.params.contractId;
    },
    document() {
      return this.$route.params.document;
    },
    documents() {
      return map(this.$store.getters[`App/${this.document}/all`]);
    },
    rows() {
      return map(this.documents, (document) => {
        return { ...document, actions: null };
      });
    },
    columns() {
      return map(
        filter(
          keys(head(this.rows)),
          (key) => key === "$id" || !startsWith(key, "$")
        ),
        (field) => ({
          name: field,
          label: capitalize(field),
          field: field,
          sortable: true,
          align: "left",
        })
      );
    },
  },
};
</script>

<template>
  <q-page>
    <q-table
      title="Documents"
      :rows="rows"
      :columns="columns"
      selection="single"
      row-key="$id"
    >
      <template v-slot:body-cell-actions="scope">
        <q-td auto-width>
          <q-btn-group outline>
            <q-btn
              :to="`/contract/${contractId}/${document}/replace/${scope.key}`"
              icon="edit"
              text-color="black"
            />
            <q-btn
              :to="`/contract/${contractId}/${document}/delete/${scope.key}`"
              icon="delete"
              text-color="negative"
            />
          </q-btn-group>
        </q-td>
      </template>
    </q-table>
  </q-page>
</template>