<template>
  <q-page padding>
    <div class="row flex items-center q-mb-sm">
      <q-icon class="q-mr-md" size="xl" name="upload"></q-icon>
      <div>
        <span class="text-h4">Update Your Printer</span>
        <p class="q-mb-none">Update your printer using the form below</p>
      </div>
    </div>
    <PrinterForm
      v-if="coreStore.loaded && printer"
      :printer="printer"
      @saved="handleSaved"
    />
  </q-page>
</template>

<script>
import { mapStores } from "pinia";
import { useCoreStore } from "stores/core";
import PrinterForm from "../components/PrinterForm.vue";
export default {
  name: "UpdatePrinter",
  components: { PrinterForm },
  async mounted() {
    this.printer = { ...this.initialData };
  },
  props: {
    initialData: { required: true },
  },
  data() {
    return {
      printer: null,
    };
  },
  methods: {
    handleSaved(printer) {
      this.coreStore.updatePrinter(printer);
      this.$router.push("/my-printers");
    },
  },
  computed: {
    ...mapStores(useCoreStore),
  },
};
</script>
