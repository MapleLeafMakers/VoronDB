<template>
  <q-page padding>
    <PageHeader
      title="Add Your Printer"
      icon="upload"
      caption="Upload a photo, and fill out the form below to add your printer to the database."
    />

    <PrinterForm v-if="coreStore.loaded" @saved="handleSaved" />
  </q-page>
</template>

<script>
import PrinterForm from "components/PrinterForm.vue";
import { useCoreStore } from "stores/core";
import { mapStores } from "pinia";

export default {
  name: "NewPrinter",
  components: { PrinterForm },

  computed: {
    ...mapStores(useCoreStore),
  },
  methods: {
    handleSaved() {
      this.$router.push("/my-printers");
    },
  },
  data() {
    return {
      printer: {},
    };
  },
};
</script>
