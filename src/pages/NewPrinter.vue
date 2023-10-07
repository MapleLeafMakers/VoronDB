<template>
  <q-page padding>
    <PageHeader
      title="Add Your Printer"
      icon="upload"
      caption="Upload a photo, and fill out the form below to add your printer to the database."
    />

    <PrinterForm
      v-if="coreStore.loaded"
      @saved="handleSaved"
      :printer="coreStore.newPrinterPreset"
    />
  </q-page>
</template>

<script>
import PageHeader from "components/PageHeader.vue";
import PrinterForm from "components/PrinterForm.vue";
import { useCoreStore } from "stores/core";
import { mapStores } from "pinia";

export default {
  name: "NewPrinter",
  components: { PrinterForm, PageHeader },
  computed: {
    ...mapStores(useCoreStore),
  },
  methods: {
    handleSaved() {
      this.$router.push("/my-printers");
    },
  },
  data() {
    return {};
  },
};
</script>
